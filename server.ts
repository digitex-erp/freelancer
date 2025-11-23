import basicAuth from 'express-basic-auth';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import apiHandler from './api/index';
import fetchLeads from './api/cron/fetch-leads';

// Load env vars
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Basic Auth Middleware
const user = process.env.AUTH_USER;
const pass = process.env.AUTH_PASS;
if (user && pass) {
  console.log('[Auth] Basic Auth Enabled');
  app.use(basicAuth({
    users: { [user]: pass },
    challenge: true,
    realm: 'Freelancer Agent'
  }));
} else {
  console.warn('[Auth] No AUTH_USER/PASS set. Site is public.');
}
const PORT = process.env.PORT || 8080;

// Middleware to parse JSON bodies
app.use(express.json() as any);

// Wrapper to adapt Express req/res to the async handler style
const adaptHandler = (handler: Function) => async (req: any, res: any) => {
  try {
    // Ensure query params are accessible
    req.query = req.query || {};
    await handler(req, res);
  } catch (err: any) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
};

// --- API Routes ---

// Cron Job Route
app.all('/api/cron/fetch-leads', adaptHandler(fetchLeads));

// Central Handler Route
app.all('/api/handler', adaptHandler(apiHandler));

// Specific API Routes (Mapped to the central handler logic)
app.get('/api/leads', (req, res) => { req.query.route = 'leads'; adaptHandler(apiHandler)(req, res); });
app.post('/api/analyze', (req, res) => { req.query.route = 'analyze'; adaptHandler(apiHandler)(req, res); });
app.post('/api/pitch', (req, res) => { req.query.route = 'pitch'; adaptHandler(apiHandler)(req, res); });
app.post('/api/send-pitch', (req, res) => { req.query.route = 'send-pitch'; adaptHandler(apiHandler)(req, res); });
app.get('/api/setup-db', (req, res) => { req.query.route = 'setup-db'; adaptHandler(apiHandler)(req, res); });
app.get('/api/export/drafts', (req, res) => { req.query.route = 'export-drafts'; adaptHandler(apiHandler)(req, res); });
app.post('/api/export/send-pitch', (req, res) => { req.query.route = 'export-send-pitch'; adaptHandler(apiHandler)(req, res); });
app.post('/api/export/rescore', (req, res) => { req.query.route = 'export-rescore'; adaptHandler(apiHandler)(req, res); });
app.post('/api/export/classify', (req, res) => { req.query.route = 'export-classify'; adaptHandler(apiHandler)(req, res); });

// --- Frontend Static Serving ---
app.use(express.static(path.join(__dirname, 'dist')) as any);

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Bell24h AI Agent (Cloud Run) running on port ${PORT}`);
});
