// Simple Express server for Render.com deployment
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// API routes - import the main handler
app.all('/api/*', async (req, res) => {
  try {
    // Dynamically import the API handler
    const handler = await import('./api/index.js');

    // Convert Express req/res to Vercel-style format
    const vercelReq = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      query: req.query
    };

    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => {
        res.json(data);
      },
      send: (data) => {
        res.send(data);
      }
    };

    await handler.default(vercelReq, vercelRes);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Bell24h AI Agent running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
});