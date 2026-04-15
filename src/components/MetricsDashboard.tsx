import { SystemMetrics, Telemetry } from '../models/types';

interface MetricsDashboardProps {
  metrics: SystemMetrics;
  telemetry: Telemetry | null;
}

export default function MetricsDashboard({ metrics, telemetry }: MetricsDashboardProps) {
  const metricCards = [
    {
      label: 'THROUGHPUT',
      value: telemetry?.throughput_per_hour.toFixed(1) || '0',
      unit: 'tickets/hr',
      status: (telemetry?.throughput_per_hour || 0) > 30 ? 'optimal' : 'warning',
    },
    {
      label: 'LABOR UTIL',
      value: telemetry?.labor_utilization.toFixed(0) || '0',
      unit: '%',
      status:
        (telemetry?.labor_utilization || 0) > 85
          ? 'critical'
          : (telemetry?.labor_utilization || 0) > 70
          ? 'optimal'
          : 'warning',
    },
    {
      label: 'MARGIN LEAKAGE',
      value: `$${metrics.total_profit_at_risk.toFixed(0)}`,
      unit: '',
      status: metrics.total_profit_at_risk > 200 ? 'critical' : metrics.total_profit_at_risk > 100 ? 'warning' : 'optimal',
    },
    {
      label: 'AVG DELAY',
      value: metrics.average_delay.toFixed(1),
      unit: 'min',
      status: metrics.average_delay > 10 ? 'critical' : metrics.average_delay > 5 ? 'warning' : 'optimal',
    },
    {
      label: 'AUTONOMOUS ACTIONS',
      value: metrics.autonomous_actions.toString(),
      unit: 'decisions',
      status: 'info',
    },
    {
      label: 'COMPLETION RATE',
      value: metrics.total_tickets > 0 ? ((metrics.completed_tickets / metrics.total_tickets) * 100).toFixed(0) : '0',
      unit: '%',
      status: 'info',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metricCards.map((metric) => (
        <div
          key={metric.label}
          className="bg-command-panel border border-command-border rounded-lg p-4"
        >
          <div className="text-xs font-mono text-command-muted mb-2">{metric.label}</div>
          <div className="flex items-baseline space-x-1">
            <div
              className={`text-2xl font-bold font-mono ${
                metric.status === 'critical'
                  ? 'text-status-critical'
                  : metric.status === 'warning'
                  ? 'text-status-warning'
                  : metric.status === 'optimal'
                  ? 'text-status-optimal'
                  : 'text-status-info'
              }`}
            >
              {metric.value}
            </div>
            {metric.unit && (
              <div className="text-xs font-mono text-command-muted">{metric.unit}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
