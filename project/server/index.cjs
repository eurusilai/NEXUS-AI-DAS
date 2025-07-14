const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Get absolute path to the dist directory
const distPath = path.resolve(__dirname, '../../dist');
console.log('Serving static files from:', distPath);

// Serve static files from the dist directory
app.use(express.static(distPath, { index: false }));

// API routes
let latestDashboardData = null;

// HTTP API endpoint to receive dashboard data from NinjaTrader
app.post('/api/dashboard-data', (req, res) => {
  latestDashboardData = req.body;
  // Broadcast to all WebSocket clients
  if (wss) {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(latestDashboardData));
      }
    });
  }
  res.status(200).json({ status: 'ok' });
});

// HTTP API endpoint to get the latest dashboard data
app.get('/api/dashboard-data', (req, res) => {
  res.json(latestDashboardData || {});
});

// Handle client-side routing - return index.html for all other GET requests
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  // Send the latest data immediately on connection
  if (latestDashboardData) {
    ws.send(JSON.stringify(latestDashboardData));
  }
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`API & WebSocket server listening on http://localhost:${PORT}`);
}); 