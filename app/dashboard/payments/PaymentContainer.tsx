'use client';

import { useState } from 'react';
import { PaymentRecord, BillingRecord } from '../billing/types';
import { usePayments } from './hooks/usePayments';
import { PaymentsStats } from './components/PaymentsStats';
import { PaymentsSearch } from './components/PaymentsSearch';
import { PaymentsTable } from './components/PaymentsTable';
import { InvoiceModal } from '../billing/components/InvoiceModal';

export function PaymentsContainer() {
  const { payments, loading, error, viewInvoice } = usePayments();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentRecord['status']>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<BillingRecord | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const handleViewInvoice = async (payment: PaymentRecord) => {
    try {
      const invoice = await viewInvoice(payment.invoiceId);
      setSelectedInvoice(invoice);
      setShowInvoiceModal(true);
    } catch (err) {
      alert('Failed to load invoice');
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Loading payments...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <PaymentsStats payments={payments} />
      <PaymentsSearch
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      <PaymentsTable
        payments={payments}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onViewInvoice={handleViewInvoice}
      />
      {showInvoiceModal && selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          isOpen={showInvoiceModal}
          onClose={() => {
            setSelectedInvoice(null);
            setShowInvoiceModal(false);
          }}
        />
      )}
    </div>
  );
}
