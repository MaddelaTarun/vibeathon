import React from 'react';
import { Ticket } from '../models/types';

interface MarginTrackerProps {
  tickets: Ticket[];
}

const MarginTracker: React.FC<MarginTrackerProps> = ({ tickets }) => {
  const delayedTickets = tickets
    .filter((t) => (t.status === 'in_progress' || t.status === 'pending') && t.delay_minutes > 5)
    .sort((a, b) => b.margin_value - a.margin_value);

  if (delayedTickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 border border-grilli-border/30 rounded-lg bg-grilli-black/20 text-center">
        <div className="w-1.5 h-1.5 rounded-full bg-status-optimal mb-3 animate-pulse"></div>
        <p className="text-[10px] font-bold text-grilli-muted uppercase tracking-[0.3em] opacity-40 italic">Zero margin leakage detected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {delayedTickets.map((ticket) => (
        <div 
          key={ticket.id} 
          className={`p-5 rounded-lg border border-grilli-border bg-grilli-surface hover:bg-grilli-card transition-all duration-300 group shadow-sm`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
              <h4 className="text-lg font-serif font-bold text-grilli-text italic">#{ticket.order_number}</h4>
              <p className="text-[10px] text-grilli-muted font-bold uppercase tracking-widest italic opacity-60">Delay: {ticket.delay_minutes}m</p>
            </div>
            <div className={`text-xl font-serif font-bold italic ${
              ticket.margin_value > 50 ? 'text-status-critical' : 'text-status-warning'
            }`}>
              +${ticket.margin_value.toFixed(2)}
            </div>
          </div>

          <div className="space-y-3">
             <div className="w-full bg-grilli-black/40 h-1 rounded-full overflow-hidden">
                <div 
                  className={`h-full animate-pulse ${
                    ticket.delay_minutes > 15 ? 'bg-status-critical' : 'bg-status-warning'
                  }`}
                  style={{ width: `${Math.min(100, (ticket.delay_minutes / 20) * 100)}%` }}
                ></div>
             </div>
             
             <div className="flex flex-wrap gap-1.5">
                {ticket.items.map((item, idx) => (
                  <span key={idx} className="text-[9px] font-bold text-grilli-gold bg-grilli-gold/5 px-2 py-0.5 rounded border border-grilli-gold/10 tracking-tighter">
                    {item.name}
                  </span>
                ))}
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MarginTracker;
