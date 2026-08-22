require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDb } = require('./config/db');
const authRoutes = require('./routes/auth');
const logRoutes = require('./routes/logs');
const goalRoutes = require('./routes/goals');
const skillRoutes = require('./routes/skills');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(',').map((s) => s.trim())
      : true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'attache' });
});

app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed' || err.status === 400) {
    return res.status(400).json({ message: 'Invalid request.' });
  }
  console.error(err);
  res.status(500).json({ message: 'Unexpected server error.' });
});

async function start() {
  await connectDb();
  const server = app.listen(port, '127.0.0.1', () => {
    console.log(`Attache API listening on http://127.0.0.1:${port}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Set PORT in server/.env to a free port.`);
    } else {
      console.error(err);
    }
    process.exit(1);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
