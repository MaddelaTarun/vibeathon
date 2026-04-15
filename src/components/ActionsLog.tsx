import { AutonomousAction } from '../models/types';

interface ActionsLogProps {
  actions: AutonomousAction[];
}

export default function ActionsLog({ actions }: ActionsLogProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-status-critical bg-status-critical/10';
      case 'warning':
        return 'border-status-warning bg-status-warning/10';
      case 'info':
        return 'border-status-info bg-status-info/10';
      default:
        return 'border-command-border bg-command-bg';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'labor_reallocation':
        return 'STAFF MOVED';
      case 'task_downgrade':
        return 'PRIORITY CHANGE';
      case 'margin_flag':
        return 'MONEY WARNING';
      case 'auto_86':
        return 'AUTO-CANCELLED';
      default:
        return type.toUpperCase().replace('_', ' ');
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="bg-command-panel border border-command-border rounded-lg p-6">
      <h2 className="text-lg font-bold font-mono mb-4 flex items-center text-command-text">
        <span className="w-2 h-2 bg-status-critical rounded-full mr-2 animate-pulse"></span>
        AI DECISIONS
      </h2>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {actions.map((action) => (
          <div
            key={action.id}
            className={`border-l-4 ${getSeverityColor(
              action.severity
            )} rounded p-3 transition-all hover:bg-command-panel/50`}
          >
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold text-command-muted uppercase tracking-wider">
                  {getTypeLabel(action.type)}
                </span>
              </div>
              <span className="text-[10px] font-mono text-command-muted">
                {formatTimestamp(action.timestamp)}
              </span>
            </div>

            <div className="text-sm font-mono mb-1 text-command-text leading-tight">{action.description}</div>

            <div className="flex items-center justify-between text-[10px] font-mono text-command-muted uppercase">
              <span>Impact: {action.impact}</span>
              {action.station && <span>Station: {action.station}</span>}
            </div>
          </div>
        ))}
      </div>

      {actions.length === 0 && (
        <div className="text-center text-command-muted font-mono text-sm py-8">
          NO ACTIONS LOGGED
        </div>
      )}
    </div>
  );
}
