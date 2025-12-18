import { useState } from 'react';
import { PaymentRecord } from '../types';
import { BillingRecord } from '../types';
import { MarkPaidPayload } from '../types';

export function useMarkPaid() {
  const [refWarningInvoices, setRefWarningInvoices] = useState<BillingRecord[] | null>(null);
  const [pendingPayment, setPendingPayment] = useState<MarkPaidPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null);

  // Confirm marking a record as paid
  // inside useMarkPaid.ts
  const confirmMarkAsPaid = async ({ id, paymentMethod, referenceNumber, force = false }: MarkPaidPayload & {force?: boolean}): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Check for duplicate reference numbers for GCash or Bank
      if ((paymentMethod === 'gcash' || paymentMethod === 'bank') && !force) {
        const res = await fetch(`/api/billing/check-reference?clientId=${id}&ref=${referenceNumber}`);
        if (!res.ok) throw new Error('Failed to check reference number');

        const existingInvoices: BillingRecord[] = await res.json();
        if (existingInvoices.length > 0) {
          // Trigger the warning modal
          setRefWarningInvoices(existingInvoices);
          setPendingPayment({ id, paymentMethod, referenceNumber });
          setLoading(false);// must be gcash|bank
          return false; // stop marking as paid
        }
      }

      // Proceed to mark as paid if no duplicates
      const resMark = await fetch('/api/billing/mark-as-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, paymentMethod, referenceNumber }),
      });

      if (!resMark.ok) throw new Error('Failed to mark as paid');

      return true;

    } catch (err: any) {
      setError(err.message || 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  };


  const resetWarning = () => {
    setRefWarningInvoices(null);
    setPendingPayment(null);
  };

  return {
    refWarningInvoices,
    pendingPayment,
    loading,
    error,
    confirmMarkAsPaid,
    resetWarning,
    setRefWarningInvoices,
    setPendingPayment,
  };
}
