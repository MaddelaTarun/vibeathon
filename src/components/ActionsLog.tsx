import { AutonomousAction } from '../models/types';

interface ActionsLogProps {
  actions: AutonomousAction[];
}

export default function ActionsLog({ actions }: ActionsLogProps) {
  const latestActions = actions.slice(0, 10);

  return (
    <div className="space-y-8">
      {latestActions.map((action) => (
        <div key={action.id} className="flex flex-col border-b border-bistro-border last:border-0 pb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-bistro-muted uppercase tracking-widest italic">
              AI Decision Engine • {new Date(action.timestamp).toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' })}
            </span>
            <div className={`w-1.5 h-1.5 rounded-full ${action.severity === 'critical' ? 'bg-status-critical' : 'bg-status-info'}`}></div>
          </div>
          
          <span className="text-xl font-serif font-bold text-bistro-text leading-tight mb-2 italic">
            {action.description}
          </span>
          
          <div className="flex items-center space-x-4 text-[10px] font-bold text-bistro-muted uppercase tracking-widest">
            <span>IMPACT: {action.impact}</span>
            {action.station && (
              <span className="border-l border-bistro-border pl-4">STATION: {action.station}</span>
            )}
          </div>
        </div>
      ))}
      
      {latestActions.length === 0 && (
        <div className="py-8 text-center text-bistro-muted font-serif italic text-lg">
          The AI is monitoring service. Everything is quiet.
        </div>
      )}
    </div>
  );
}
