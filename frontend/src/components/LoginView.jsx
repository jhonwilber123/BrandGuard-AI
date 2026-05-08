import { useState } from 'react';

const LoginView = ({ onLogin }) => {
  const [username, setUsername] = useState('creador1');
  const [password, setPassword] = useState('pwd');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Usar variable de entorno si existe, si no fallback a localhost (puerto por defecto de FastAPI)
      const baseUrl = 'http://127.0.0.1:8000'; 
      const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error('Credenciales incorrectas o servidor no disponible.');
      }

      const data = await response.json();
      onLogin(data);
    } catch (err) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Acceso al Sistema</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Ingresa como <br/>
          <strong style={{color:'var(--text-primary)'}}>creador1</strong>, <strong style={{color:'var(--text-primary)'}}>aprobador1</strong> o <strong style={{color:'var(--text-primary)'}}>aprobador2</strong> <br/>
          (clave: pwd)
        </p>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239,68,68,0.3)', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Usuario</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            placeholder="Ej. creador1"
          />
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Contraseña</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Iniciando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
};

export default LoginView;
