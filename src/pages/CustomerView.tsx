import React, { useState, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import Header from '../components/Header';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  time: number;
  desc: string;
  cuisine: string;
  station: string;
  cost: number;
}

interface Chef {
  id: string;
  name: string;
  rating: number;
  bio: string;
  activeOrders: number;
  maxLoad: number;
  cuisine: string;
}

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
  
  // Menu ordering state
  const [showMenu, setShowMenu] = useState(false);
  const [menu, setMenu] = useState<Record<string, MenuItem[]>>({});
  const [chefs, setChefs] = useState<Record<string, Chef[]>>({});
  const [cuisineLabels, setCuisineLabels] = useState<Record<string, string>>({});
  const [activeCuisine, setActiveCuisine] = useState<string>('');
  const [cart, setCart] = useState<MenuItem[]>([]);
  const [selectedChef, setSelectedChef] = useState<string>('auto');
  const [ordering, setOrdering] = useState(false);

  // Load menu and chefs
  useEffect(() => {
    fetch('/api/menu').then(res => res.json()).then(data => {
      setMenu(data.items);
      setCuisineLabels(data.cuisineLabels);
      setActiveCuisine(Object.keys(data.items)[0]);
    });
    fetch('/api/chefs').then(res => res.json()).then(data => setChefs(data.chefs));
  }, []);

  useEffect(() => {
    if (!session?.tableCode) return;

    // Initial fetch
    fetch(`/api/orders/table/${session.tableCode}`)
      .then(res => res.json())
      .then(setOrders);

    // WebSocket listener
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const wsUrl = isDev ? 'ws://localhost:3001' : `${protocol}//${window.location.host}`;
    
    const ws = new WebSocket(wsUrl);
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
      }
    };

    return () => ws.close();
  }, [session]);

  const addToCart = (item: MenuItem) => {
    if (cart.length < 20) {
      setCart([...cart, item]);
    }
  };

  const removeFromCart = (idx: number) => {
    const next = [...cart];
    next.splice(idx, 1);
    setCart(next);
  };

  const placeOrder = async () => {
    if (!session?.tableCode || cart.length === 0) return;
    setOrdering(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableCode: session.tableCode,
          items: cart,
          chefId: selectedChef === 'auto' ? null : selectedChef
        })
      });
      if (res.ok) {
        setCart([]);
        setShowMenu(false);
        setSelectedChef('auto');
        // Refresh orders
        fetch(`/api/orders/table/${session.tableCode}`)
          .then(res => res.json())
          .then(setOrders);
      }
    } catch (error) {
      console.error('Order failed:', error);
    } finally {
      setOrdering(false);
    }
  };

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

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-grilli-black text-grilli-text font-sans pb-24">
      <Header connected={true} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 space-y-12 sm:space-y-16">
        <section className="text-center space-y-4">
          <div className="inline-block px-3 sm:px-4 py-1 border border-grilli-gold/20 bg-grilli-surface/50 rounded-full">
            <span className="text-[9px] sm:text-[10px] font-bold text-grilli-gold uppercase tracking-[0.3em] sm:tracking-[0.4em]">
              Table {session?.tableNumber} — Code: {session?.tableCode || 'Loading...'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold italic tracking-tight">Your Culinary <span className="text-grilli-gold">Journey</span></h2>
          <p className="text-grilli-muted text-xs sm:text-sm font-medium tracking-wide">Tracking your experience in real-time.</p>
          <p className="text-[10px] text-grilli-gold/60 font-mono">Share code <span className="font-bold text-grilli-gold">{session?.tableCode}</span> with your waiter</p>
        </section>

        {/* Order Button */}
        {!showMenu && (
          <div className="flex justify-center">
            <button 
              onClick={() => setShowMenu(true)}
              className="px-8 py-4 bg-gold-gradient text-grilli-black font-bold uppercase tracking-[0.2em] text-xs rounded-lg hover:opacity-90 transition-opacity shadow-glow"
            >
              Browse Menu & Order
            </button>
          </div>
        )}

        {/* Menu Section */}
        {showMenu && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            <div className="lg:col-span-8 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-serif font-bold italic text-grilli-gold">Menu Selection</h3>
                <button 
                  onClick={() => setShowMenu(false)}
                  className="text-[10px] font-bold text-grilli-muted uppercase tracking-widest hover:text-grilli-text transition-colors"
                >
                  Close Menu
                </button>
              </div>

              {/* Cuisine Tabs */}
              <div className="flex flex-wrap gap-3">
                {Object.keys(menu).map(c => (
                  <button 
                    key={c}
                    onClick={() => setActiveCuisine(c)}
                    className={`px-4 sm:px-6 py-2 rounded-full border text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all ${
                      activeCuisine === c 
                        ? 'bg-grilli-gold text-grilli-black border-grilli-gold' 
                        : 'border-grilli-border text-grilli-muted hover:border-grilli-gold/30'
                    }`}
                  >
                    {cuisineLabels[c]}
                  </button>
                ))}
              </div>

              {/* Menu Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {menu[activeCuisine]?.map(item => (
                  <div key={item.id} className="p-4 sm:p-6 bg-grilli-surface border border-grilli-border/50 rounded-xl hover:border-grilli-gold/30 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-base sm:text-lg font-serif font-bold italic group-hover:text-grilli-gold transition-colors">{item.name}</h4>
                      <span className="text-grilli-gold font-serif italic text-sm sm:text-base">${item.price}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-grilli-muted leading-relaxed mb-4 sm:mb-6 line-clamp-2">{item.desc}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] sm:text-[9px] font-bold text-grilli-muted uppercase tracking-widest">{item.time} MIN</span>
                      <button 
                        onClick={() => addToCart(item)}
                        className="px-3 sm:px-4 py-1.5 border border-grilli-gold/30 rounded text-[8px] sm:text-[9px] font-bold text-grilli-gold uppercase tracking-widest hover:bg-grilli-gold hover:text-grilli-black transition-all"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chef Selection */}
              {cart.length > 0 && (
                <div className="space-y-4 pt-8 border-t border-grilli-border/30">
                  <h4 className="text-lg font-serif font-bold italic text-grilli-gold">Select Your Chef</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <button 
                      onClick={() => setSelectedChef('auto')}
                      className={`p-3 sm:p-4 rounded-xl border text-left transition-all ${
                        selectedChef === 'auto' 
                          ? 'bg-grilli-gold/10 border-grilli-gold' 
                          : 'bg-grilli-black border-grilli-border opacity-60 hover:opacity-100'
                      }`}
                    >
                      <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-grilli-gold mb-1">Auto</span>
                      <span className="block text-xs sm:text-sm font-serif font-bold italic">Best Available</span>
                    </button>
                    {chefs[activeCuisine]?.slice(0, 5).map(chef => (
                      <button 
                        key={chef.id}
                        onClick={() => setSelectedChef(chef.id)}
                        disabled={chef.activeOrders >= chef.maxLoad}
                        className={`p-3 sm:p-4 rounded-xl border text-left transition-all ${
                          selectedChef === chef.id 
                            ? 'bg-grilli-gold/10 border-grilli-gold' 
                            : 'bg-grilli-black border-grilli-border opacity-60 hover:opacity-100'
                        } ${chef.activeOrders >= chef.maxLoad ? 'grayscale cursor-not-allowed opacity-30' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="block text-xs sm:text-sm font-serif font-bold italic">{chef.name}</span>
                          <span className="text-grilli-gold text-[9px] sm:text-[10px]">★ {chef.rating}</span>
                        </div>
                        <span className="block text-[8px] sm:text-[9px] font-bold uppercase tracking-tighter text-grilli-muted">
                          {chef.activeOrders >= chef.maxLoad ? 'BUSY' : `${chef.activeOrders}/${chef.maxLoad}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cart Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 bg-grilli-surface border border-grilli-border/50 rounded-xl p-6 sm:p-8 shadow-premium space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-serif font-bold italic">Your Order</h3>
                  <p className="text-[9px] sm:text-[10px] text-grilli-muted uppercase tracking-widest font-bold opacity-60">Table {session?.tableNumber}</p>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {cart.length === 0 ? (
                    <p className="text-xs text-grilli-muted italic py-8 text-center">Cart is empty</p>
                  ) : (
                    cart.map((item, i) => (
                      <div key={i} className="flex justify-between items-center group animate-fade-in">
                        <div className="flex-grow">
                          <span className="block text-xs sm:text-sm font-medium">{item.name}</span>
                          <span className="text-[8px] sm:text-[9px] font-bold text-grilli-gold uppercase">{item.station}</span>
                        </div>
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <span className="text-xs font-serif italic text-grilli-gold">${item.price}</span>
                          <button 
                            onClick={() => removeFromCart(i)} 
                            className="text-status-critical opacity-0 group-hover:opacity-100 transition-opacity text-lg"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-6 border-t border-grilli-border/30 space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] sm:text-[10px] font-bold text-grilli-muted uppercase tracking-widest">Total</span>
                    <span className="text-2xl sm:text-3xl font-serif font-bold text-grilli-gold italic">${total.toFixed(2)}</span>
                  </div>

                  <button 
                    onClick={placeOrder}
                    disabled={ordering || cart.length === 0}
                    className="w-full py-3 sm:py-4 bg-gold-gradient text-grilli-black font-bold uppercase tracking-widest text-[10px] sm:text-xs rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {ordering ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Section */}
        {orders.length > 0 && (
          <div className="space-y-8 sm:space-y-12">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold italic text-center">Your Orders</h3>
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

        <div className="flex justify-center pt-8 sm:pt-12">
          <button onClick={logout} className="text-[9px] sm:text-[10px] font-bold text-grilli-muted uppercase tracking-[0.4em] sm:tracking-[0.5em] hover:text-status-critical transition-colors">Terminate Session</button>
        </div>
      </main>
    </div>
  );
};

export default CustomerView;
