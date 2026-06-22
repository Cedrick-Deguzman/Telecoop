export type InstallationStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'rescheduled';

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
  createdAt: string;
  updatedAt: string;
}

export interface TechnicianOption {
  id: number;
  name: string;
  status: string;
}
