import { Station } from '../models/types';

interface StationMonitorProps {
  stations: Station[];
}

export default function StationMonitor({ stations }: StationMonitorProps) {
  const getStatusText = (stress: number) => {
    if (stress > 85) return 'Drowning';
    if (stress > 70) return 'Busy';
    return 'Stable';
  };

  const getStatusColor = (stress: number) => {
    if (stress > 85) return 'text-status-critical';
    if (stress > 70) return 'text-status-warning';
    return 'text-status-optimal';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stations.map((station) => (
          <div key={station.id} className="flex flex-col py-4 border-b border-bistro-border last:border-0 md:border-b-0 md:border-r md:last:border-r-0 md:pr-4">
            <span className="text-[10px] font-bold text-bistro-muted uppercase tracking-widest mb-1">
              {station.name}
            </span>
            <span className={`text-xl font-serif font-bold ${getStatusColor(station.stress_level)}`}>
              {getStatusText(station.stress_level)}
            </span>
            <span className="text-[10px] font-medium text-bistro-muted mt-1">
              {station.assigned_staff.length} PEOPLE ON IT
            </span>
          </div>
        ))}
      </div>

      {stations.length === 0 && (
        <div className="text-center text-bistro-muted font-serif italic py-4">
          Waiting for station telemetry...
        </div>
      )}
    </div>
  );
}
