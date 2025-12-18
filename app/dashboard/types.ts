export interface RevenueData {
  month: string;
  revenue: number;
}

export interface PlanDistributionData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

export interface RecentActivityData {
  id: number;
  client: string;
  action: string;
  amount: string;
  time: string;
}

export interface DashboardStats {
  totalClients: number;
  monthlyChangeClients: number;
  revenue: number;
  monthlyChangeRevenue: number;
  activeConnections: number;
  uptime: number;
  revenueData: RevenueData[];
  newClientsData: { month: string; clients: number }[];
  planDistribution: PlanDistributionData[];
  recentActivity: RecentActivityData[];
}

export interface InvoiceView {
  id: number;
  clientId: number;
  clientName: string;
  email?: string;

  plan: string;
  amount: number;

  billingDate: string;
  dueDate: string;

  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
  paymentMethod?: 'cash' | 'gcash' | 'bank';
}
