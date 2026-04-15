import React from 'react';
import { Station } from '../models/types';

interface LaborBoardProps {
  stations: Station[];
}

const LaborBoard: React.FC<LaborBoardProps> = ({ stations }) => {
  const allStaff = stations.flatMap(s => 
    s.assigned_staff.map(staffObj => ({ 
      name: staffObj.name, 
      skills: staffObj.skills,
      station: s.name, 
      stress: s.stress_level 
    }))
  );

  return (
    <div className="flex flex-wrap gap-x-8 gap-y-4 py-6">
      {allStaff.map((staff, index) => (
        <div key={index} className="flex flex-col space-y-1 group">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-serif font-bold text-grilli-text italic group-hover:text-grilli-gold transition-colors">{staff.name}</span>
            <div className={`w-1 h-1 rounded-full ${staff.stress > 85 ? 'bg-status-critical animate-pulse' : 'bg-status-optimal opacity-50'}`}></div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-[9px] font-bold text-grilli-gold uppercase tracking-[0.2em]">{staff.station}</span>
            <div className="flex space-x-1">
              {staff.skills.map((skill, si) => (
                <span key={si} className="text-[7px] text-grilli-muted border border-grilli-border/50 px-1 rounded uppercase tracking-tighter">
                  {skill.split('_')[0]}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LaborBoard;
