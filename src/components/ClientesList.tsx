import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, CarFront, Edit } from 'lucide-react';
import type { Client, Vehicle } from '../types';
import { AltaVehiculoModal } from './AltaVehiculoModal';
import { ClienteModal } from './ClienteModal';
import api from '../api';

export function ClientesList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientesRes, vehiculosRes] = await Promise.all([
        api.get('/clientes'),
        api.get('/vehiculos')
      ]);
      setClients(clientesRes.data);
      setVehicles(vehiculosRes.data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const getVehiclesCount = (clientId: string) => {
    return vehicles.filter(v => v.ownerId === clientId).length;
  };

  const handleOpenAutoModal = (client?: Client) => {
    setSelectedClient(client);
    setIsAutoModalOpen(true);
  };

  const handleOpenClienteModal = (client?: Client) => {
    setSelectedClient(client);
    setIsClienteModalOpen(true);
  };

  const handleGuardarCliente = async (clienteData: Partial<Client>) => {
    try {
      if (selectedClient) {
        // Editar
        const res = await api.put(`/clientes/${selectedClient.id}`, clienteData);
        setClients(clients.map(c => c.id === selectedClient.id ? { ...c, ...res.data } : c));
      } else {
        // Nuevo
        const nuevoCliente = {
          id: `c${Date.now()}`,
          name: clienteData.name || '',
          phone: clienteData.phone || '',
          email: clienteData.email || ''
        };
        const res = await api.post('/clientes', nuevoCliente);
        setClients([...clients, res.data]);
      }
    } catch (error) {
      console.error('Error guardando cliente', error);
      alert('Hubo un error al guardar el cliente');
    }
  };

  if (loading) {
    return <div className="glass-panel" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando directorio...</div>;
  }

  return (
    <div className="glass-panel" style={{ minHeight: '80vh' }}>
      <div className="mobile-col" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <div>
          <h2>Directorio de Clientes</h2>
          <p>Gestiona los clientes y sus vehículos asociados.</p>
        </div>
        <button className="btn btn-primary" style={{ flexShrink: 0 }} onClick={() => handleOpenClienteModal()}>
          <Plus size={18} />
          Nuevo Cliente
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
        <input 
          type="text" 
          placeholder="Buscar por nombre o teléfono..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 2.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'white',
            outline: 'none',
            fontSize: '0.9rem'
          }}
        />
      </div>

      <div className="table-container" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Nombre</th>
              <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Teléfono</th>
              <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Email</th>
              <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Vehículos</th>
              <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 500, textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map(client => (
              <tr key={client.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{client.name}</td>
                <td style={{ padding: '1rem' }}>{client.phone}</td>
                <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>{client.email}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 }}>
                    <CarFront size={14} />
                    {getVehiclesCount(client.id)}
                  </div>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', marginRight: '0.5rem', background: 'transparent' }} onClick={() => handleOpenClienteModal(client)} title="Editar Cliente">
                    <Edit size={16} />
                  </button>
                  <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginRight: '0.5rem' }} onClick={() => handleOpenAutoModal(client)}>
                    + Auto
                  </button>
                  <Link to={`/cliente/${client.id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', textDecoration: 'none' }}>
                    Ver Perfil
                  </Link>
                </td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No se encontraron clientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <AltaVehiculoModal 
        isOpen={isAutoModalOpen} 
        onClose={() => setIsAutoModalOpen(false)} 
        client={selectedClient} 
        onSuccess={fetchData}
      />
      <ClienteModal
        isOpen={isClienteModalOpen}
        onClose={() => setIsClienteModalOpen(false)}
        clienteAEditar={selectedClient}
        onGuardar={handleGuardarCliente}
      />
    </div>
  );
}
