interface HeaderProps {
  connected: boolean;
}

export default function Header({ connected }: HeaderProps) {
  return (
    <header className="bg-command-panel border-b border-command-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-status-optimal rounded-full animate-pulse"></div>
              <h1 className="text-2xl font-bold font-sans tracking-tight text-command-text">
                Smart Kitchen Assistant
              </h1>
            </div>
            <span className="text-command-muted text-sm font-sans italic">
              Your AI Team is Managing the Rush
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  connected ? 'bg-status-optimal' : 'bg-status-critical'
                }`}
              ></div>
              <span className="text-sm font-mono text-command-muted">
                {connected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>

            <div className="text-sm font-mono text-command-muted">
              {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
