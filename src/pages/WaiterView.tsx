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
}

interface Chef {
  id: string;
  name: string;
  rating: number;
  bio: string;
  activeOrders: number;
  maxLoad: number;
}

const WaiterView: React.FC = () => {
  const { logout } = useSession();
  const [menu, setMenu] = useState<Record<string, MenuItem[]>>({});
  const [chefs, setChefs] = useState<Record<string, Chef[]>>({});
  const [cuisineLabels, setCuisineLabels] = useState<Record<string, string>>({});
  const [activeCuisine, setActiveCuisine] = useState<string>('');
  const [cart, setCart] = useState<MenuItem[]>([]);
  const [selectedChef, setSelectedChef] = useState<string>('auto');
  const [tableCode, setTableCode] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [showAllOrders, setShowAllOrders] = useState(false);

  useEffect(() => {
    fetch('/api/menu').then(res => res.json()).then(data => {
      setMenu(data.items);
      setCuisineLabels(data.cuisineLabels);
      setActiveCuisine(Object.keys(data.items)[0]);
    });
    fetch('/api/chefs').then(res => res.json()).then(data => setChefs(data.chefs));
    
    // Fetch all orders for waiter view
    fetch('/api/orders/all').then(res => res.json()).then(setAllOrders).catch(() => setAllOrders([]));
    
    // WebSocket for real-time order updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const wsUrl = isDev ? 'ws://localhost:3001' : `${protocol}//${window.location.host}`;
    
    const ws = new WebSocket(wsUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'register', role: 'waiter' }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'order_update') {
        setAllOrders(prev => {
          const index = prev.findIndex(o => o.id === data.payload.id);
          if (index >= 0) {
            const next = [...prev];
            next[index] = data.payload;
            return next;
          }
          return [data.payload, ...prev];
        });
      }
    };
    
    return () => ws.close();
  }, []);

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
    if (!tableCode || cart.length === 0) return;
    setOrdering(true);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableCode,
        items: cart,
        chefId: selectedChef === 'auto' ? null : selectedChef
      })
    });
    if (res.ok) {
      setOrderSuccess(true);
      setCart([]);
      setTableCode('');
      // Refresh all orders
      fetch('/api/orders/all').then(res => res.json()).then(setAllOrders);
      setTimeout(() => setOrderSuccess(false), 3000);
    }
    setOrdering(false);
  };

  const serveOrder = async (orderId: string) => {
    const res = await fetch(`/api/orders/${orderId}/serve`, { method: 'POST' });
    if (res.ok) {
      fetch('/api/orders/all').then(res => res.json()).then(setAllOrders);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'text-status-info';
      case 'preparing': return 'text-status-warning';
      case 'ready': return 'text-status-optimal';
      case 'served': return 'text-grilli-muted';
      default: return 'text-grilli-text';
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-grilli-black text-grilli-text font-sans pb-24">
      <Header connected={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 space-y-8 sm:space-y-12">
        {/* Header with View Toggle */}
        <section className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold italic">Waitstaff <span className="text-grilli-gold">Terminal</span></h2>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => setShowAllOrders(false)}
              className={`px-6 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${
                !showAllOrders 
                  ? 'bg-grilli-gold text-grilli-black border-grilli-gold' 
                  : 'border-grilli-border text-grilli-muted hover:border-grilli-gold/30'
              }`}
            >
              New Order
            </button>
            <button 
              onClick={() => setShowAllOrders(true)}
              className={`px-6 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${
                showAllOrders 
                  ? 'bg-grilli-gold text-grilli-black border-grilli-gold' 
                  : 'border-grilli-border text-grilli-muted hover:border-grilli-gold/30'
              }`}
            >
              All Orders ({allOrders.length})
            </button>
          </div>
        </section>

        {/* All Orders View */}
        {showAllOrders ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-serif font-bold italic text-grilli-gold">Active Orders</h3>
              <p className="text-[10px] text-grilli-muted uppercase tracking-widest">Real-time order monitoring</p>
            </div>
            
            {allOrders.length === 0 ? (
              <div className="py-24 text-center border border-grilli-border/30 rounded-2xl bg-grilli-surface/20">
                <p className="text-grilli-muted italic text-sm">No orders yet. Start taking orders!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allOrders.map(order => (
                  <div key={order.id} className="bg-grilli-surface border border-grilli-border/50 rounded-xl p-6 space-y-4 hover:border-grilli-gold/30 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-bold text-grilli-gold uppercase tracking-widest opacity-60">Table</span>
                        <h4 className="text-2xl font-serif font-bold italic">{order.tableCode}</h4>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold uppercase tracking-widest ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-grilli-muted uppercase tracking-widest">Order #{order.id}</span>
                      {order.items.slice(0, 3).map((item: any, idx: number) => (
                        <div key={idx} className="text-sm text-grilli-text">• {item.name}</div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="text-xs text-grilli-muted italic">+{order.items.length - 3} more items</div>
                      )}
                    </div>
                    
                    {order.status === 'ready' && (
                      <button 
                        onClick={() => serveOrder(order.id)}
                        className="w-full py-2 bg-status-optimal/20 border border-status-optimal/50 text-status-optimal rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-status-optimal/30 transition-all"
                      >
                        Mark as Served
                      </button>
                    )}
                    
                    {order.status === 'served' && (
                      <div className="text-center py-2 text-[9px] font-bold text-grilli-muted uppercase tracking-widest">
                        ✓ Served
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* New Order View - Original Menu */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
        {/* Menu Section */}
        <div className="lg:col-span-8 space-y-12">
          <section className="space-y-6">
            <div className="flex flex-wrap gap-4">
              {Object.keys(menu).map(c => (
                <button 
                  key={c}
                  onClick={() => setActiveCuisine(c)}
                  className={`px-6 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${
                    activeCuisine === c 
                      ? 'bg-grilli-gold text-grilli-black border-grilli-gold' 
                      : 'border-grilli-border text-grilli-muted hover:border-grilli-gold/30'
                  }`}
                >
                  {cuisineLabels[c]}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menu[activeCuisine]?.map(item => (
                <div key={item.id} className="p-6 bg-grilli-surface border border-grilli-border/50 rounded-2xl hover:border-grilli-gold/30 transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xl font-serif font-bold italic group-hover:text-grilli-gold transition-colors">{item.name}</h4>
                    <span className="text-grilli-gold font-serif italic">${item.price}</span>
                  </div>
                  <p className="text-xs text-grilli-muted leading-relaxed mb-6 h-8 overflow-hidden">{item.desc}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-grilli-muted uppercase tracking-widest">{item.time} MIN PREP</span>
                    <button 
                      onClick={() => addToCart(item)}
                      className="px-4 py-1.5 border border-grilli-gold/30 rounded text-[9px] font-bold text-grilli-gold uppercase tracking-widest hover:bg-grilli-gold hover:text-grilli-black transition-all"
                    >
                      Add to Deck
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Chef Intelligence Selection */}
          <section className="space-y-6 pt-12 border-t border-grilli-border/30">
            <div className="space-y-1">
              <h3 className="text-2xl font-serif font-bold italic text-grilli-gold">Chef Assignment</h3>
              <p className="text-[10px] text-grilli-muted uppercase tracking-widest font-bold opacity-60">Optimize culinary output</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => setSelectedChef('auto')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedChef === 'auto' 
                    ? 'bg-grilli-gold/10 border-grilli-gold' 
                    : 'bg-grilli-black border-grilli-border opacity-60 hover:opacity-100'
                }`}
              >
                <span className="block text-[10px] font-bold uppercase tracking-widest text-grilli-gold mb-1">Autonomous</span>
                <span className="block text-sm font-serif font-bold italic">Auto-Select Best Rated</span>
              </button>
              {chefs[activeCuisine]?.map(chef => (
                <button 
                  key={chef.id}
                  onClick={() => setSelectedChef(chef.id)}
                  disabled={chef.activeOrders >= chef.maxLoad}
                  className={`p-4 rounded-xl border text-left transition-all relative ${
                    selectedChef === chef.id 
                      ? 'bg-grilli-gold/10 border-grilli-gold' 
                      : 'bg-grilli-black border-grilli-border opacity-60 hover:opacity-100'
                  } ${chef.activeOrders >= chef.maxLoad ? 'grayscale cursor-not-allowed opacity-30' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="block text-sm font-serif font-bold italic">{chef.name}</span>
                    <span className="text-grilli-gold text-[10px]">★ {chef.rating}</span>
                  </div>
                  <span className="block text-[9px] font-bold uppercase tracking-tighter text-grilli-muted">Load: {chef.activeOrders}/{chef.maxLoad}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Order Sidebar */}
        <div className="lg:col-span-4">
          <div className="sticky top-32 space-y-8">
            <div className="bg-grilli-surface border border-grilli-border/50 rounded-2xl p-8 shadow-premium space-y-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-serif font-bold italic">Order Deck</h3>
                <p className="text-[10px] text-grilli-muted uppercase tracking-widest font-bold opacity-60">Waitstaff Terminal</p>
              </div>

              <div className="space-y-4 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
                {cart.length === 0 ? (
                  <p className="text-xs text-grilli-muted italic py-8 text-center">Your deck is empty.</p>
                ) : (
                  cart.map((item, i) => (
                    <div key={i} className="flex justify-between items-center group animate-fade-in">
                      <div className="flex-grow">
                        <span className="block text-sm font-medium">{item.name}</span>
                        <span className="text-[9px] font-bold text-grilli-gold uppercase">{item.station}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs font-serif italic text-grilli-gold">${item.price}</span>
                        <button onClick={() => removeFromCart(i)} className="text-status-critical opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-6 border-t border-grilli-border/30 space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-grilli-muted uppercase tracking-widest">Total Value</span>
                  <span className="text-3xl font-serif font-bold text-grilli-gold italic">${total.toFixed(2)}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-grilli-muted mb-2">Table Link Code</label>
                    <input 
                      type="text" 
                      placeholder="Enter Table Code..."
                      value={tableCode}
                      onChange={(e) => setTableCode(e.target.value)}
                      className="w-full bg-grilli-black border border-grilli-border rounded-lg px-4 py-3 text-sm text-grilli-text outline-none focus:border-grilli-gold/50 transition-all placeholder:text-grilli-muted/20"
                    />
                  </div>
                  
                  <button 
                    onClick={placeOrder}
                    disabled={ordering || cart.length === 0 || !tableCode}
                    className={`w-full py-4 bg-gold-gradient text-grilli-black font-bold uppercase tracking-widest text-xs rounded-lg transition-all ${orderSuccess ? 'bg-status-optimal text-white' : ''}`}
                  >
                    {ordering ? 'Transmitting...' : orderSuccess ? 'Order Transmitted' : 'Commit to Kitchen'}
                  </button>
                </div>
              </div>
            </div>

            <button onClick={logout} className="w-full text-[10px] font-bold text-grilli-muted uppercase tracking-[0.5em] hover:text-status-critical transition-colors text-center">Exit Terminal</button>
          </div>
        </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WaiterView;
