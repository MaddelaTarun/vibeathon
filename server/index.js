import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { ExpeditorEngine } from './expeditor.js';
import { TelemetrySimulator } from './telemetry.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3001;

// Initialize the decision engine
const expeditor = new ExpeditorEngine();
const telemetry = new TelemetrySimulator();

// Store connected clients
const clients = new Set();
let currentAiBriefing = "Initializing AI Intelligence...";

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.add(ws);

  // Send initial state
  ws.send(JSON.stringify({ type: 'stations', payload: expeditor.getStations() }));
  ws.send(JSON.stringify({ type: 'tickets', payload: expeditor.getTickets() }));
  ws.send(JSON.stringify({ type: 'metrics', payload: expeditor.getMetrics() }));

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
});

// Broadcast to all connected clients
function broadcast(type, payload) {
  const message = JSON.stringify({ type, payload });
  clients.forEach((client) => {
    if (client.readyState === 1) client.send(message);
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
      console.log('AI Briefing updated:', currentAiBriefing);
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
  
  // Attach current AI briefing to telemetry
  currentTelemetry.ai_briefing = currentAiBriefing;

  broadcast('stations', expeditor.getStations());
  broadcast('tickets', expeditor.getTickets());
  broadcast('metrics', expeditor.getMetrics());
  broadcast('telemetry', currentTelemetry);
}, 1000);

// AI Briefing loop (every 20 seconds)
updateAiBriefing();
setInterval(updateAiBriefing, 20000);

// Random orders
setInterval(() => {
  expeditor.addRandomTicket();
}, 5000);

app.get('/api/stress-test', (req, res) => {
  const count = parseInt(req.query.count) || 50;
  for (let i = 0; i < count; i++) expeditor.addRandomTicket();
  res.json({ message: `Added ${count} tickets`, success: true });
});

server.listen(PORT, () => {
  console.log(`🚀 Kitchen-Pulse running on http://localhost:${PORT}`);
  console.log(`🧠 AI Head Chef Engine: ${process.env.GROQ_API_KEY ? 'ACTIVE' : 'AWAITING KEY'}`);
});
