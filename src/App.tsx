import { useState, useEffect } from 'react';
import { Station, Ticket, AutonomousAction, SystemMetrics, Telemetry } from './models/types';
import StationMonitor from './components/StationMonitor';
import MarginTracker from './components/MarginTracker';
import ActionsLog from './components/ActionsLog';
import LaborBoard from './components/LaborBoard';
import MetricsDashboard from './components/MetricsDashboard';
import Header from './components/Header';

function App() {
  const [stations, setStations] = useState<Station[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [actions, setActions] = useState<AutonomousAction[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    total_tickets: 0,
    completed_tickets: 0,
    average_delay: 0,
    total_profit_at_risk: 0,
    autonomous_actions: 0,
    labor_reallocations: 0,
    auto_86_count: 0,
  });
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const ws = new WebSocket('ws://localhost:3001/ws');

    ws.onopen = () => {
      console.log('Connected to Kitchen-Pulse server');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'stations':
          setStations(data.payload);
          break;
        case 'tickets':
          setTickets(data.payload);
          break;
        case 'action':
          setActions((prev) => [data.payload, ...prev].slice(0, 50));
          break;
        case 'metrics':
          setMetrics(data.payload);
          break;
        case 'telemetry':
          setTelemetry(data.payload);
          break;
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from Kitchen-Pulse server');
      setConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-command-bg text-command-text font-sans">
      <Header connected={connected} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Metrics Overview */}
        <MetricsDashboard metrics={metrics} telemetry={telemetry} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Station Stress Monitor */}
          <StationMonitor stations={stations} />

          {/* Margin-at-Risk Tracker */}
          <MarginTracker tickets={tickets} />
        </div>

        {/* Secondary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Autonomous Actions Log */}
          <div className="lg:col-span-2">
            <ActionsLog actions={actions} />
          </div>

          {/* Labor Reallocation Board */}
          <LaborBoard stations={stations} />
        </div>
      </main>
    </div>
  );
}

export default App;
