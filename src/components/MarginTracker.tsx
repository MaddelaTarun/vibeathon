import { Ticket } from '../models/types';

interface MarginTrackerProps {
  tickets: Ticket[];
}

export default function MarginTracker({ tickets }: MarginTrackerProps) {
  const atRiskTickets = tickets
    .filter((t) => t.status !== 'completed' && t.status !== 'cancelled')
    .sort((a, b) => b.margin_value - a.margin_value)
    .slice(0, 10);

  const totalAtRisk = atRiskTickets.reduce((sum, t) => sum + t.margin_value, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delayed':
        return 'text-status-critical';
      case 'in_progress':
        return 'text-status-warning';
      case 'pending':
        return 'text-status-info';
      default:
        return 'text-command-muted';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delayed':
        return 'bg-status-critical/20 text-status-critical';
      case 'in_progress':
        return 'bg-status-warning/20 text-status-warning';
      case 'pending':
        return 'bg-status-info/20 text-status-info';
      default:
        return 'bg-command-border text-command-muted';
    }
  };

  return (
    <div className="bg-command-panel border border-command-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold font-mono flex items-center">
          <span className="w-2 h-2 bg-status-warning rounded-full mr-2"></span>
          MARGIN-AT-RISK TRACKER
        </h2>
        <div className="text-right">
          <div className="text-xs font-mono text-command-muted">TOTAL AT RISK</div>
          <div
            className={`text-xl font-bold font-mono ${
              totalAtRisk > 200
                ? 'text-status-critical'
                : totalAtRisk > 100
                ? 'text-status-warning'
                : 'text-status-optimal'
            }`}
          >
            ${totalAtRisk.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {atRiskTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-command-bg border border-command-border rounded p-3 hover:border-status-info transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-sm">#{ticket.order_number}</span>
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded ${getStatusBadge(
                    ticket.status
                  )}`}
                >
                  {ticket.status.toUpperCase()}
                </span>
              </div>
              <span className="font-mono font-bold text-status-warning">
                ${ticket.margin_value.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-command-muted">
              <span>{ticket.items.length} items</span>
              <span>Complexity: {ticket.complexity}/10</span>
              {ticket.delay_minutes > 0 && (
                <span className="text-status-critical">+{ticket.delay_minutes}min</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {atRiskTickets.length === 0 && (
        <div className="text-center text-command-muted font-mono text-sm py-8">
          NO TICKETS AT RISK
        </div>
      )}
    </div>
  );
}
