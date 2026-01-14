import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api.js';
import { useAuth } from '../state/AuthContext.jsx';
import AuthPage from './AuthPage.jsx';
import Dashboard from './Dashboard.jsx';
import Positions from './Positions.jsx';
import AdminPanel from './AdminPanel.jsx';

const App = () => {
  const { token, user, setUser, logout } = useAuth();
  const [view, setView] = useState('dashboard');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      return;
    }
    apiRequest('/api/me', { token })
      .then(setUser)
      .catch(() => logout());
  }, [token, setUser, logout]);

  if (!token) {
    return <AuthPage onAuth={() => setView('dashboard')} />;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="container py-4">
      <header className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h3 mb-0">Options Tracking MVP</h1>
          <p className="text-muted mb-0">Suivi de vos stratégies et performances options.</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="badge text-bg-dark">{user?.role}</span>
          <button className="btn btn-outline-secondary" onClick={handleLogout}>Déconnexion</button>
        </div>
      </header>

      <nav className="nav nav-pills mb-4">
        <button className={`nav-link ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>Dashboard</button>
        <button className={`nav-link ${view === 'positions' ? 'active' : ''}`} onClick={() => setView('positions')}>Positions</button>
        {user?.role === 'admin' && (
          <button className={`nav-link ${view === 'admin' ? 'active' : ''}`} onClick={() => setView('admin')}>Administration</button>
        )}
      </nav>

      {error && <div className="alert alert-danger">{error}</div>}

      {view === 'dashboard' && <Dashboard token={token} onError={setError} />}
      {view === 'positions' && <Positions token={token} onError={setError} />}
      {view === 'admin' && user?.role === 'admin' && <AdminPanel token={token} onError={setError} />}
    </div>
  );
};

export default App;
