import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'customer' | 'waiter' | 'manager';

interface Session {
  sessionId: string;
  name: string;
  role: UserRole;
  tableCode?: string;
  tableNumber?: string;
}

interface SessionContextType {
  session: Session | null;
  login: (name: string, role: UserRole, tableNumber?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('kp_session');
    if (saved) {
      setSession(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const login = async (name: string, role: UserRole, tableNumber?: string) => {
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, tableNumber })
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      setSession(data);
      localStorage.setItem('kp_session', JSON.stringify(data));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('kp_session');
  };

  return (
    <SessionContext.Provider value={{ session, login, logout, loading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
