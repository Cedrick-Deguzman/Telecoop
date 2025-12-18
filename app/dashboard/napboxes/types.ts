export interface Port {
  portNumber: number;
  status: 'available' | 'occupied' | 'faulty';
  clientId?: number;
  clientName?: string;
  clientPlan?: string;
  clientStatus?: 'active' | 'inactive';
  connectedSince?: string;
}

export interface NapBox {
  id: number;
  name: string;
  location: string;
  totalPorts: number;
  availablePorts: number;
  occupiedPorts: number;
  faultyPorts: number;
  ports: Port[];
  installDate: string;
  status: 'active' | 'maintenance' | 'offline';
}
