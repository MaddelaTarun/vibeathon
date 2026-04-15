import { Station } from '../models/types';

interface LaborBoardProps {
  stations: Station[];
}

export default function LaborBoard({ stations }: LaborBoardProps) {
  const allStaff = stations.flatMap(s => s.assigned_staff.map(name => ({ name, station: s.name, stress: s.stress_level })));

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 py-4">
      {allStaff.map((staff, index) => (
        <div key={index} className="flex items-center space-x-2">
          <span className="text-sm font-medium text-bistro-text">{staff.name}</span>
          <span className="text-[10px] font-bold text-bistro-muted uppercase tracking-widest">{staff.station}</span>
          <div className={`w-1 h-1 rounded-full ${staff.stress > 85 ? 'bg-status-critical' : 'bg-status-optimal'}`}></div>
        </div>
      ))}
    </div>
  );
}
