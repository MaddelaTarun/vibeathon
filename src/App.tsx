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
    const ws = new WebSocket('ws://localhost:3001/ws');

    ws.onopen = () => {
      console.log('Connected to Kitchen Assistant server');
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
      console.log('Disconnected from Kitchen Assistant server');
      setConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  const totalAtRisk = tickets
    .filter((t) => t.status !== 'completed' && t.status !== 'cancelled' && t.delay_minutes > 5)
    .reduce((sum, t) => sum + t.margin_value, 0);

  return (
    <div className="min-h-screen bg-bistro-bg text-bistro-text font-sans antialiased selection:bg-bistro-accent selection:text-white pb-24">
      <Header connected={connected} />

      <main className="max-w-4xl mx-auto px-6 pt-16 space-y-24">
        {/* Heartbeat Status */}
        <section className="text-center space-y-4">
          <span className="text-[10px] font-bold text-bistro-muted uppercase tracking-[0.3em]">Kitchen Heartbeat</span>
          <h2 className="text-5xl font-serif font-bold text-bistro-text italic leading-tight">
            {totalAtRisk > 200 
              ? "Service is struggling, but the AI is intervening." 
              : totalAtRisk > 50 
                ? "The rush is building. We are tracking two delays." 
                : "The kitchen is in perfect harmony."}
          </h2>
        </section>

        {/* Vital Metrics */}
        <MetricsDashboard metrics={metrics} telemetry={telemetry} />

        {/* Section: Station Status */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-bistro-border pb-4">
            <h3 className="text-lg font-serif font-bold italic">Station Performance</h3>
            <span className="text-[10px] font-bold text-bistro-muted uppercase tracking-widest">Real-time Telemetry</span>
          </div>
          <StationMonitor stations={stations} />
        </section>

        {/* Section: Live Operations (Merging Risk and AI) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-16">
          <div className="md:col-span-2 space-y-8">
            <div className="space-y-2">
              <h3 className="text-xl font-serif font-bold text-status-critical italic">Critical Delays</h3>
              <p className="text-xs text-bistro-muted font-medium">Profit currently at risk due to wait times.</p>
            </div>
            <MarginTracker tickets={tickets} />
          </div>

          <div className="md:col-span-3 space-y-8">
            <div className="space-y-2">
              <h3 className="text-xl font-serif font-bold text-bistro-text italic">AI Intelligence Feed</h3>
              <p className="text-xs text-bistro-muted font-medium">Automatic adjustments made by the Orchestrator.</p>
            </div>
            <ActionsLog actions={actions} />
          </div>
        </div>

        {/* Section: Team */}
        <section className="pt-12 border-t border-bistro-border space-y-4">
          <div className="flex items-center space-x-4">
            <span className="text-[10px] font-bold text-bistro-muted uppercase tracking-widest">Professional Staff</span>
            <div className="flex-grow border-b border-bistro-border opacity-20"></div>
          </div>
          <LaborBoard stations={stations} />
        </section>
      </main>

      <footer className="max-w-4xl mx-auto px-6 pt-24 text-center opacity-40">
        <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-bistro-muted">Smart Kitchen Assistant — Version 2.0 Minimalist</span>
      </footer>
    </div>
  );
}

export default App;
