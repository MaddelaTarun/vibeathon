import React from 'react';
import { Station } from '../models/types';

interface StationMonitorProps {
  stations: Station[];
}

const StationMonitor: React.FC<StationMonitorProps> = ({ stations }) => {
  const getStressColor = (stress: number) => {
    if (stress > 90) return 'text-status-critical';
    if (stress > 75) return 'text-status-warning';
    return 'text-status-optimal';
  };

  const getStressBg = (stress: number) => {
    if (stress > 90) return 'bg-status-critical/20 border-status-critical/30';
    if (stress > 75) return 'bg-status-warning/20 border-status-warning/30';
    return 'bg-status-optimal/10 border-status-optimal/20';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {stations.map((station) => (
        <div 
          key={station.id} 
          className={`p-6 rounded-xl border transition-all duration-500 ${getStressBg(station.stress_level)}`}
        >
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <h4 className="text-xl font-serif font-bold text-grilli-text italic">{station.name}</h4>
              <div className="flex flex-wrap gap-1">
                {(station.assigned_staff as any[]).map((staff, idx) => (
                  <span key={idx} className="text-[9px] font-bold text-grilli-muted bg-grilli-black/40 px-2 py-0.5 rounded border border-grilli-border/50 uppercase tracking-tighter">
                    {staff.name || staff}
                  </span>
                ))}
              </div>
            </div>
            <div className={`text-2xl font-serif font-bold italic ${getStressColor(station.stress_level)}`}>
              {station.stress_level.toFixed(0)}%
            </div>
          </div>

          <div className="space-y-3">
            <div className="w-full bg-grilli-black/40 h-1 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${
                  station.stress_level > 90 ? 'bg-status-critical' : 
                  station.stress_level > 75 ? 'bg-status-warning' : 'bg-status-optimal'
                }`}
                style={{ width: `${station.stress_level}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-[10px] font-bold text-grilli-muted uppercase tracking-widest opacity-60">
              <span>Load: {station.current_load.toFixed(0)}u</span>
              <span>Cap: {station.capacity}u</span>
            </div>
          </div>

          {station.stress_level > 85 && (
            <div className="mt-4 pt-4 border-t border-grilli-border/30 flex items-center space-x-2 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-status-critical"></span>
              <span className="text-[10px] font-bold text-status-critical uppercase tracking-widest">Architect Intervening...</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StationMonitor;
