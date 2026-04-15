import { useState, useEffect } from 'react';
import { Station, Ticket, AutonomousAction, SystemMetrics, Telemetry } from './models/types';
import StationMonitor from './components/StationMonitor';
import MarginTracker from './components/MarginTracker';
import ActionsLog from './components/ActionsLog';
import MetricsDashboard from './components/MetricsDashboard';
import Header from './components/Header';
import OnboardingTour from './components/OnboardingTour';

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
  const [showTour, setShowTour] = useState(true);

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
    <div className="min-h-screen bg-grilli-black text-grilli-text font-sans antialiased selection:bg-grilli-gold selection:text-black pb-24 relative overflow-x-hidden">
      {showTour && <OnboardingTour onClose={() => setShowTour(false)} />}
      
      {/* Dynamic Background Effects */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-grilli-gold/5 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-grilli-gold/5 blur-[120px] rounded-full animate-pulse delay-700"></div>
      </div>

      <Header connected={connected} />

      <main className="max-w-6xl mx-auto px-8 pt-16 space-y-32 relative z-10">
        {/* Hero Section */}
        <section className="text-center space-y-6 pt-12 animate-fade-in">
          <div className="inline-block px-4 py-1.5 border border-grilli-gold/20 bg-grilli-surface/50 rounded-full">
            <span className="text-[10px] font-bold text-grilli-gold uppercase tracking-[0.4em]">Autonomous Command Center</span>
          </div>
          <h2 className="text-6xl md:text-7xl font-serif font-bold text-grilli-text leading-[1.1]">
            {totalAtRisk > 250 
              ? <span className="text-status-critical italic">Critical Margin Failure Detected.</span>
              : totalAtRisk > 100 
                ? <span className="text-status-warning italic">High Stress. Orchestrating Reallocation.</span>
                : <span className="text-grilli-gold italic">Service Operating at Peak Efficiency.</span>}
          </h2>
          <p className="text-grilli-muted max-w-2xl mx-auto text-sm leading-relaxed font-medium">
            Kitchen-Pulse analyzes sub-second telemetry to mitigate labor bottlenecks and protect real-time profit margins.
          </p>
        </section>

        {/* Core Operational Layer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Station Grid */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between border-b border-grilli-border pb-6">
              <div className="space-y-1">
                <h3 className="text-2xl font-serif font-bold text-grilli-gold italic tracking-tight">Station Capacity Monitor</h3>
                <p className="text-xs text-grilli-muted font-medium uppercase tracking-widest opacity-60">Real-time Station Telemetry</p>
              </div>
              <div className="flex items-center space-x-3">
                 <div className="w-2 h-2 rounded-full bg-status-optimal animate-pulse"></div>
                 <span className="text-[10px] font-bold text-grilli-muted uppercase">Engine Online</span>
              </div>
            </div>
            <StationMonitor stations={stations} />
          </div>

          {/* Right: Primary Metrics Dashboard */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-6">
              <div className="border-b border-grilli-border pb-6">
                <h3 className="text-2xl font-serif font-bold text-grilli-gold italic tracking-tight">Vitals</h3>
                <p className="text-xs text-grilli-muted font-medium uppercase tracking-widest opacity-60">Strategic Performance Indices</p>
              </div>
              <MetricsDashboard metrics={metrics} telemetry={telemetry} />
            </div>
          </div>
        </div>

        {/* Live Operations & AI Logic */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 border-t border-grilli-border/50 pt-24">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-3">
              <h3 className="text-3xl font-serif font-bold text-grilli-text italic">Margin Leakage</h3>
              <p className="text-sm text-grilli-muted font-medium leading-relaxed">Orders currently delayed beyond target thresholds, impacting the bottom line.</p>
            </div>
            <MarginTracker tickets={tickets} />
          </div>

          <div className="lg:col-span-3 space-y-8 bg-grilli-surface/30 p-10 rounded-xl border border-grilli-border/30">
            <div className="space-y-3">
               <div className="flex items-center justify-between">
                <h3 className="text-3xl font-serif font-bold text-grilli-text italic">Intelligence Feed</h3>
                <button className="text-[10px] text-grilli-gold font-bold uppercase tracking-widest border border-grilli-gold/30 px-3 py-1 rounded hover:bg-grilli-gold/10 transition-colors">Clear Log</button>
               </div>
              <p className="text-sm text-grilli-muted font-medium leading-relaxed">Autonomous interventions executed by the Expeditor Engine.</p>
            </div>
            <ActionsLog actions={actions} />
          </div>
        </div>

        <button 
          onClick={() => setShowTour(true)}
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-grilli-gold flex items-center justify-center text-grilli-black shadow-premium hover:scale-110 transition-transform z-40"
          title="System Help"
        >
          <span className="text-xl font-bold font-serif italic">?</span>
        </button>
      </main>

      <footer className="max-w-6xl mx-auto px-8 py-24 text-center border-t border-grilli-border/30 mt-32">
        <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-grilli-muted opacity-40">Kitchen-Pulse Autonomous Engine — Built for Precision Operations</span>
      </footer>
    </div>
  );
}

export default App;
