import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CarFront, Clock, UserCheck, Wrench, ShieldAlert, ArrowLeft, Printer, Edit2 } from 'lucide-react';
import jsPDF from 'jspdf';
import type { Vehicle, Client, ServiceRecord } from '../types';
import { NuevoServicioModal } from './NuevoServicioModal';
import api from '../api';

export function PerfilVehiculo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [owner, setOwner] = useState<Client | null>(null);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedServiceToEdit, setSelectedServiceToEdit] = useState<ServiceRecord | null>(null);
  const [selectedNewOwner, setSelectedNewOwner] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const vehicleRes = await api.get(`/vehiculos/${id}`);
      const currentVehicle = vehicleRes.data;
      
      if (currentVehicle) {
        setVehicle(currentVehicle);
        
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

  const generarPDFServicio = (service: ServiceRecord) => {
    if (!vehicle || !owner) return;
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246);
    doc.text("CLP Taller", 20, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Comprobante de Servicio", 20, 38);
    
    // Info del Cliente y Fecha
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    const serviceDate = new Date(service.date).toLocaleDateString();
    doc.text(`Fecha del Servicio: ${serviceDate}`, 20, 55);
    
    doc.text("Datos del Cliente:", 20, 70);
    doc.setFontSize(10);
    doc.text(`Nombre: ${owner.name}`, 20, 78);
    doc.text(`Teléfono: ${owner.phone}`, 20, 84);

    // Info del Vehiculo
    doc.setFontSize(12);
    doc.text("Datos del Vehículo:", 120, 70);
    doc.setFontSize(10);
    doc.text(`Dominio: ${vehicle.plate.toUpperCase()}`, 120, 78);
    doc.text(`Marca/Modelo: ${vehicle.brand} ${vehicle.model}`, 120, 84);
    doc.text(`Kilometraje actual: ${service.mileage} km`, 120, 90);

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 100, 190, 100);

    // Detalle
    doc.setFontSize(12);
    doc.text("Detalle del Trabajo Realizado:", 20, 115);
    doc.setFontSize(10);
    
    const splitDesc = doc.splitTextToSize(service.description, 170);
    doc.text(splitDesc, 20, 125);

    // Cost
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 160, 190, 160);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Abonado: $${service.cost}`, 20, 175);

    doc.save(`Servicio-${vehicle.plate}-${serviceDate.replace(/\//g, '-')}.pdf`);
  };

  if (loading) return <div className="glass-panel" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando perfil...</div>;
  if (!vehicle) return <div className="glass-panel" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No hay vehículos registrados aún.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-secondary" 
        style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', padding: '0' }}
      >
        <ArrowLeft size={16} /> Volver
      </button>

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
          <button className="btn btn-primary" onClick={() => { setSelectedServiceToEdit(null); setIsServiceModalOpen(true); }}>
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
              <div key={service.id} style={{ padding: '1.25rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
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
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button className="btn btn-secondary" style={{ padding: '0.5rem' }} title="Editar Servicio" onClick={() => { setSelectedServiceToEdit(service); setIsServiceModalOpen(true); }}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '0.5rem' }} title="Imprimir Comprobante" onClick={() => generarPDFServicio(service)}>
                    <Printer size={16} />
                  </button>
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

      {/* Modal Nuevo/Editar Servicio */}
      <NuevoServicioModal
        isOpen={isServiceModalOpen}
        onClose={() => { setIsServiceModalOpen(false); setSelectedServiceToEdit(null); }}
        vehicle={vehicle}
        existingService={selectedServiceToEdit}
        onSuccess={fetchData} 
      />
    </div>
  );
}
