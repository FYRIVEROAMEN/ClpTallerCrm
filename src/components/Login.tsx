import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

export function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/login', { username, password });
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 2rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <Wrench size={32} className="text-primary" />
          </div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>CLP Taller</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Sistema de Gestión Integral</p>
        </div>

        {error && (
          <div style={{ width: '100%', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', color: '#f87171', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              required
              type="text" 
              placeholder="Usuario"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'white', outline: 'none' }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              required
              type="password" 
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'white', outline: 'none' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }}
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          © {new Date().getFullYear()} CLP Taller Mecánico
        </p>
      </div>
    </div>
  );
}
