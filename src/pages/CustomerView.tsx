import React, { useState, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import Header from '../components/Header';

interface Order {
  id: string;
  status: 'placed' | 'preparing' | 'ready' | 'served' | 'cancelled';
  items: any[];
  eta: number;
  chefId?: string;
}

const CustomerView: React.FC = () => {
  const { session, logout } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [submittedReviews, setSubmittedReviews] = useState<Set<string>>(new Set());
  const [reviewData, setReviewData] = useState({ skill: 0, hospitality: 0, speed: 0, overall: 0, comment: '' });
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.tableCode) return;

    // Initial fetch
    fetch(`/api/orders/table/${session.tableCode}`)
      .then(res => res.json())
      .then(setOrders);

    // WebSocket listener
    const ws = new WebSocket(`ws://${window.location.host}/ws`);
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'register',
        role: 'customer',
        tableCode: session.tableCode,
        sessionId: session.sessionId
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'order_update') {
        setOrders(prev => {
          const index = prev.findIndex(o => o.id === data.payload.id);
          if (index >= 0) {
            const next = [...prev];
            next[index] = data.payload;
            return next;
          }
          return [...prev, data.payload];
        });
      } else if (data.type === 'tickets') {
         // The server syncs orders with tickets every second and broadcasts order_update
         // but we can also trigger a refresh here if needed
      }
    };

    return () => ws.close();
  }, [session]);

  const submitReview = async (orderId: string, chefId?: string) => {
    if (!chefId) return;
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, chefId, ratings: reviewData, comment: reviewData.comment })
    });
    if (res.ok) {
      setSubmittedReviews(prev => new Set(prev).add(orderId));
      setActiveReviewId(null);
      setReviewData({ skill: 0, hospitality: 0, speed: 0, overall: 0, comment: '' });
    }
  };

  const getStatusStep = (status: string) => {
    const steps = ['placed', 'preparing', 'ready', 'served'];
    return steps.indexOf(status);
  };

  return (
    <div className="min-h-screen bg-grilli-black text-grilli-text font-sans pb-24">
      <Header connected={true} />
      
      <main className="max-w-4xl mx-auto px-6 pt-32 space-y-16">
        <section className="text-center space-y-4">
          <div className="inline-block px-4 py-1 border border-grilli-gold/20 bg-grilli-surface/50 rounded-full">
            <span className="text-[10px] font-bold text-grilli-gold uppercase tracking-[0.4em]">Table {session?.tableNumber} — Secure Link</span>
          </div>
          <h2 className="text-5xl font-serif font-bold italic tracking-tight">Your Culinary <span className="text-grilli-gold">Journey</span></h2>
          <p className="text-grilli-muted text-sm font-medium tracking-wide">Tracking your experience in real-time.</p>
        </section>

        {orders.length === 0 ? (
          <div className="py-24 text-center border border-grilli-border/30 rounded-2xl bg-grilli-surface/20">
            <p className="text-grilli-muted italic text-sm">Awaiting your order placement by the floor staff...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {orders.map(order => (
              <div key={order.id} className="bg-grilli-surface border border-grilli-border/50 rounded-2xl overflow-hidden shadow-premium">
                <div className="p-8 space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-grilli-gold uppercase tracking-widest opacity-60">Order ID</span>
                      <h3 className="text-2xl font-serif font-bold italic">#{order.id}</h3>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-[10px] font-bold text-grilli-gold uppercase tracking-widest opacity-60">Estimated Arrival</span>
                      <p className="text-2xl font-serif font-bold italic text-grilli-gold">{order.status === 'ready' ? 'READY' : order.status === 'served' ? 'ENJOY' : `${order.eta}m`}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative pt-8 pb-4">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-grilli-border/30"></div>
                    <div 
                      className="absolute top-0 left-0 h-0.5 bg-grilli-gold transition-all duration-1000 shadow-[0_0_10px_#c5a373]" 
                      style={{ width: `${(getStatusStep(order.status) + 1) * 25}%` }}
                    ></div>
                    <div className="flex justify-between">
                      {['Placed', 'Preparing', 'Ready', 'Served'].map((step, i) => (
                        <div key={step} className="flex flex-col items-center space-y-2">
                          <div className={`w-2 h-2 rounded-full border ${getStatusStep(order.status) >= i ? 'bg-grilli-gold border-grilli-gold' : 'bg-grilli-black border-grilli-border'}`}></div>
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${getStatusStep(order.status) >= i ? 'text-grilli-text' : 'text-grilli-muted'}`}>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-4 bg-grilli-black/40 border border-grilli-border/30 rounded-xl">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-[10px] font-bold text-grilli-gold uppercase tracking-widest">{item.station}</span>
                      </div>
                    ))}
                  </div>

                  {/* Review Trigger */}
                  {(order.status === 'ready' || order.status === 'served') && !submittedReviews.has(order.id) && (
                    <div className="pt-6 border-t border-grilli-border/30">
                      {activeReviewId === order.id ? (
                        <div className="space-y-6 animate-fade-in">
                          <h4 className="text-xl font-serif font-bold italic text-grilli-gold text-center">Rate Your Experience</h4>
                          <div className="grid grid-cols-2 gap-8">
                            {['skill', 'hospitality', 'speed', 'overall'].map(dim => (
                              <div key={dim} className="space-y-3">
                                <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-grilli-muted">{dim}</label>
                                <div className="flex space-x-2">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <button 
                                      key={star} 
                                      onClick={() => setReviewData(prev => ({ ...prev, [dim]: star }))}
                                      className={`text-xl transition-all ${(reviewData[dim as keyof typeof reviewData] as number) >= star ? 'text-grilli-gold scale-110' : 'text-grilli-muted opacity-30 hover:opacity-100'}`}
                                    >
                                      ★
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          <textarea 
                            placeholder="Optional: Tell the Chef what made this dish special..."
                            value={reviewData.comment}
                            onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                            className="w-full bg-grilli-black border border-grilli-border rounded-xl p-4 text-sm text-grilli-text outline-none focus:border-grilli-gold/50 transition-all h-24 placeholder:text-grilli-muted/30"
                          />
                          <div className="flex space-x-4">
                            <button 
                              onClick={() => submitReview(order.id, order.chefId)}
                              disabled={reviewData.overall === 0}
                              className="flex-grow py-3 bg-gold-gradient text-grilli-black font-bold uppercase tracking-widest text-[10px] rounded-lg disabled:opacity-50"
                            >
                              Submit Intelligence
                            </button>
                            <button onClick={() => setActiveReviewId(null)} className="px-6 text-[10px] font-bold uppercase tracking-widest text-grilli-muted hover:text-grilli-text transition-colors">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setActiveReviewId(order.id)}
                          className="w-full py-4 border border-grilli-gold/30 rounded-xl text-grilli-gold font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-grilli-gold/10 transition-all"
                        >
                          Rate This Performance
                        </button>
                      )}
                    </div>
                  )}

                  {submittedReviews.has(order.id) && (
                    <div className="pt-6 border-t border-grilli-border/30 text-center animate-fade-in">
                      <span className="text-[10px] font-bold text-status-optimal uppercase tracking-[0.4em]">Review Submitted. Thank you, Chef.</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center pt-12">
          <button onClick={logout} className="text-[10px] font-bold text-grilli-muted uppercase tracking-[0.5em] hover:text-status-critical transition-colors">Terminate Session</button>
        </div>
      </main>
    </div>
  );
};

export default CustomerView;
