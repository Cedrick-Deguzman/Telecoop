export interface BaseBillingRecord {
  id: number;
  clientId: number;
  clientName: string;
  email: string;
  plan: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  billingDate: string; // ISO string
}

export interface BillingRecord extends BaseBillingRecord {
  dueDate: string;      
  paidDate: string;    
  paymentMethod?: 'cash' | 'gcash' | 'bank';
  month?: string;
  status: 'paid' | 'pending' | 'overdue';
}

export interface PaymentRecord {
  id: number;
  invoiceId: number;
  clientId: number;
  clientName: string;
  amount: number;
  date: string;          // ISO string
  method: 'cash' | 'gcash' | 'bank';
  status: 'paid' | 'pending' | 'overdue';
  plan: string;
  billingDate: string;
}

export type MarkPaidPayload = {
  id: number;
  paymentMethod: 'cash' | 'gcash' | 'bank';
  referenceNumber?: string;
};

export type RefWarningPayload = {
  invoiceId: number;
  paymentMethod: 'gcash' | 'bank';
  referenceNumber: string;
};


