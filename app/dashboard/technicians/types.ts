export type TechnicianStatus = 'active' | 'inactive' | 'on_leave';

export interface Technician {
  id: number;
  name: string;
  contactNumber: string | null;
  area: string | null;
  status: TechnicianStatus;
  createdAt: string;
  updatedAt: string;
  _count?: { installations: number };
}
