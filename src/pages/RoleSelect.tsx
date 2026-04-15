import React, { useState } from 'react';
import { useSession, UserRole } from '../context/SessionContext';

const RoleSelect: React.FC = () => {
  const { login } = useSession();
  const [role, setRole] = useState<UserRole>('customer');
  const [name, setName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (role === 'customer' && !tableNumber.trim()) {
      setError('Table number is required for customers');
      return;
    }
    
    setLoading(true);
    try {
      await login(name.trim() || 'Guest', role, tableNumber.trim());
    } catch (error) {
      console.error('Login failed:', error);
      setError('Unable to connect to server. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-grilli-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-grilli-gold/5 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-grilli-gold/5 blur-[120px] rounded-full animate-pulse delay-700"></div>

      <div className="w-full max-w-md space-y-12 relative z-10 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="inline-block px-4 py-1 border border-grilli-gold/20 bg-grilli-surface/50 rounded-full">
            <span className="text-[10px] font-bold text-grilli-gold uppercase tracking-[0.4em]">Kitchen Pulse v2.5</span>
          </div>
          <h1 className="text-5xl font-serif font-bold text-grilli-text italic tracking-tighter">
            Select Your <span className="text-grilli-gold">Domain</span>
          </h1>
          <p className="text-grilli-muted text-sm font-medium tracking-wide">Enter the autonomous ecosystem.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-grilli-surface border border-grilli-border/50 p-8 rounded-2xl shadow-premium space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-grilli-gold uppercase tracking-widest mb-3 opacity-60">Identity</label>
              <input 
                type="text" 
                placeholder="Enter Name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-grilli-black border border-grilli-border focus:border-grilli-gold/50 rounded-lg px-4 py-3 text-sm text-grilli-text outline-none transition-all placeholder:text-grilli-muted/30"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-grilli-gold uppercase tracking-widest mb-3 opacity-60">Operational Role</label>
              <div className="grid grid-cols-3 gap-3">
                {(['customer', 'waiter', 'manager'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-3 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all ${
                      role === r 
                        ? 'bg-grilli-gold text-grilli-black border-grilli-gold shadow-[0_0_15px_rgba(197,163,115,0.3)]' 
                        : 'bg-grilli-black text-grilli-muted border-grilli-border hover:border-grilli-gold/30'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {role === 'customer' && (
              <div className="animate-fade-in">
                <label className="block text-[10px] font-bold text-grilli-gold uppercase tracking-widest mb-3 opacity-60">Table Assignment</label>
                <input 
                  type="text" 
                  placeholder="Table Number (e.g. 12)"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full bg-grilli-black border border-grilli-border focus:border-grilli-gold/50 rounded-lg px-4 py-3 text-sm text-grilli-text outline-none transition-all placeholder:text-grilli-muted/30"
                  required
                />
              </div>
            )}
          </div>

          {error && (
            <div className="bg-status-critical/10 border border-status-critical/30 rounded-lg p-4 animate-fade-in">
              <p className="text-status-critical text-xs font-medium">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-gold-gradient text-grilli-black font-bold uppercase tracking-[0.2em] text-xs rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Initializing...' : 'Engage System'}
          </button>
        </form>

        <div className="text-center opacity-30">
          <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-grilli-muted">Secured by Agentic Intelligence</span>
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
