export interface Port {
  id: number;
  portNumber: number;
  status: 'available' | 'occupied' | 'faulty' | 'internal_use' | 'test_line';
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
  internalUsePorts: number;
  testLinePorts: number;
  ports: Port[];
  installDate: string;
  status: 'active' | 'maintenance' | 'offline';
}
