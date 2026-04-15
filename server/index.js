import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { ExpeditorEngine } from './expeditor.js';
import { TelemetrySimulator } from './telemetry.js';
import ChefManager from './chefs.js';
import MenuManager from './menu.js';
import OrderManager from './orders.js';
import ReviewManager from './reviews.js';
import SessionManager from './sessions.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3001;

// Initialize the decision engine and managers
const expeditor = new ExpeditorEngine();
const telemetry = new TelemetrySimulator();
const chefManager = new ChefManager();
const menuManager = new MenuManager();
const sessionManager = new SessionManager();
const orderManager = new OrderManager(expeditor, chefManager);
const reviewManager = new ReviewManager(chefManager);

// Store connected clients with metadata
const clients = new Map(); // WebSocket -> { role, tableCode, sessionId }
let currentAiBriefing = "Initializing AI Intelligence...";

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.set(ws, { role: 'guest' });

  // Send initial state
  ws.send(JSON.stringify({ type: 'stations', payload: expeditor.getStations() }));
  ws.send(JSON.stringify({ type: 'metrics', payload: expeditor.getMetrics() }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'register') {
        clients.set(ws, { 
          role: data.role, 
          tableCode: data.tableCode, 
          sessionId: data.sessionId 
        });
        console.log(`Registered client: ${data.role} for table ${data.tableCode}`);
      }
    } catch (e) {
      console.error('Error parsing WS message:', e);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
});

// Broadcast to connected clients
function broadcast(type, payload, targetTableCode = null) {
  const message = JSON.stringify({ type, payload });
  clients.forEach((meta, client) => {
    if (client.readyState === 1) { // OPEN
      if (!targetTableCode || meta.tableCode === targetTableCode) {
        client.send(message);
      }
    }
  });
}

// AI Briefing Generator (Groq)
async function updateAiBriefing() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    currentAiBriefing = "Chef, please provide a Groq API Key to enable Live AI Situation Reports.";
    return;
  }

  const stations = expeditor.getStations();
  const metrics = expeditor.getMetrics();
  const criticalStations = stations.filter(s => s.stress_level > 85);

  const prompt = `
    You are a world-class Executive Chef and Kitchen Optimizer.
    Analyze this real-time kitchen data:
    - Stations at Critical Stress: ${criticalStations.map(s => s.name).join(', ') || 'None'}
    - Total Profit at Risk: $${metrics.total_profit_at_risk.toFixed(2)}
    - Average Delay: ${metrics.average_delay.toFixed(1)}m
    - Autonomous Actions taken: ${metrics.autonomous_actions}

    Provide a concise (max 2 sentences) situation report and 1 strategic advice. 
    Tone: Authoritative, professional, direct.
    Format: "REPORT: [summary] ADVICE: [strategy]"
  `;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [{ role: "system", content: "You are the Head Chef's digital brain." }, { role: "user", content: prompt }],
        max_tokens: 150
      })
    });

    const data = await response.json();
    if (data.choices && data.choices[0]) {
      currentAiBriefing = data.choices[0].message.content;
    }
  } catch (error) {
    console.error('Error calling Groq API:', error);
    currentAiBriefing = "System communication error. Monitoring manually.";
  }
}

// Main simulation loop
setInterval(() => {
  const currentTelemetry = telemetry.generateTelemetry(expeditor.getStations(), expeditor.getTickets());
  const actions = expeditor.analyze();

  actions.forEach((action) => {
    expeditor.applyAction(action);
    broadcast('action', action);
  });

  expeditor.updateTickets();
  orderManager.syncWithExpeditor();
  
  currentTelemetry.ai_briefing = currentAiBriefing;

  broadcast('stations', expeditor.getStations());
  broadcast('tickets', expeditor.getTickets());
  broadcast('metrics', expeditor.getMetrics());
  broadcast('telemetry', currentTelemetry);
}, 1000);

updateAiBriefing();
setInterval(updateAiBriefing, 30000);

// Random tickets logic (disabled if real orders are active)
let autoTicketsEnabled = true;
let ticketInterval = 8000;

function addTicketWithInterval() {
  if (autoTicketsEnabled) expeditor.addRandomTicket();
}

setInterval(addTicketWithInterval, ticketInterval);

// Stress test endpoint - temporarily speeds up ticket generation
app.post('/api/stress-test/start', (req, res) => {
  const { ticketsPerMinute = 50 } = req.body;
  ticketInterval = Math.floor(60000 / ticketsPerMinute);
  autoTicketsEnabled = true;
  console.log(`🔥 Stress test activated: ${ticketsPerMinute} tickets/min`);
  res.json({ success: true, interval: ticketInterval });
});

app.post('/api/stress-test/stop', (req, res) => {
  ticketInterval = 8000;
  console.log('✅ Stress test deactivated');
  res.json({ success: true });
});

// --- REST API ROUTES ---

app.post('/api/session', (req, res) => {
  const { name, role, tableNumber } = req.body;
  const session = sessionManager.createSession(name, role, tableNumber);
  res.json(session);
});

app.get('/api/menu', (req, res) => {
  res.json({
    items: menuManager.getMenuGrouped(),
    cuisineLabels: chefManager.getCuisineLabels()
  });
});

app.get('/api/chefs', (req, res) => {
  res.json({
    chefs: chefManager.getChefsGrouped(),
    cuisineLabels: chefManager.getCuisineLabels()
  });
});

app.post('/api/orders', (req, res) => {
  const { tableCode, items, chefId } = req.body;
  const order = orderManager.createOrder(tableCode, items, chefId);
  autoTicketsEnabled = false; // Stop random noise when real orders start
  broadcast('order_update', order, tableCode);
  res.json(order);
});

app.get('/api/orders/table/:code', (req, res) => {
  res.json(orderManager.getOrdersByTableCode(req.params.code));
});

app.get('/api/orders/all', (req, res) => {
  res.json(orderManager.getAllOrders());
});

app.post('/api/reviews', (req, res) => {
  const { orderId, chefId, ratings, comment } = req.body;
  const review = reviewManager.createReview(orderId, chefId, ratings, comment);
  if (review) {
    res.json({ success: true, review });
  } else {
    res.status(400).json({ error: 'Review already exists for this order' });
  }
});

app.post('/api/orders/:id/serve', (req, res) => {
  const success = orderManager.serveOrder(req.params.id);
  res.json({ success });
});

server.listen(PORT, () => {
  console.log(`🚀 Kitchen-Pulse running on http://localhost:${PORT}`);
});
