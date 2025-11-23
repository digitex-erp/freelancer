import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

// Import the central handler
import apiHandler from './api/index.ts';
import fetchLeads from './api/cron/fetch-leads.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080; // Google Cloud Run expects 8080

// Middleware to parse JSON bodies (Vercel did this automatically)
app.use(express.json());

// API Routes Adapter
// We wrap the handler to make it compatible with Express
const adaptHandler = (handler) => async (req, res) => {
  try {
    // Ensure query params are accessible
    req.query = req.query || {};
    await handler(req, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
};

// --- API Routes ---

// Cron Job Route
app.all('/api/cron/fetch-leads', adaptHandler(fetchLeads));

// Central Handler Route (Legacy Vercel structure)
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
// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Bell24h AI Agent (Google Cloud Edition) running on port ${PORT}`);
});