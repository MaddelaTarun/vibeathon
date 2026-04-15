import { Station } from '../models/types';

interface StationMonitorProps {
  stations: Station[];
}

export default function StationMonitor({ stations }: StationMonitorProps) {
  const getStressColor = (stress: number) => {
    if (stress > 85) return 'bg-status-critical';
    if (stress > 70) return 'bg-status-warning';
    return 'bg-status-optimal';
  };

  const getStressAnimation = (stress: number) => {
    if (stress > 85) return 'animate-stress-pulse';
    return '';
  };

  return (
    <div className="bg-command-panel border border-command-border rounded-lg p-6">
      <h2 className="text-lg font-bold font-mono mb-4 flex items-center text-command-text">
        <span className="w-2 h-2 bg-status-info rounded-full mr-2"></span>
        STATION BUSYNESS
      </h2>

      <div className="space-y-4">
        {stations.map((station) => (
          <div key={station.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="font-mono font-semibold text-sm">{station.name}</span>
                <span className="text-xs font-mono text-command-muted">
                  {station.assigned_staff.length} on it
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-sm font-mono font-bold ${
                    station.stress_level > 85
                      ? 'text-status-critical'
                      : station.stress_level > 70
                      ? 'text-status-warning'
                      : 'text-status-optimal'
                  }`}
                >
                  {station.stress_level.toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Stress Bar */}
            <div className="relative h-3 bg-command-bg rounded-full overflow-hidden border border-command-border">
              <div
                className={`absolute left-0 top-0 h-full transition-all duration-500 ${getStressColor(
                  station.stress_level
                )} ${getStressAnimation(station.stress_level)}`}
                style={{ width: `${station.stress_level}%` }}
              ></div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center justify-between text-[10px] font-mono text-command-muted uppercase">
              <span>WORKLOAD</span>
              <span className={
                station.stress_level > 85 ? 'text-status-critical font-bold' : 
                station.stress_level > 70 ? 'text-status-warning' : 
                'text-status-optimal'
              }>
                {station.stress_level > 85
                  ? 'DROWNING'
                  : station.stress_level > 70
                  ? 'BUSY'
                  : 'GOOD'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {stations.length === 0 && (
        <div className="text-center text-command-muted font-mono text-sm py-8">
          NO STATION DATA
        </div>
      )}
    </div>
  );
}
