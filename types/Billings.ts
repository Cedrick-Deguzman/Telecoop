export interface BaseBillingRecord {
  id: number;
  clientId: number;
  clientName: string;
  email: string;
  plan: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  billingDate: string;
}

export interface BillingRecord extends BaseBillingRecord {
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
}

export interface PaymentRecord extends BaseBillingRecord {
  invoiceId: string;
  date: string;
  method: string;
}
