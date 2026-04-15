import React, { useState, useEffect } from 'react';
import { Station, Ticket, AutonomousAction, SystemMetrics, Telemetry } from '../models/types';
import StationMonitor from '../components/StationMonitor';
import MarginTracker from '../components/MarginTracker';
import ActionsLog from '../components/ActionsLog';
import MetricsDashboard from '../components/MetricsDashboard';
import Header from '../components/Header';
import OnboardingTour from '../components/OnboardingTour';
import { useSession } from '../context/SessionContext';

const ManagerView: React.FC = () => {
  const { logout } = useSession();
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
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Determine WebSocket URL based on environment
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const wsUrl = isDev
      ? 'ws://localhost:3001'  // Development: direct connection to server
      : `${protocol}//${window.location.host}`; // Production: same host

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('✓ WebSocket connected');
      setConnected(true);
      ws.send(JSON.stringify({ type: 'register', role: 'manager' }));
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

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const totalAtRisk = tickets
    .filter((t) => t.status !== 'completed' && t.status !== 'cancelled' && t.delay_minutes > 5)
    .reduce((sum, t) => sum + t.margin_value, 0);

  return (
    <div className="min-h-screen bg-grilli-black text-grilli-text font-sans antialiased pb-24 relative overflow-x-hidden">
      {showTour && <OnboardingTour onClose={() => setShowTour(false)} />}
      
      <Header connected={connected} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 space-y-16 sm:space-y-32 relative z-10">
        {/* Hero Section */}
        <section className="text-center space-y-4 sm:space-y-6 animate-fade-in">
          <div className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 border border-grilli-gold/20 bg-grilli-surface/50 rounded-full">
            <span className="text-[9px] sm:text-[10px] font-bold text-grilli-gold uppercase tracking-[0.3em] sm:tracking-[0.4em]">Autonomous Command Center</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-grilli-text leading-[1.1] px-4">
            {totalAtRisk > 250 
              ? <span className="text-status-critical italic">Critical Margin Failure Detected.</span>
              : totalAtRisk > 100 
                ? <span className="text-status-warning italic">High Stress. Orchestrating Reallocation.</span>
                : <span className="text-grilli-gold italic">Service Operating at Peak Efficiency.</span>}
          </h2>

          {/* AI Situation Briefing */}
          <div className="mt-8 sm:mt-12 p-6 sm:p-8 bg-grilli-surface/50 border border-grilli-gold/20 rounded-xl max-w-4xl mx-auto relative overflow-hidden group">
            <div className="absolute top-2 sm:top-0 right-2 sm:right-0 p-2 sm:p-3">
              <span className="text-[7px] sm:text-[8px] font-bold text-grilli-gold uppercase tracking-[0.3em] sm:tracking-[0.4em] animate-pulse">Live AI Intelligence</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-grilli-gold/30 flex items-center justify-center flex-shrink-0 bg-grilli-black">
                <span className="text-xl sm:text-2xl font-serif italic text-grilli-gold">C</span>
              </div>
              <div className="space-y-2 sm:space-y-3 text-left w-full">
                <h4 className="text-[10px] sm:text-xs font-bold text-grilli-gold uppercase tracking-widest opacity-60">Head Chef's Situation Briefing</h4>
                <p className="text-base sm:text-lg font-serif italic text-grilli-text leading-relaxed">
                  "{telemetry?.ai_briefing || 'Analyzing operational data for strategic insights...'}"
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Operational Layer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between border-b border-grilli-border pb-4 sm:pb-6">
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-grilli-gold italic tracking-tight">Station Capacity Monitor</h3>
                <p className="text-[10px] sm:text-xs text-grilli-muted font-medium uppercase tracking-widest opacity-60">Real-time Station Telemetry</p>
              </div>
            </div>
            <StationMonitor stations={stations} />
          </div>

          <div className="lg:col-span-4 space-y-6 sm:space-y-8">
            <div className="space-y-4 sm:space-y-6">
              <div className="border-b border-grilli-border pb-4 sm:pb-6">
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-grilli-gold italic tracking-tight">Vitals</h3>
                <p className="text-[10px] sm:text-xs text-grilli-muted font-medium uppercase tracking-widest opacity-60">Strategic Performance Indices</p>
              </div>
              <MetricsDashboard metrics={metrics} telemetry={telemetry} />
            </div>
          </div>
        </div>

        {/* Live Operations & AI Logic */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-16 border-t border-grilli-border/50 pt-16 sm:pt-24">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-grilli-text italic">Margin Leakage</h3>
            </div>
            <MarginTracker tickets={tickets} />
          </div>

          <div className="lg:col-span-3 space-y-6 sm:space-y-8 bg-grilli-surface/30 p-6 sm:p-10 rounded-xl border border-grilli-border/30">
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-grilli-text italic">Intelligence Feed</h3>
            </div>
            <ActionsLog actions={actions} />
          </div>
        </div>

        <div className="flex justify-center pt-8 sm:pt-12">
          <button onClick={logout} className="text-[9px] sm:text-[10px] font-bold text-grilli-muted uppercase tracking-[0.4em] sm:tracking-[0.5em] hover:text-status-critical transition-colors">Terminate Management Session</button>
        </div>
      </main>
    </div>
  );
};

export default ManagerView;
