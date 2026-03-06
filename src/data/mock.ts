import type { Client, Vehicle, WorkBay, Appointment } from '../types';

export const mockClients: Client[] = [
  { id: 'c1', name: 'Juan Pérez', phone: '+54 11 1234-5678', email: 'juan@example.com', createdAt: new Date('2023-01-15') },
  { id: 'c2', name: 'María Gómez', phone: '+54 11 9876-5432', email: 'maria@example.com', createdAt: new Date('2023-05-20') },
];

export const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    plate: 'AB 123 CD',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2019,
    currentMileage: 45000,
    ownerId: 'c1',
    serviceHistory: [
      { id: 's1', date: new Date('2023-10-01'), description: 'Cambio de aceite y filtros', mileage: 40000, cost: 15000 }
    ]
  },
  {
    id: 'v2',
    plate: 'PQ 456 RS',
    brand: 'Volkswagen',
    model: 'Gol Trend',
    year: 2015,
    currentMileage: 85000,
    ownerId: 'c2',
    serviceHistory: []
  }
];

export const mockWorkBays: WorkBay[] = [
  { id: 'b1', name: 'Elevador Principal', isOccupied: true, currentVehicleId: 'v1' },
  { id: 'b2', name: 'Bahía Diagnóstico', isOccupied: false },
  { id: 'b3', name: 'Alineación', isOccupied: false },
];

export const mockAppointments: Appointment[] = [
  { id: 'a1', date: new Date(new Date().setHours(10, 0, 0, 0)), clientId: 'c2', vehicleId: 'v2', reason: 'Revisión frenos', status: 'PENDING' }
];
