
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

const PORT = process.env.PORT || 8080;
const LOG_FILE = path.resolve('./visitor_log.txt');


// Choose the ONE correct Angular build output directory:

const candidates = [
    path.resolve(__dirname, '../frontend/dist/browser'),
    path.resolve(__dirname, '../frontend/dist/frontend'),
    path.resolve(__dirname, 'dist/frontend'),
];

const FRONTEND_DIR = candidates.find(p => {
    try { return require('fs').existsSync(path.join(p, 'index.html')); }
    catch { return false; }
});


// ensure log file exists
fs.closeSync(fs.openSync(LOG_FILE, 'a'));

app.use(cors({ origin: ['http://0.0.0.0:4200'], credentials: false }));
app.use(express.json({ limit: '256kb' }));
app.use(morgan('tiny'));

function nowIST() {
    const now = new Date();
    // IST = UTC+5:30 → 19800000 ms
    const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    return ist.toISOString().replace('Z', '+05:30');
}

function clientIp(req) {
    const xff = req.headers['x-forwarded-for'];
    if (xff && typeof xff === 'string') return xff.split(',')[0].trim();
    return req.socket?.remoteAddress || '-';
}

function appendLog(line) {
    fs.appendFile(LOG_FILE, line, { encoding: 'utf-8' }, (err) => {
        if (err) console.error('Failed writing log:', err);
    });
}

function logEvent(req, event, { tag = '-', action = '-', details = {} } = {}) {
    const ts = nowIST();
    const ip = clientIp(req);
    const ua = (req.headers['user-agent'] || '-').replace(/\s+/g, ' ').trim();
    const ref = (req.headers.referer || '-').toString();
    const det = Object.keys(details).length ? JSON.stringify(details) : '-';

    const line = [
        ts, event, ip, tag, action, det, ua, ref
    ].join('\t') + os.EOL;

    appendLog(line);
}

// --- health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// --- when page is opened
app.post('/track/open', (req, res) => {
    const { tag = '-' } = req.body || {};
    logEvent(req, 'PAGE_OPEN', { tag });
    res.json({ ok: true });
});

// --- when any action happens (button click, form submit, etc.)
app.post('/track/action', (req, res) => {
    const { tag = '-', action = '-', details = {} } = req.body || {};
    logEvent(req, 'ACTION', { tag, action, details });
    res.json({ ok: true });
});


// ---- serve Angular build ----

if (FRONTEND_DIR) {
    app.use(express.static(FRONTEND_DIR));
    app.get('*', (_req, res) => res.sendFile(path.join(FRONTEND_DIR, 'index.html')));
    console.log(`Serving frontend from ${FRONTEND_DIR}`);
} else {
    console.warn('Frontend build not found. API-only mode.');
}


// SPA fallback (catch‑all) AFTER APIs and static:
app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_PATH, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend ready on http://0.0.0.0:${PORT}`);
    console.log(`Serving frontend (if built) from ../frontend/dist/browser`);
    console.log(`Logs → ${LOG_FILE}`);
});