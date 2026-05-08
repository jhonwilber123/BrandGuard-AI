import { useState } from 'react';
import LoginView from './components/LoginView';
import CreatorDashboard from './components/CreatorDashboard';
import AuditDashboard from './components/AuditDashboard';
import DnaArchitect from './components/DnaArchitect';
import './index.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  const handleLogin = (data) => {
    setToken(data.access_token);
    setRole(data.role);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('role', data.role);
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  return (
    <div className="app-container">
      <nav className="nav-bar animate-fade-in">
        <h2>BrandGuard <span className="gradient-text">AI</span></h2>
        {token && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Rol Activo: <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{role.replace('_', ' ')}</strong>
            </span>
            <button onClick={handleLogout} style={{ width: 'auto', padding: '0.5rem 1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              Cerrar Sesión
            </button>
          </div>
        )}
      </nav>

      <main>
        {!token ? (
          <LoginView onLogin={handleLogin} />
        ) : role === 'creator' ? (
          <CreatorDashboard token={token} />
        ) : role === 'approver_a' ? (
          <DnaArchitect token={token} />
        ) : (
          <AuditDashboard token={token} role={role} />
        )}
      </main>
    </div>
  );
}

export default App;
