import { useEffect, useState } from 'react';
import { PaymentRecord, BillingRecord } from '../../billing/types';

export function usePayments() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await fetch('/api/billing/payment-history');
        if (!res.ok) throw new Error('Failed to fetch payments');
        const data: PaymentRecord[] = await res.json(); // make sure API returns PaymentRecord format
        setPayments(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, []);

  const viewInvoice = async (invoiceId: number): Promise<BillingRecord> => {
    const res = await fetch(`/api/billing/invoices/${invoiceId}`);
    if (!res.ok) throw new Error('Invoice not found');
    const invoice: BillingRecord = await res.json(); // API must return BillingRecord with dueDate, etc.
    return invoice;
  };

  return { payments, loading, error, viewInvoice };
}
