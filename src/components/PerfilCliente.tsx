import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, CarFront, ShieldAlert, ArrowLeft } from 'lucide-react';
import type { Client, Vehicle } from '../types';
import api from '../api';

export function PerfilCliente() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clienteRes, vehiculosRes] = await Promise.all([
        api.get(`/clientes/${id}`),
        api.get('/vehiculos')
      ]);
      if (typeof clienteRes.data === 'string') {
        throw new Error('Server returned HTML instead of JSON. The backend might be down or missing the endpoint.');
      }
      setClient(clienteRes.data);
      setVehicles(vehiculosRes.data.filter((v: Vehicle) => v.ownerId === id));
    } catch (err) {
      console.error('Error cargando cliente:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="glass-panel" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando datos del cliente...</div>;
  if (!client || !client.id) return (
    <div className="glass-panel" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <ShieldAlert size={48} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
      <h3>Error de conexión con el Servidor</h3>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', textAlign: 'center' }}>
        No se pudo obtener la información del cliente. Si acabas de actualizar la aplicación, <strong>asegúrate de haber reiniciado tu servidor backend (Node.js)</strong> para que cargue las nuevas rutas.
      </p>
      <button onClick={() => navigate(-1)} className="btn btn-primary" style={{ marginTop: '1rem' }}>Volver atrás</button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-secondary" 
        style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', padding: '0' }}
      >
        <ArrowLeft size={16} /> Volver
      </button>

      {/* Header Cliente */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)' }}>
            <User size={40} className="text-primary" />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{client.name || 'Titular Desconocido'}</h1>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', color: 'var(--color-text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} /> {client.phone || 'Sin teléfono'}
              </span>
              {client.email && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={16} /> {client.email}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vehículos del Cliente */}
      <div className="glass-panel">
        <h3 style={{ marginBottom: '1.5rem' }}>Vehículos Registrados</h3>
        
        {vehicles.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {vehicles.map((v) => (
              <div key={v.id} style={{ 
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                      <CarFront size={24} className="text-primary" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{v.plate}</h4>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{v.brand} {v.model}</p>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Año: {v.year}</span>
                  <Link to={`/vehiculo/${v.id}`} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                    Historial
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)' }}>
            <ShieldAlert size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Este cliente no tiene vehículos cargados.</p>
          </div>
        )}
      </div>
    </div>
  );
}
