import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, CheckCircle2, AlertTriangle, CarFront, Plus, Edit2, X, ExternalLink } from 'lucide-react';
import type { WorkBay, Vehicle } from '../types';
import api from '../api';

export function DashboardBahias() {
  const navigate = useNavigate();
  const [bays, setBays] = useState<WorkBay[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedBay, setSelectedBay] = useState<WorkBay | null>(null);

  // Estados Edicion
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  
  // Estado Creacion
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [baysRes, vehiclesRes] = await Promise.all([
        api.get('/bahias'),
        api.get('/vehiculos')
      ]);
      setBays(baysRes.data);
      setVehicles(vehiclesRes.data);
    } catch (err) {
      console.error('Error cargando bahías', err);
    }
  };

  const getVehicleInfo = (vehicleId?: string): Vehicle | undefined => {
    if (!vehicleId) return undefined;
    return vehicles.find(v => v.id === vehicleId);
  };

  const handleLiberarBay = async (bayId: string) => {
    try {
      await api.put(`/bahias/${bayId}/asignar`, { vehicleId: null });
      fetchData();
    } catch (err) { alert('Error al liberar'); }
  };

  const handleConfirmAssign = async (vehicleId: string) => {
    if (!selectedBay || !vehicleId) return;
    try {
      await api.put(`/bahias/${selectedBay.id}/asignar`, { vehicleId });
      setIsAssignModalOpen(false);
      fetchData();
    } catch (err) { alert('Error de asignacion'); }
  };

  const handleEditName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBay) return;
    try {
      await api.put(`/bahias/${selectedBay.id}/nombre`, { name: editName });
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) { alert('Error cambio nombre'); }
  };

  const handleCreateBay = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/bahias`, { id: `wb${Date.now()}`, name: newName });
      setIsCreateModalOpen(false);
      setNewName('');
      fetchData();
    } catch (err) { alert('Error creando bahia'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div className="mobile-col" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>Estado del Taller</h1>
          <p>Monitorea y asigna vehículos a las diferentes bahías de trabajo.</p>
        </div>
        <div className="mobile-col" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem', background: 'var(--color-surface)', padding: '0.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingRight: '1rem', borderRight: '1px solid var(--color-border)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Disponibles 
                <strong style={{ color: 'white', marginLeft: '0.5rem' }}>{bays.filter(b => !b.isOccupied).length}</strong>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-warning)' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Ocupadas 
                <strong style={{ color: 'white', marginLeft: '0.5rem' }}>{bays.filter(b => b.isOccupied).length}</strong>
              </span>
            </div>
          </div>
          
          <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={18} /> Nueva Bahía
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {bays.map(bay => {
          const vehicle = getVehicleInfo(bay.currentVehicleId);
          
          return (
            <div key={bay.id} className="glass-panel" style={{ 
              position: 'relative', 
              overflow: 'hidden',
              borderTop: `4px solid ${bay.isOccupied ? 'var(--color-warning)' : 'var(--color-success)'}` 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Settings 
                    size={20} 
                    className={bay.isOccupied ? 'text-warning' : 'text-success'} 
                    style={{ cursor: 'pointer' }}
                    onClick={() => { setSelectedBay(bay); setEditName(bay.name); setIsEditModalOpen(true); }}
                  />
                  {bay.name}
                  <button className="btn" style={{ padding: '0.2rem', background: 'transparent', border:'none', color: 'var(--color-text-muted)' }} onClick={() => { setSelectedBay(bay); setEditName(bay.name); setIsEditModalOpen(true); }}>
                     <Edit2 size={12} />
                  </button>
                </h3>
                {bay.isOccupied ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--color-warning)', fontWeight: 600 }}>
                    <AlertTriangle size={14} /> Ocupada
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 600 }}>
                    <CheckCircle2 size={14} /> Disponible
                  </span>
                )}
              </div>

              {bay.isOccupied && vehicle ? (
                <div 
                  onClick={() => navigate(`/cliente/${vehicle.ownerId}`)}
                  style={{ 
                    padding: '1rem', 
                    background: 'var(--color-surface)', 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid var(--color-border)', 
                    marginBottom: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', color: 'var(--color-text-muted)' }}>
                    <ExternalLink size={14} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                      <CarFront size={24} style={{ color: 'var(--color-warning)' }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', marginBottom: '0.1rem' }}>{vehicle.plate}</h4>
                      <p style={{ fontSize: '0.85rem' }}>{vehicle.brand} {vehicle.model}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)', marginBottom: '1.5rem' }}>
                  <p style={{ color: 'var(--color-text-muted)' }}>Espacio vacío</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {bay.isOccupied ? (
                  <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => handleLiberarBay(bay.id)}>
                    Liberar Bahía
                  </button>
                ) : (
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { setSelectedBay(bay); setIsAssignModalOpen(true); }}>
                    <Plus size={16} /> Ingresar Vehículo
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Nueva Bahía */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setIsCreateModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={20}/></button>
            <h3 style={{ marginBottom: '1.5rem' }}>Agregar Nueva Bahía</h3>
            <form onSubmit={handleCreateBay}>
              <input required autoFocus type="text" placeholder="Nombre de la bahía" value={newName} onChange={e => setNewName(e.target.value)} className="form-input" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', background: 'var(--color-surface)', color: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Editar Nombre */}
      {isEditModalOpen && selectedBay && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setIsEditModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={20}/></button>
            <h3 style={{ marginBottom: '1.5rem' }}>Editar Bahía</h3>
            <form onSubmit={handleEditName}>
              <input required autoFocus type="text" value={editName} onChange={e => setEditName(e.target.value)} className="form-input" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', background: 'var(--color-surface)', color: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Asignar Vehículo */}
      {isAssignModalOpen && selectedBay && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setIsAssignModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={20}/></button>
            <h3 style={{ marginBottom: '1.5rem' }}>Asignar Vehículo</h3>
            <select id="vehicle-select" className="form-input" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', background: 'var(--color-surface)', color: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
              <option value="">Seleccionar vehículo pendiente...</option>
              {vehicles.filter(v => !bays.find(b => b.currentVehicleId === v.id)).map(v => (
                <option key={v.id} value={v.id}>{v.plate} - {v.brand} {v.model}</option>
              ))}
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setIsAssignModalOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => {
                const selectElement = document.getElementById('vehicle-select') as HTMLSelectElement;
                handleConfirmAssign(selectElement.value);
              }}>Confirmar Ingreso</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
