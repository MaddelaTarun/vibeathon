import { Ticket } from '../models/types';

interface MarginTrackerProps {
  tickets: Ticket[];
}

export default function MarginTracker({ tickets }: MarginTrackerProps) {
  const atRiskTickets = tickets
    .filter((t) => t.status !== 'completed' && t.status !== 'cancelled' && t.delay_minutes > 5)
    .sort((a, b) => b.margin_value - a.margin_value)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {atRiskTickets.map((ticket) => (
        <div key={ticket.id} className="flex items-center justify-between py-4 border-b border-bistro-border last:border-0 group">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-status-critical uppercase tracking-widest mb-1 italic">DELAY ALERT</span>
            <span className="text-lg font-serif font-bold text-bistro-text tracking-tight italic">Order #{ticket.order_number} is holding up the kitchen.</span>
            <span className="text-[10px] font-bold text-bistro-muted uppercase tracking-widest mt-1">Waiting for {ticket.delay_minutes} minutes • {ticket.items.length} dishes</span>
          </div>
          <div className="text-right">
            <span className="text-xl font-serif font-bold text-status-critical italic">-${ticket.margin_value.toFixed(0)}</span>
          </div>
        </div>
      ))}
      
      {atRiskTickets.length === 0 && (
        <div className="py-8 text-center text-bistro-muted font-serif italic text-lg">
          No delays detected. Service is flowing perfectly.
        </div>
      )}
    </div>
  );
}
