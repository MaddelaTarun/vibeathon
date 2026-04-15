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

      <main className="container mx-auto px-4 py-8 space-y-10">
        {/* Top Metrics - The Overview */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-command-text">How are we doing right now?</h2>
            <span className="text-xs text-command-muted uppercase tracking-widest">Real-time stats</span>
          </div>
          <MetricsDashboard metrics={metrics} telemetry={telemetry} />
        </section>

        {/* Main Section - The Action */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-command-text">Station Status</h2>
              <p className="text-sm text-command-muted italic">See which parts of the kitchen are the busiest.</p>
            </div>
            <StationMonitor stations={stations} />
          </section>

          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-command-text">Orders at Risk</h2>
              <p className="text-sm text-command-muted italic">Orders that are taking too long and costing you money.</p>
            </div>
            <MarginTracker tickets={tickets} />
          </section>
        </div>

        {/* Intelligence Section - The AI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <section className="lg:col-span-2 space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-command-text">AI Decision Log</h2>
              <p className="text-sm text-command-muted italic">What your AI team is doing to solve problems automatically.</p>
            </div>
            <ActionsLog actions={actions} />
          </section>

          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-command-text">Team Workload</h2>
              <p className="text-sm text-command-muted italic">Where your staff is currently working.</p>
            </div>
            <LaborBoard stations={stations} />
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
