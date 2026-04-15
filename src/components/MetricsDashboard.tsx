import { SystemMetrics, Telemetry } from '../models/types';

interface MetricsDashboardProps {
  metrics: SystemMetrics;
  telemetry: Telemetry | null;
}

export default function MetricsDashboard({ metrics, telemetry }: MetricsDashboardProps) {
  const primaryMetrics = [
    { label: 'Wait Time', value: `${metrics.average_delay.toFixed(1)}m`, status: metrics.average_delay > 8 ? 'critical' : 'normal' },
    { label: 'Potential Loss', value: `$${metrics.total_profit_at_risk.toFixed(0)}`, status: metrics.total_profit_at_risk > 200 ? 'critical' : 'normal' },
    { label: 'Cooking Speed', value: `${telemetry?.throughput_per_hour.toFixed(0) || '0'}/hr`, status: 'normal' },
    { label: 'Success Rate', value: `${metrics.total_tickets > 0 ? ((metrics.completed_tickets / metrics.total_tickets) * 100).toFixed(0) : '0'}%`, status: 'normal' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between py-6 border-y border-bistro-border px-4">
      {primaryMetrics.map((metric) => (
        <div key={metric.label} className="flex flex-col items-start pr-12 py-2">
          <span className="text-[10px] font-bold text-bistro-muted uppercase tracking-widest mb-1">
            {metric.label}
          </span>
          <span className={`text-2xl font-serif font-bold ${metric.status === 'critical' ? 'text-status-critical' : 'text-bistro-text'}`}>
            {metric.value}
          </span>
        </div>
      ))}
    </div>
  );
}
