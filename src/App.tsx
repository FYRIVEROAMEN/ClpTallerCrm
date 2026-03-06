import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Wrench, Users, Calendar, LayoutDashboard, LogOut } from 'lucide-react';
import { ClientesList } from './components/ClientesList';
import { PerfilVehiculo } from './components/PerfilVehiculo';
import { DashboardBahias } from './components/DashboardBahias';
import { CalendarioTurnos } from './components/CalendarioTurnos';
import { Login } from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

function Layout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div>
          <div className="sidebar-logo">
            <Wrench size={24} className="text-primary" />
            <span>CLP Taller</span>
          </div>
          
          <nav className="nav-links">
            <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <LayoutDashboard size={20} />
              Dashboard
            </NavLink>
            <NavLink to="/clientes" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <Users size={20} />
              Clientes
            </NavLink>
            <NavLink to="/turnos" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <Calendar size={20} />
              Turnos
            </NavLink>
          </nav>
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user?.username}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Mecánico</span>
            </div>
          </div>
          <button onClick={logout} className="btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </aside>
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando sistema...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><DashboardBahias /></ProtectedRoute>} />
          <Route path="/clientes" element={<ProtectedRoute><ClientesList /></ProtectedRoute>} />
          <Route path="/vehiculo" element={<ProtectedRoute><PerfilVehiculo /></ProtectedRoute>} />
          <Route path="/turnos" element={<ProtectedRoute><CalendarioTurnos /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
