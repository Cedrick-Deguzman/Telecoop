'use client';

import { useState } from 'react';
import { PaymentRecord, BillingRecord } from '../billing/types';
import { usePayments } from './hooks/usePayments';
import { PaymentsStats } from './components/PaymentsStats';
import { PaymentsSearch } from './components/PaymentsSearch';
import { PaymentsTable } from './components/PaymentsTable';
import { InvoiceModal } from '../billing/components/InvoiceModal';
import { usePagination } from '../billing/hooks/usePagination';

export function PaymentsContainer() {
  const { payments, loading, error, viewInvoice } = usePayments();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<BillingRecord | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const rowsPerPage = 10;

  const filteredPayments = payments.filter(payment =>
    payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.invoiceId.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { currentPage, setCurrentPage, paginatedItems: paginatedPayments, totalPages } =
    usePagination(filteredPayments, rowsPerPage, [searchTerm]);

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
      />
      <PaymentsTable
        payments={paginatedPayments}
        onViewInvoice={handleViewInvoice}
      />
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span>Page {currentPage} of {totalPages}</span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => prev + 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
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
