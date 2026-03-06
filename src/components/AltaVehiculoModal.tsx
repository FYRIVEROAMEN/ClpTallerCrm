import React, { useState } from 'react';
import { X, CarFront, Hash, Gauge, Tag } from 'lucide-react';
import type { Client } from '../types';
import api from '../api';

interface AltaVehiculoModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client;
  onSuccess?: () => void;
}

export function AltaVehiculoModal({ isOpen, onClose, client, onSuccess }: AltaVehiculoModalProps) {
  const [formData, setFormData] = useState({
    plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    currentMileage: 0
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return alert('Debes seleccionar un cliente.');
    
    try {
      await api.post('/vehiculos', {
        id: `v${Date.now()}`,
        ...formData,
        ownerId: client.id
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error registrando vehículo.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>
        
        <h2>Registrar Nuevo Vehículo</h2>
        <p style={{ marginBottom: '1.5rem' }}>
          {client ? `Asociar auto a ${client.name}` : 'Ingresa los datos del nuevo vehículo'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Patente</label>
              <div style={{ position: 'relative' }}>
                <Hash size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input 
                  required
                  type="text" 
                  value={formData.plate}
                  onChange={(e) => setFormData({...formData, plate: e.target.value.toUpperCase()})}
                  placeholder="AAA123" 
                  className="form-input"
                  style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'white', textTransform: 'uppercase' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Kilometraje Actual</label>
              <div style={{ position: 'relative' }}>
                <Gauge size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input 
                  required
                  type="number" 
                  min="0"
                  value={formData.currentMileage}
                  onChange={(e) => setFormData({...formData, currentMileage: Number(e.target.value)})}
                  className="form-input"
                  style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'white' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Marca</label>
              <div style={{ position: 'relative' }}>
                <CarFront size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input 
                  required
                  type="text" 
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  placeholder="Ej. Toyota" 
                  className="form-input"
                  style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'white' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Modelo</label>
              <div style={{ position: 'relative' }}>
                <Tag size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input 
                  required
                  type="text" 
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  placeholder="Ej. Corolla" 
                  className="form-input"
                  style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'white' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Año</label>
            <input 
              required
              type="number" 
              min="1900"
              max={new Date().getFullYear() + 1}
              value={formData.year}
              onChange={(e) => setFormData({...formData, year: Number(e.target.value)})}
              className="form-input"
              style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'white' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Registrar Vehículo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
