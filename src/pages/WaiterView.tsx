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

  useEffect(() => {
    fetch('/api/menu').then(res => res.json()).then(data => {
      setMenu(data.items);
      setCuisineLabels(data.cuisineLabels);
      setActiveCuisine(Object.keys(data.items)[0]);
    });
    fetch('/api/chefs').then(res => res.json()).then(data => setChefs(data.chefs));
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
      setTimeout(() => setOrderSuccess(false), 3000);
    }
    setOrdering(false);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-grilli-black text-grilli-text font-sans pb-24">
      <Header connected={true} />

      <main className="max-w-7xl mx-auto px-8 pt-32 grid grid-cols-1 lg:grid-cols-12 gap-12">
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
      </main>
    </div>
  );
};

export default WaiterView;
