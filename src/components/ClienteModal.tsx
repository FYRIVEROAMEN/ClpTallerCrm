import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail } from 'lucide-react';
import type { Client } from '../types';

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteAEditar?: Client;
  onGuardar: (cliente: Partial<Client>) => void;
}

export function ClienteModal({ isOpen, onClose, clienteAEditar, onGuardar }: ClienteModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (clienteAEditar) {
      setFormData({
        name: clienteAEditar.name,
        phone: clienteAEditar.phone,
        email: clienteAEditar.email
      });
    } else {
      setFormData({ name: '', phone: '', email: '' });
    }
  }, [clienteAEditar, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar(formData);
    onClose();
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
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>
        
        <h2>{clienteAEditar ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
        <p style={{ marginBottom: '1.5rem' }}>
          {clienteAEditar ? 'Modifica los datos de contacto' : 'Ingresa la información básica'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Nombre Completo</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ej. Juan Pérez" 
                className="form-input"
                style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'white' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Teléfono (WhatsApp)</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                required
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+54 11 ..." 
                className="form-input"
                style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'white' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                required
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="correo@ejemplo.com" 
                className="form-input"
                style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'white' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {clienteAEditar ? 'Guardar Cambios' : 'Registrar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
