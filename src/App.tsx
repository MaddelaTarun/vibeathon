import React from 'react';
import { SessionProvider, useSession } from './context/SessionContext';
import RoleSelect from './pages/RoleSelect';
import CustomerView from './pages/CustomerView';
import WaiterView from './pages/WaiterView';
import ManagerView from './pages/ManagerView';

const AppRouter: React.FC = () => {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen bg-grilli-black flex items-center justify-center">
        <div className="text-grilli-gold font-serif italic text-2xl animate-pulse">Initializing Ecosystem...</div>
      </div>
    );
  }

  if (!session) {
    return <RoleSelect />;
  }

  switch (session.role) {
    case 'customer':
      return <CustomerView />;
    case 'waiter':
      return <WaiterView />;
    case 'manager':
      return <ManagerView />;
    default:
      return <RoleSelect />;
  }
};

function App() {
  return (
    <SessionProvider>
      <AppRouter />
    </SessionProvider>
  );
}

export default App;
