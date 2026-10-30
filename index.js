import express from 'express';
import { startWhatsApp, state, logout } from './whatsapp.js';

const app = express();
const PORT = Number(process.env.PORT || 10000);

app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, x-panel-token');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});

app.get('/', (_req, res) => {
  res.json({ service: 'dentalia-wa-service', status: state.status, ok: true });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime(), status: state.status });
});

app.get('/api/status', (_req, res) => {
  res.json({
    status: state.status,
    phone: state.phone,
    name: state.name,
    connectedAt: state.connectedAt,
    lastError: state.lastError,
    received: state.receivedCount,
    sent: state.sentCount,
  });
});

app.post('/api/logout', async (req, res) => {
  const token = req.headers['x-panel-token'] || '';
  const expected = process.env.WA_PANEL_TOKEN || '';
  if (expected && token !== expected) {
    return res.status(401).json({ error: 'Acesso negado' });
  }
  await logout();
  return res.json({ ok: true });
});

app.use((_req, res) => res.status(404).json({ error: 'Rota nao encontrada' }));

app.listen(PORT, () => {
  console.log(`[http] ouvindo na porta ${PORT}`);
  startWhatsApp().catch((err) => console.error('[wa] start', err.message));
});
