import { Station } from '../models/types';

interface LaborBoardProps {
  stations: Station[];
}

export default function LaborBoard({ stations }: LaborBoardProps) {
  const totalStaff = stations.reduce((sum, s) => sum + s.assigned_staff.length, 0);

  return (
    <div className="bg-command-panel border border-command-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold font-mono flex items-center">
          <span className="w-2 h-2 bg-status-optimal rounded-full mr-2"></span>
          LABOR BOARD
        </h2>
        <div className="text-xs font-mono text-command-muted">
          {totalStaff} STAFF
        </div>
      </div>

      <div className="space-y-4">
        {stations.map((station) => (
          <div key={station.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-semibold text-sm">{station.name}</span>
              <span className="text-xs font-mono text-command-muted">
                {station.assigned_staff.length} assigned
              </span>
            </div>

            <div className="space-y-1">
              {station.assigned_staff.map((staff, index) => (
                <div
                  key={index}
                  className="bg-command-bg border border-command-border rounded px-3 py-2 text-xs font-mono flex items-center justify-between"
                >
                  <span>{staff}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      station.stress_level > 85
                        ? 'bg-status-critical animate-pulse'
                        : station.stress_level > 70
                        ? 'bg-status-warning'
                        : 'bg-status-optimal'
                    }`}
                  ></span>
                </div>
              ))}

              {station.assigned_staff.length === 0 && (
                <div className="text-xs font-mono text-command-muted text-center py-2">
                  NO STAFF ASSIGNED
                </div>
              )}
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
