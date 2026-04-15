import React from 'react';

interface HeaderProps {
  connected: boolean;
}

const Header: React.FC<HeaderProps> = ({ connected }) => {
  return (
    <header className="fixed top-0 left-0 w-full z-30 bg-grilli-black/80 backdrop-blur-xl border-b border-grilli-border/50">
      <div className="max-w-6xl mx-auto px-8 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-serif font-bold tracking-tighter text-grilli-text flex items-center italic">
              KITCHEN <span className="text-grilli-gold ml-2">PULSE</span>
            </h1>
            <span className="text-[8px] font-bold text-grilli-gold uppercase tracking-[0.6em] opacity-60">Autonomous Expeditor Engine</span>
          </div>
        </div>

        <div className="flex items-center space-x-12">
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-[10px] font-bold text-grilli-gold uppercase tracking-widest border-b border-grilli-gold/40 pb-1">Telemetry</a>
            <a href="#" className="text-[10px] font-bold text-grilli-muted uppercase tracking-widest hover:text-grilli-text transition-colors pb-1">Operational Log</a>
            <a href="#" className="text-[10px] font-bold text-grilli-muted uppercase tracking-widest hover:text-grilli-text transition-colors pb-1">Labor Matrix</a>
          </nav>

          <div className="flex items-center space-x-3 bg-grilli-surface px-4 py-2 rounded-lg border border-grilli-border shadow-sm">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-status-optimal animate-pulse shadow-[0_0_10px_rgba(46,204,113,0.5)]' : 'bg-status-critical'}`}></div>
            <span className="text-[10px] font-bold text-grilli-text uppercase tracking-widest leading-none">
              {connected ? 'Engine Active' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
