import React from 'react';
import { AutonomousAction } from '../models/types';

interface ActionsLogProps {
  actions: AutonomousAction[];
}

const ActionsLog: React.FC<ActionsLogProps> = ({ actions }) => {
  if (actions.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border border-grilli-border/30 rounded-lg bg-grilli-black/20">
        <p className="text-[10px] font-bold text-grilli-muted uppercase tracking-[0.3em] italic opacity-40 italic">Waiting for autonomous activity...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-grilli-border">
      {actions.map((action) => (
        <div 
          key={action.id} 
          className="group relative p-5 bg-grilli-surface border border-grilli-border hover:border-grilli-gold/40 transition-all duration-300 rounded-lg shadow-sm"
        >
          <div className="absolute top-0 left-0 w-1 h-full rounded-l-lg transition-all group-hover:w-1.5 overflow-hidden">
             <div className={`h-full ${
               action.severity === 'critical' ? 'bg-status-critical' : 
               action.severity === 'warning' ? 'bg-status-warning' : 'bg-status-info'
             }`}></div>
          </div>

          <div className="flex justify-between items-start mb-3 pl-2">
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded border ${
                action.type === 'labor_reallocation' ? 'border-status-info/40 text-status-info' : 
                action.type === 'task_downgrade' ? 'border-status-critical/40 text-status-critical' : 'border-status-warning/40 text-status-warning'
              }`}>
                {action.type.replace('_', ' ')}
              </span>
              <span className="text-[9px] font-bold text-grilli-muted uppercase tracking-widest opacity-40">
                {new Date(action.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>

          <div className="pl-2 space-y-2">
            <h4 className="text-sm font-serif font-bold text-grilli-text italic tracking-wide group-hover:text-grilli-gold transition-colors italic">
              {action.description}
            </h4>
            <p className="text-[11px] text-grilli-muted leading-relaxed italic opacity-80">
              {action.impact}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActionsLog;
