import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Bell, AlertCircle, Search } from 'lucide-react';
import type { Appointment, Client } from '../types';
import { TurnoModal } from './TurnoModal';
import api from '../api';

export function CalendarioTurnos() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [isTurnoModalOpen, setIsTurnoModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const [turnosRes, clientesRes] = await Promise.all([
        api.get('/turnos'),
        api.get('/clientes')
      ]);
      setAppointments(turnosRes.data);
      setClients(clientesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Obtener días de la semana actual
  const getDaysOfWeek = () => {
    const today = new Date();
    today.setDate(today.getDate() + (currentWeekOffset * 7));
    
    // Ajustar al lunes de esa semana
    const day = today.getDay(),
          diff = today.getDate() - day + (day === 0 ? -6: 1); // ajusta para empezar el lunes
    const monday = new Date(today.setDate(diff));

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const days = getDaysOfWeek();

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
  };

  const formatearHora = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="glass-panel" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando agenda...</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
      
      {/* Columna Principal - Calendario */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ marginBottom: '0.25rem' }}>Agenda y Turnos</h1>
            <p>Planifica las reparaciones y asigna horarios a los clientes.</p>
          </div>
          <button className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} onClick={() => setIsTurnoModalOpen(true)}>
            <CalendarIcon size={18} />
            Agendar Turno
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '0' }}>
          {/* Calendar Header Nav */}
          <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
            <h3 style={{ margin: 0 }}>
              {days[0].toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </h3>
            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              <input 
                type="date"
                title="Ir a fecha específica"
                className="form-input"
                style={{ padding: '0.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'white', marginRight: '0.5rem' }}
                onChange={(e) => {
                  if(!e.target.value) return;
                  // Seleccionamos la fecha y la forzamos a mediodia para evitar desfasaje de Timezone (Argentina -3)
                  const selectedDate = new Date(e.target.value + 'T12:00:00'); 
                  const today = new Date();
                  today.setHours(12, 0, 0, 0);
                  const diffTime = selectedDate.getTime() - today.getTime();
                  const diffWeeks = Math.round(diffTime / (1000 * 60 * 60 * 24 * 7));
                  setCurrentWeekOffset(diffWeeks);
                }}
              />
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.5rem', fontWeight: 'bold' }}
                title="Mes anterior"
                onClick={() => setCurrentWeekOffset(prev => prev - 4)}
              >
                &laquo;
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.5rem' }}
                title="Semana anterior"
                onClick={() => setCurrentWeekOffset(prev => prev - 1)}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                className="btn btn-secondary" 
                title="Ir a la semana actual"
                onClick={() => setCurrentWeekOffset(0)}
              >
                Hoy
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.5rem' }}
                title="Semana siguiente"
                onClick={() => setCurrentWeekOffset(prev => prev + 1)}
              >
                <ChevronRight size={20} />
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.5rem', fontWeight: 'bold' }}
                title="Mes siguiente"
                onClick={() => setCurrentWeekOffset(prev => prev + 4)}
              >
                &raquo;
              </button>
            </div>
          </div>

          {/* Calendar Grid Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--glass-border)' }}>
            {days.map((day, idx) => (
              <div key={idx} style={{ padding: '1rem', textAlign: 'center', borderRight: idx !== 6 ? '1px solid var(--glass-border)' : 'none' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{getDayName(day)}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '0.25rem', color: (day.getDate() === new Date().getDate() && day.getMonth() === new Date().getMonth()) ? 'var(--color-primary)' : 'inherit' }}>
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Calendar Body Demo */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: '400px' }}>
            {days.map((day, idx) => {
              // Filtrar turnos del dia actual iterado ignorando la hora
              const turnosDelDia = appointments.filter(a => {
                const appointmentDate = new Date(a.date);
                return appointmentDate.getDate() === day.getDate() && 
                       appointmentDate.getMonth() === day.getMonth() && 
                       appointmentDate.getFullYear() === day.getFullYear();
              });

              return (
                <div key={idx} style={{ borderRight: idx !== 6 ? '1px solid var(--glass-border)' : 'none', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {turnosDelDia.map(turno => {
                    const client = clients.find(c => c.id === turno.clientId);
                    return (
                      <div key={turno.id} style={{ 
                        background: 'rgba(59, 130, 246, 0.1)', 
                        borderLeft: '3px solid var(--color-primary)',
                        padding: '0.75rem', 
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                           <span>{formatearHora(new Date(turno.date))}</span>
                        </div>
                        <div style={{ color: 'var(--color-text)', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {client?.name || 'Cliente sin registrar'}
                        </div>
                        <div style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {turno.reason}
                        </div>
                        {turno.estimatedCost && turno.estimatedCost > 0 ? (
                          <div style={{ color: 'var(--color-success)', marginTop: '0.4rem', fontWeight: 'bold', fontSize: '0.85rem' }}>
                            Cotizado: ${turno.estimatedCost}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Columna Lateral - Alertas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-panel">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Bell size={20} className="text-warning" />
            Alertas Operativas
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: 'rgba(234, 179, 8, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
              <AlertCircle size={20} className="text-warning" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>Retraso en Diagnóstico</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Vehículo AB 123 CD en Bahía 1 lleva 2 horas sin actualización de estado.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <Bell size={20} className="text-success" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>Repuestos Recibidos</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Llegaron los filtros para el Corolla de Juan Pérez.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Buscar Mantenimiento</h3>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar por patente..." 
              style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'white' }}
            />
          </div>
        </div>
      </div>

      <TurnoModal
        isOpen={isTurnoModalOpen}
        onClose={() => setIsTurnoModalOpen(false)}
        onGuardar={async (datos) => {
          try {
            const newAppointment: Appointment = {
              id: `a${Date.now()}`,
              date: new Date(`${datos.date}T${datos.time}:00`),
              clientId: datos.clientId,
              vehicleId: datos.vehicleId,
              reason: datos.reason,
              estimatedCost: datos.estimatedCost,
              status: 'PENDING'
            };
            await api.post('/turnos', newAppointment);
            setAppointments([...appointments, newAppointment]);
          } catch(err: any) {
            console.error('Error al agendar', err);
            const errorDetalle = err.response?.data?.error || err.message || 'Error desconocido';
            alert('Error al guardar en el servidor: ' + errorDetalle);
          }
        }}
      />
    </div>
  );
}
