// app/dashboard/clients/types.ts

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  planId: number;
  plan: PlanDetail;
  napboxPort?: NapboxPort | null;
  status: "active" | "inactive";
  installationDate: string;
  monthlyFee: number;
  payments: Payment[];
}

export interface PlanDetail {
  name: string;
  icon: string;
  color: string;
}

export interface Plan {
  id: number;
  name: string;
}

export interface NapboxPort {
  napboxId: number;
  portNumber: number;
  status: "available" | "occupied" | "faulty";
  clientId?: number | null;
}

export interface Napbox {
  id: number;
  name: string;
  ports: NapboxPort[];
}

export interface Payment {
  paymentDate: string;
  amount: number;
}

export type ClientStatus = Client["status"];
