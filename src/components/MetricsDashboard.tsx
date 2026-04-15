import React from 'react';
import { SystemMetrics, Telemetry } from '../models/types';

interface MetricsDashboardProps {
  metrics: SystemMetrics;
  telemetry: Telemetry | null;
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ metrics, telemetry }) => {
  const primaryMetrics = [
    { 
      label: 'Throughput', 
      value: `${metrics.completed_tickets}/${metrics.total_tickets}`, 
      status: metrics.completed_tickets / metrics.total_tickets > 0.8 ? 'optimal' : 'warning' 
    },
    { 
      label: 'Wait Time', 
      value: `${metrics.average_delay.toFixed(1)}m`, 
      status: metrics.average_delay > 15 ? 'critical' : metrics.average_delay > 8 ? 'warning' : 'optimal' 
    },
    { 
      label: 'Margin Leakage', 
      value: `$${metrics.total_profit_at_risk.toFixed(0)}`, 
      status: metrics.total_profit_at_risk > 300 ? 'critical' : metrics.total_profit_at_risk > 150 ? 'warning' : 'optimal' 
    },
    { 
      label: 'AI Actions', 
      value: metrics.autonomous_actions.toString(), 
      status: 'info' 
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-status-critical';
      case 'warning': return 'text-status-warning';
      case 'optimal': return 'text-status-optimal';
      default: return 'text-grilli-gold';
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {primaryMetrics.map((metric, i) => (
        <div key={i} className="bg-grilli-surface/50 border border-grilli-border/50 p-6 rounded-lg backdrop-blur-md transition-all hover:border-grilli-gold/30 hover:bg-grilli-surface/70 group">
          <span className="text-[10px] font-bold text-grilli-muted uppercase tracking-[0.3em] opacity-60 group-hover:opacity-100 transition-opacity">
            {metric.label}
          </span>
          <div className={`mt-3 text-3xl font-serif font-bold italic tracking-tight ${getStatusColor(metric.status)}`}>
            {metric.value}
          </div>
          <div className="mt-2 w-full h-0.5 bg-grilli-black/40 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 ${
              metric.status === 'critical' ? 'bg-status-critical' : 
              metric.status === 'warning' ? 'bg-status-warning' : 
              metric.status === 'optimal' ? 'bg-status-optimal' : 'bg-status-info'
            }`} style={{ width: '100%' }}></div>
          </div>
        </div>
      ))}

      {telemetry && (
        <div className="col-span-2 mt-4 p-4 border border-grilli-gold/10 bg-grilli-black/20 rounded-lg">
           <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-bold text-grilli-muted uppercase tracking-widest">Real-time Utilization</span>
              <span className="text-[9px] font-bold text-grilli-gold uppercase tracking-widest italic animate-pulse">Live Telemetry</span>
           </div>
           <div className="w-full bg-grilli-black/40 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gold-gradient transition-all duration-500"
                style={{ width: `${(metrics.completed_tickets / metrics.total_tickets) * 100}%` }}
              ></div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MetricsDashboard;
