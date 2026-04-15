interface HeaderProps {
  connected: boolean;
}

export default function Header({ connected }: HeaderProps) {
  return (
    <header className="bg-white border-b border-bistro-border py-6 shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center space-x-3">
              <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-status-optimal animate-pulse' : 'bg-status-critical'}`}></div>
              <h1 className="text-3xl font-serif font-bold tracking-tight text-bistro-text">
                Kitchen Assistant
              </h1>
            </div>
            <p className="text-bistro-muted text-sm mt-1 font-light tracking-wide italic">
              AI-Powered Orchestration for Fine Dining
            </p>
          </div>

          <div className="flex items-center space-x-8">
            <div className="text-right">
              <div className="text-[10px] font-bold text-bistro-muted uppercase tracking-widest">System Status</div>
              <div className="text-sm font-medium text-bistro-text uppercase">
                {connected ? 'Operational' : 'Offline'}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold text-bistro-muted uppercase tracking-widest">Local Time</div>
              <div className="text-sm font-medium text-bistro-text">
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
