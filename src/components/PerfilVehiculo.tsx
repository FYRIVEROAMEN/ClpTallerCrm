import { useState, useEffect } from 'react';
import { CarFront, Clock, UserCheck, Wrench, ShieldAlert } from 'lucide-react';
import type { Vehicle, Client, ServiceRecord } from '../types';
import { NuevoServicioModal } from './NuevoServicioModal';
import api from '../api';

export function PerfilVehiculo() {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [owner, setOwner] = useState<Client | null>(null);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedNewOwner, setSelectedNewOwner] = useState('');

  // En un proyecto real leeríamos el :id desde useParams. Para esta simplificación usaremos uso del primer vehículo si no se pasó por estado u otra prop, pero asumimos que sí está en el backend.
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetchear los vehiculos y obtener el 1ero por simplificacion (como en el original)
      // O idealmente un ID si lo pasa la ruta. Aquí mantenemos el comportamiento anterior:
      const vehiclesRes = await api.get('/vehiculos');
      if (vehiclesRes.data.length > 0) {
        const currentVehicle = vehiclesRes.data[0];
        setVehicle(currentVehicle);
        
        // Obtener restantes
        const [serviciosRes, clientesRes] = await Promise.all([
          api.get(`/vehiculos/${currentVehicle.id}/servicios`),
          api.get('/clientes')
        ]);
        
        setServices(serviciosRes.data);
        setClients(clientesRes.data);
        
        const vehOwner = clientesRes.data.find((c: Client) => c.id === currentVehicle.ownerId);
        setOwner(vehOwner || null);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedNewOwner || !vehicle) return;
    try {
      await api.put(`/vehiculos/${vehicle.id}/transferir`, { newOwnerId: selectedNewOwner });
      setIsTransferModalOpen(false);
      fetchData(); // Recargar owner
    } catch (err) {
      alert('Error en transferencia');
    }
  };

  if (loading) return <div className="glass-panel" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando perfil...</div>;
  if (!vehicle) return <div className="glass-panel" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No hay vehículos registrados aún.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Perfil */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)' }}>
            <CarFront size={40} className="text-primary" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
              <h1 style={{ fontSize: '2rem' }}>{vehicle.plate}</h1>
              <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-success)', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 500 }}>
                Activo
              </span>
            </div>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text)' }}>
              {vehicle.brand} {vehicle.model} ({vehicle.year})
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', color: 'var(--color-text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} /> {vehicle.currentMileage.toLocaleString()} km
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={16} /> {owner?.name || 'Sin propietario'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => setIsTransferModalOpen(true)}>
            Transferir Propiedad
          </button>
          <button className="btn btn-primary" onClick={() => setIsServiceModalOpen(true)}>
            + Nuevo Servicio
          </button>
        </div>
      </div>

      {/* Historial de Mantenimiento */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>Historial de Mantenimiento</h3>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            {services.length} registros
          </span>
        </div>

        {services.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {services.map((service: ServiceRecord) => (
              <div key={service.id} style={{ padding: '1.25rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', gap: '1.5rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Wrench size={24} className="text-primary" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.1rem' }}>{service.description}</h4>
                    <span style={{ fontWeight: 600 }}>${service.cost.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    <span>Fecha: {new Date(service.date).toLocaleDateString()}</span>
                    <span>Kilometraje: {service.mileage.toLocaleString()} km</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)' }}>
            <ShieldAlert size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Este vehículo no tiene historial de mantenimiento registrado.</p>
          </div>
        )}
      </div>
      
      {/* Modal Transferencia Dummy */}
      {isTransferModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Transferir Vehículo</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              El historial de mantenimiento <strong>se mantendrá intacto</strong>. Solo cambiará el propietario asociado.
            </p>
            <select 
              value={selectedNewOwner}
              onChange={e => setSelectedNewOwner(e.target.value)}
              className="form-input" 
              style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', background: 'var(--color-surface)', color: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
            >
              <option value="">Seleccionar nuevo propietario...</option>
              {clients.filter(c => c.id !== vehicle.ownerId).map(client => (
                <option key={client.id} value={client.id}>{client.name} ({client.phone})</option>
              ))}
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setIsTransferModalOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleTransfer} disabled={!selectedNewOwner}>Confirmar Traspaso</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Servicio */}
      <NuevoServicioModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        vehicle={vehicle}
        onSuccess={fetchData} 
      />
    </div>
  );
}
