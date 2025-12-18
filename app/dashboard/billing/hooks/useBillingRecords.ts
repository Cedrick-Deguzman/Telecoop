import { useState, useEffect, useCallback } from 'react';
import { BillingRecord } from '../types';

export function useBillingRecords() {
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all billing records
  const loadBillingRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/billing');
      if (!res.ok) throw new Error('Failed to fetch billing records');
      const data: BillingRecord[] = await res.json();
      setBillingRecords(data);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter records by search term and status
  const filterRecords = useCallback(
    (searchTerm: string, statusFilter: 'all' | BillingRecord['status']) => {
      return billingRecords.filter((record) => {
        const matchesSearch =
          record.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
    },
    [billingRecords]
  );

  useEffect(() => {
    loadBillingRecords();
  }, [loadBillingRecords]);

  return {
    billingRecords,
    loading,
    error,
    loadBillingRecords,
    filterRecords,
  };
}
