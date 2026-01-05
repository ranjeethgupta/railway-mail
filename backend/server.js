
// server.js (ESM)
import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 3010;

// Keep logs next to the app to avoid CWD surprises
const LOG_FILE = path.resolve(__dirname, 'visitor_log.txt');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Healthcheck (useful for Railway)
app.get('/health', (_req, res) => {
    res.status(200).send({
        status: 'ok',
        time: new Date().toISOString(),
        host: os.hostname(),
    });
});

// Choose the ONE correct frontend build directory.
// Update these candidates to match your framework and layout.

const candidates = [
    path.resolve(__dirname, '..', 'frontend', 'dist', 'browser'), // Angular
    path.resolve(__dirname, '..', 'frontend', 'dist'),            // React/Vite
    path.resolve('/app', 'dist', 'frontend'),               // if you copy build here
];


const FRONTEND_DIR = candidates.find(p => fs.existsSync(path.join(p, 'index.html')));

// Static serving (SPA)
if (FRONTEND_DIR) {
    app.use(express.static(FRONTEND_DIR));
    app.get('*', (_req, res) => {
        res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
    });
    console.log(`✅ Serving frontend from: ${FRONTEND_DIR}`);
} else {
    console.warn('⚠️ Frontend build not found. Running in API-only mode.');
}

// Simple example API that logs visitors
app.post('/api/visit', (req, res) => {
    const entry = {
        time: new Date().toISOString(),
        ip: req.ip,
        ua: req.headers['user-agent'],
        payload: req.body ?? null,
    };

    try {
        fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n', 'utf8');
        res.status(200).json({ ok: true });
    } catch (err) {
        console.error('Failed to write log:', err);
        res.status(500).json({ ok: false, error: 'Failed to write log' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend ready on http://0.0.0.0:${PORT}`);
    console.log(`Logs → ${LOG_FILE}`);
});