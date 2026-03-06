import React, { useState } from 'react';
import { X, Wrench, DollarSign, Gauge } from 'lucide-react';
import type { Vehicle } from '../types';
import api from '../api';

interface NuevoServicioModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  onSuccess: () => void;
}

export function NuevoServicioModal({ isOpen, onClose, vehicle, onSuccess }: NuevoServicioModalProps) {
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState(0);
  const [mileage, setMileage] = useState(vehicle?.currentMileage || 0);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !vehicle) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/vehiculos/${vehicle.id}/servicio`, {
        serviceId: `s${Date.now()}`,
        description,
        mileage,
        cost
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error al guardar el servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
          <X size={20} />
        </button>
        
        <h2>Nuevo Servicio</h2>
        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>
          Registra un nuevo mantenimiento para el vehículo {vehicle.plate}.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Descripción del trabajo</label>
            <div style={{ position: 'relative' }}>
              <Wrench size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                required type="text" 
                value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Ej. Cambio de Aceite y Filtros" 
                className="form-input"
                style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'white' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Costo Total ($)</label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input 
                  required type="number" min="0" step="0.01"
                  value={cost} onChange={e => setCost(Number(e.target.value))}
                  className="form-input"
                  style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'white' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Nuevo Kilometraje</label>
              <div style={{ position: 'relative' }}>
                <Gauge size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input 
                  required type="number" min={vehicle.currentMileage}
                  value={mileage} onChange={e => setMileage(Number(e.target.value))}
                  className="form-input"
                  style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'white' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
