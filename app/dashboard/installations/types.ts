export type InstallationStatus = 'pending' | 'assigned' | 'ongoing' | 'completed' | 'cancelled';

export const PHOTO_CATEGORIES = [
  'House Exterior',
  'Pole Route',
  'NAP Box',
  'Port Used',
  'ONU Serial',
  'Router Installed',
  'Speed Test',
  'Final Cable Routing',
] as const;

export type PhotoCategory = typeof PHOTO_CATEGORIES[number];

export interface InstallationPhoto {
  id: number;
  installationId: number;
  url: string;
  publicId: string;
  category: string;
  caption: string | null;
  createdAt: string;
}

export interface InstallationMaterialUsage {
  id: number;
  inventoryItemId: number;
  inventoryItem: {
    id: number;
    name: string;
    unit: string;
    category: { name: string };
  };
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Installation {
  id: number;
  prospectName: string | null;
  prospectPhone: string | null;
  prospectAddress: string | null;
  clientId: number | null;
  client: { id: number; name: string } | null;
  convertedAt: string | null;
  technicianId: number | null;
  technician: { id: number; name: string } | null;
  scheduledDate: string | null;
  completedDate: string | null;
  status: InstallationStatus;
  notes: string | null;

  // Fiber information
  napboxId: number | null;
  napbox: { id: number; name: string } | null;
  portNumber: number | null;
  fiberCore: string | null;
  dropCableLength: number | null;

  // Device information
  onuSerial: string | null;
  routerSerial: string | null;
  macAddress: string | null;

  // Signal readings
  rxReading: number | null;
  txReading: number | null;

  // GPS location
  latitude: number | null;
  longitude: number | null;

  // Material usage
  materials: InstallationMaterial | null;
  materialUsages: InstallationMaterialUsage[];

  // Photos
  photos: InstallationPhoto[];

  createdAt: string;
  updatedAt: string;
}

export interface InstallationMaterial {
  id: number;
  dropCable: number | null;
  scConnector: number | null;
  cableTies: number | null;
  clamps: number | null;
  patchCord: number | null;
  submittedAt: string | null;
}

export interface TechnicianOption {
  id: number;
  name: string;
  status: string;
}

export interface NapboxOption {
  id: number;
  name: string;
  ports: { portNumber: number; status: string }[];
}
