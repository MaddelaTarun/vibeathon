import { AutonomousAction } from '../models/types';

interface ActionsLogProps {
  actions: AutonomousAction[];
}

export default function ActionsLog({ actions }: ActionsLogProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'warning':
        return '🟡';
      case 'info':
        return '🔵';
      default:
        return '⚪';
    }
  };

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
        return 'LABOR REALLOC';
      case 'task_downgrade':
        return 'TASK DOWNGRADE';
      case 'margin_flag':
        return 'MARGIN FLAG';
      case 'auto_86':
        return 'AUTO-86';
      default:
        return type.toUpperCase();
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <div className="bg-command-panel border border-command-border rounded-lg p-6">
      <h2 className="text-lg font-bold font-mono mb-4 flex items-center">
        <span className="w-2 h-2 bg-status-critical rounded-full mr-2 animate-pulse"></span>
        AUTONOMOUS ACTIONS LOG
      </h2>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {actions.map((action) => (
          <div
            key={action.id}
            className={`border-l-4 ${getSeverityColor(
              action.severity
            )} rounded p-3 transition-all hover:scale-[1.01]`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getSeverityIcon(action.severity)}</span>
                <span className="text-xs font-mono font-bold text-command-muted">
                  {getTypeLabel(action.type)}
                </span>
              </div>
              <span className="text-xs font-mono text-command-muted">
                {formatTimestamp(action.timestamp)}
              </span>
            </div>

            <div className="text-sm font-mono mb-2">{action.description}</div>

            <div className="flex items-center justify-between text-xs font-mono text-command-muted">
              <span>IMPACT: {action.impact}</span>
              {action.station && <span>STATION: {action.station}</span>}
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
