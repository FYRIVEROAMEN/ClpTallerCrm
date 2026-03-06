export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: Date;
}

export interface ServiceRecord {
  id: string;
  date: Date;
  description: string;
  mileage: number;
  cost: number;
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  currentMileage: number;
  ownerId: string; // Referencia al Client actual
  serviceHistory: ServiceRecord[];
}

export interface WorkBay {
  id: string;
  name: string;      // ej. "Bahía 1", "Elevador A"
  isOccupied: boolean;
  currentVehicleId?: string; // Vehículo asignado actualmente
}

export interface Appointment {
  id: string;
  date: Date;
  clientId: string;
  vehicleId: string;
  reason: string;
  estimatedCost?: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}
