import { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [token]);

  const handleLogin = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // --- NEW FUNCTION: Updates Balance without reloading ---
  const handleBalanceUpdate = (newBalance) => {
    if (!user) return;
    
    // 1. Create updated user object
    const updatedUser = { ...user, balance: newBalance };
    
    // 2. Update State (React)
    setUser(updatedUser);
    
    // 3. Update Browser Storage (So it stays correct on reload)
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  //Watchlist locally
  const handleWatchlistUpdate = (newWatchlist) => {
    if (!user) return;
    const updatedUser = { ...user, watchlist: newWatchlist };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  // Pass the new function down to Dashboard
  return (
    <Dashboard 
      onLogout={handleLogout} 
      user={user} 
      onUpdateBalance={handleBalanceUpdate} 
      onUpdateWatchlist={handleWatchlistUpdate} 
    />
  );
}

export default App;