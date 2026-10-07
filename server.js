// Server Apex Rush. Jalankan: npm i ws && node server.js
// Pasang di hosting Node (Render/Railway/Fly), lalu isi SERVER di index.html dengan 'wss://domain-anda'.
const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: process.env.PORT || 8080 });
const lb = {};
const top = () => Object.values(lb).sort((a, b) => b.xp - a.xp).slice(0, 50);
wss.on('connection', ws => {
  ws.on('message', d => {
    let m; try { m = JSON.parse(d); } catch { return; }
    if (m.t === 'pos') {
      ws.id = m.id; ws.map = m.m;
      for (const c of wss.clients) if (c !== ws && c.readyState === 1 && c.map === m.m) c.send(d.toString());
    } else if (m.t === 'score') {
      const n = String(m.n || '').slice(0, 14);
      if (n && Number.isFinite(m.xp) && m.xp >= 0) lb[n] = { n, xp: Math.min(m.xp, 1e7) };
      ws.send(JSON.stringify({ t: 'lb', d: top() }));
    } else if (m.t === 'lb') ws.send(JSON.stringify({ t: 'lb', d: top() }));
  });
  ws.on('close', () => {
    for (const c of wss.clients) if (c.readyState === 1) c.send(JSON.stringify({ t: 'bye', id: ws.id }));
  });
});
console.log('Apex Rush server aktif');
