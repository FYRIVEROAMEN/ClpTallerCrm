import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, Type, DollarSign, Printer, Mail, MessageCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import type { Client, Vehicle } from '../types';
import api from '../api';

interface TurnoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuardar: (datosTurno: any) => void;
}

export function TurnoModal({ isOpen, onClose, onGuardar }: TurnoModalProps) {
  const [formData, setFormData] = useState({
    date: '',
    time: '10:00',
    clientId: '',
    vehicleId: '',
    reason: '',
    estimatedCost: 0
  });
  
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        api.get('/clientes'),
        api.get('/vehiculos')
      ]).then(([cRes, vRes]) => {
        setClients(cRes.data);
        setVehicles(vRes.data);
      }).catch(err => console.error("Error al cargar datos para turno", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar(formData);
    onClose();
  };

  const generarPDF = () => {
    const client = clients.find(c => c.id === formData.clientId);
    const vehicle = vehicles.find(v => v.id === formData.vehicleId);

    if (!client || !vehicle) {
      alert("Selecciona un cliente y vehículo para generar el comprobante.");
      return;
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246); // Primary Color
    doc.text("CLP Taller", 20, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Presupuesto / Comprobante de Turno", 20, 38);
    
    // Info del Cliente y Fecha
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(`Fecha del Turno: ${formData.date} a las ${formData.time} hs`, 20, 55);
    
    doc.text("Datos del Cliente:", 20, 70);
    doc.setFontSize(10);
    doc.text(`Nombre: ${client.name}`, 20, 78);
    doc.text(`Teléfono: ${client.phone}`, 20, 84);
    if(client.email) doc.text(`Email: ${client.email}`, 20, 90);

    // Info del Vehiculo
    doc.setFontSize(12);
    doc.text("Datos del Vehículo:", 120, 70);
    doc.setFontSize(10);
    doc.text(`Dominio: ${vehicle.plate.toUpperCase()}`, 120, 78);
    doc.text(`Marca/Modelo: ${vehicle.brand} ${vehicle.model}`, 120, 84);
    doc.text(`Año: ${vehicle.year}`, 120, 90);

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 100, 190, 100);

    // Detalle de Reparacion
    doc.setFontSize(12);
    doc.text("Detalle de la Reparación / Mantenimiento:", 20, 115);
    doc.setFontSize(10);
    
    // Splitting long text reason into lines
    const splitReason = doc.splitTextToSize(formData.reason || "Sin especificar", 170);
    doc.text(splitReason, 20, 125);

    // Cost
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 160, 190, 160);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Cotización Estimada: $${formData.estimatedCost}`, 20, 175);

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Los valores expresados son estimativos y sujetos a revisión una vez ingresado el vehículo.", 20, 200);

    doc.save(`Presupuesto-${vehicle.plate}-${formData.date}.pdf`);
  };

  const vehiculosCliente = formData.clientId 
    ? vehicles.filter(v => v.ownerId === formData.clientId)
    : [];

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
        
        <h2>Agendar Turno</h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Programa una nueva reparación o mantenimiento preventivo.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Fecha</label>
              <div style={{ position: 'relative' }}>
                <CalendarIcon size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input 
                  required
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="form-input"
                  style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'white' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Horario</label>
              <div style={{ position: 'relative' }}>
                <Clock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input 
                  required
                  type="time" 
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="form-input"
                  style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'white' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Cliente</label>
            <select 
              required
              value={formData.clientId}
              onChange={(e) => setFormData({...formData, clientId: e.target.value, vehicleId: ''})}
              className="form-input"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'white' }}
            >
              <option value="">Selecciona un cliente...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Vehículo</label>
            <select 
              required
              disabled={!formData.clientId}
              value={formData.vehicleId}
              onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
              className="form-input"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'white', opacity: !formData.clientId ? 0.5 : 1 }}
            >
              <option value="">Selecciona un vehículo...</option>
              {vehiculosCliente.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.brand}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Motivo de la reparación</label>
              <div style={{ position: 'relative' }}>
                  <Type size={16} style={{ position: 'absolute', left: '0.75rem', top: '1rem', color: 'var(--color-text-muted)' }} />
                  <textarea 
                    required
                    rows={3}
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    placeholder="Ej. Cambio de Aceite y Filtros..."
                    className="form-input"
                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'white', resize: 'vertical' }}
                  />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Cotización ($)</label>
              <div style={{ position: 'relative', height: '100%' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: '0.75rem', top: '1rem', color: 'var(--color-text-muted)' }} />
                  <input 
                    type="number"
                    min="0" step="100"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({...formData, estimatedCost: Number(e.target.value)})}
                    className="form-input"
                    style={{ width: '100%', height: 'calc(100% - 10px)', padding: '0.75rem 0.75rem 0.75rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'white', resize: 'vertical' }}
                  />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" title="Descargar Presupuesto PDF" onClick={generarPDF}>
                <Printer size={18} />
              </button>
              <button type="button" className="btn btn-secondary" title="Enviar por Email" onClick={() => {
                const client = clients.find(c => c.id === formData.clientId);
                if (client && client.email) {
                  window.open(`mailto:${client.email}?subject=Confirmación de Turno - Taller CLP&body=Hola ${client.name},%0D%0A%0D%0ATe confirmamos tu turno para el día ${formData.date} a las ${formData.time}.%0D%0A%0D%0AMotivo: ${formData.reason}%0D%0ACotización Estimada: $${formData.estimatedCost}%0D%0A%0D%0A¡Te esperamos!`);
                } else {
                  alert('El cliente seleccionado no tiene un email registrado o no has seleccionado a nadie.');
                }
              }}>
                <Mail size={18} />
              </button>
              <button type="button" className="btn btn-secondary" title="Enviar por WhatsApp" style={{ color: '#25D366', borderColor: 'rgba(37, 211, 102, 0.3)' }} onClick={() => {
                const client = clients.find(c => c.id === formData.clientId);
                const vehicle = vehicles.find(v => v.id === formData.vehicleId);
                if (client && client.phone && vehicle) {
                  // Limpia el numero de telefono para la url de WA
                  const phoneFormateado = client.phone.replace(/\D/g, ''); 
                  const msj = `Hola ${client.name}! \nTe confirmamos tu turno en *CLP Taller* para tu ${vehicle.brand} (${vehicle.plate}). \n\n*Fecha:* ${formData.date} a las ${formData.time} hs. \n*Motivo:* ${formData.reason} \n*Cotización:* $${formData.estimatedCost} \n\n¡Te esperamos!`;
                  window.open(`https://wa.me/${phoneFormateado}?text=${encodeURIComponent(msj)}`, '_blank');
                } else {
                  alert("Asegúrate de haber seleccionado un cliente (con teléfono) y un vehículo.");
                }
              }}>
                <MessageCircle size={18} />
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Agendar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
