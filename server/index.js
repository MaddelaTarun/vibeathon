import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { ExpeditorEngine } from './expeditor.js';
import { TelemetrySimulator } from './telemetry.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3001;

// Initialize the decision engine
const expeditor = new ExpeditorEngine();
const telemetry = new TelemetrySimulator();

// Store connected clients
const clients = new Set();

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.add(ws);

  // Send initial state
  ws.send(
    JSON.stringify({
      type: 'stations',
      payload: expeditor.getStations(),
    })
  );

  ws.send(
    JSON.stringify({
      type: 'tickets',
      payload: expeditor.getTickets(),
    })
  );

  ws.send(
    JSON.stringify({
      type: 'metrics',
      payload: expeditor.getMetrics(),
    })
  );

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
});

// Broadcast to all connected clients
function broadcast(type, payload) {
  const message = JSON.stringify({ type, payload });
  clients.forEach((client) => {
    if (client.readyState === 1) {
      // OPEN
      client.send(message);
    }
  });
}

// Main simulation loop
setInterval(() => {
  // Update telemetry
  const currentTelemetry = telemetry.generateTelemetry(
    expeditor.getStations(),
    expeditor.getTickets()
  );

  // Run decision engine
  const actions = expeditor.analyze();

  // Apply decisions
  actions.forEach((action) => {
    expeditor.applyAction(action);
    broadcast('action', action);
  });

  // Update tickets
  expeditor.updateTickets();

  // Broadcast updates
  broadcast('stations', expeditor.getStations());
  broadcast('tickets', expeditor.getTickets());
  broadcast('metrics', expeditor.getMetrics());
  broadcast('telemetry', currentTelemetry);
}, 1000); // Update every second

// Periodically add new tickets (simulating orders)
setInterval(() => {
  const newTicket = expeditor.addRandomTicket();
  if (newTicket) {
    console.log(`New ticket: #${newTicket.order_number}`);
  }
}, 5000); // New ticket every 5 seconds

// API endpoints
app.get('/api/status', (req, res) => {
  res.json({
    stations: expeditor.getStations(),
    tickets: expeditor.getTickets(),
    metrics: expeditor.getMetrics(),
  });
});

app.get('/api/stress-test', (req, res) => {
  const count = parseInt(req.query.count) || 50;
  console.log(`Starting stress test: ${count} tickets`);

  for (let i = 0; i < count; i++) {
    expeditor.addRandomTicket();
  }

  res.json({ message: `Added ${count} tickets`, success: true });
});

server.listen(PORT, () => {
  console.log(`🚀 Kitchen-Pulse server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server running on ws://localhost:${PORT}/ws`);
  console.log(`\n🧠 Autonomous Expeditor Engine: ACTIVE`);
  console.log(`📊 Telemetry Simulator: ACTIVE`);
});
