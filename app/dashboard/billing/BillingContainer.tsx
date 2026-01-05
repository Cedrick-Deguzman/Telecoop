  'use client';

  import { useState, useEffect } from 'react';
  import { BillingRecord } from './types';
  import { BillingStats } from './components/BillingStats';
  import { BillingSearch } from './components/BillingSearch';
  import { BillingTable } from './components/BillingTable';
  import { MarkPaidModal } from './components/MarkPaidModal';
  import { InvoiceModal } from './components/InvoiceModal';
  import { ReferenceWarningModal } from './components/ReferenceWarningModal';
  import { useMarkPaid } from './hooks/useMarkPaid';
  import { usePagination } from './hooks/usePagination';

  export function BillingContainer() {
    const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | BillingRecord['status']>('all');
    const [selectedRecord, setSelectedRecord] = useState<BillingRecord | null>(null);
    const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const {
    confirmMarkAsPaid,
      loading,
      refWarningInvoices,
      pendingPayment,
      setRefWarningInvoices,
      setPendingPayment
    } = useMarkPaid();
    const [dueFilter, setDueFilter] = useState<'all' | 15 | 30>('all');
    const [monthFilter, setMonthFilter] = useState<'all' | number>('all'); 

    // Load billing records from API
    const loadBillingRecords = async () => {
      try {
        const res = await fetch('/api/billing');
        const data = await res.json();
        setBillingRecords(data);
      } catch (err) {
        console.error('Failed to load billing records:', err);
      }
    };

    useEffect(() => {
      loadBillingRecords();
    }, []);

    // Filter records by search term and status
    const filteredRecords = billingRecords.filter((record) => {
      const matchesSearch =
        record.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      let matchesDue = true;
      if (dueFilter !== 'all') {
        const dueDate = new Date(record.dueDate);
        const dueDay = dueDate.getDate();

        if (dueFilter === 15) {
          matchesDue = dueDay <= 15; // first half
        } else if (dueFilter === 30) {
          // end of month: day > 15
          const lastDayOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
          matchesDue = dueDay > 15 && dueDay <= lastDayOfMonth;
        }
      }
      let matchesMonth = true;
      if (monthFilter !== 'all') {
        const recordMonth = new Date(record.dueDate).getMonth(); // 0 = Jan
        matchesMonth = recordMonth === monthFilter;
      }
      return matchesSearch && matchesStatus && matchesDue && matchesMonth;
    });

    // Handlers for modals
    const handleMarkAsPaid = (record: BillingRecord) => {
      setSelectedRecord(record);
      setShowMarkPaidModal(true);
    };

    const handleViewInvoice = (record: BillingRecord) => {
      setSelectedRecord(record);
      setShowInvoiceModal(true);
    };
 
    // Pagination logic
    const {
      currentPage,
      setCurrentPage,
      paginatedItems,
      totalPages
    } = usePagination(filteredRecords, 10, [searchTerm, statusFilter, dueFilter, monthFilter]);

    return (
      <div className="space-y-6">
        {/* Summary Stats */}
        <BillingStats records={billingRecords} />

        {/* Search & Filters */}
        <BillingSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dueFilter={dueFilter}
          setDueFilter={setDueFilter}
          monthFilter={monthFilter}
          setMonthFilter={setMonthFilter}
        />

        {/* Billing Table */}
        <BillingTable
          records={paginatedItems}
          onMarkAsPaid={handleMarkAsPaid}
          onViewInvoice={handleViewInvoice}
        />
         {/* Pagination Controls */}
        <div className="flex justify-between mt-4">
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

        {/* Mark as Paid Modal */}
        {showMarkPaidModal && selectedRecord && !refWarningInvoices &&(
          <MarkPaidModal
            invoice={selectedRecord}
            isOpen={showMarkPaidModal}
            onClose={() => setShowMarkPaidModal(false)}
            onSuccess={() => {
              setSelectedRecord(null);
              loadBillingRecords();
            }}
            confirmMarkAsPaid={confirmMarkAsPaid}
          />
        )}
        {/* Invoice Modal */}
        {showInvoiceModal && selectedRecord && (
          <InvoiceModal
            invoice={selectedRecord}
            isOpen={showInvoiceModal}
            onClose={() => setShowInvoiceModal(false)}
          />
        )}

        {/* Reference Warning Modal */}
        {refWarningInvoices && pendingPayment && (pendingPayment.paymentMethod === 'gcash' || pendingPayment.paymentMethod === 'bank') && (
          <ReferenceWarningModal
            invoices={refWarningInvoices}
            pendingPayment={pendingPayment as { paymentMethod: 'gcash' | 'bank'; referenceNumber: string }}
            onCancel={() => {
              setRefWarningInvoices(null);
              setPendingPayment(null);
            }}
            onProceed={async () => {
            if (!pendingPayment) return;
            
            // Use the same confirmMarkAsPaid from your hook
            const success = await confirmMarkAsPaid({
              id: selectedRecord!.id,
              paymentMethod: pendingPayment.paymentMethod,
              referenceNumber: pendingPayment.referenceNumber,
              force: true,
            });

            if (success) {
              setRefWarningInvoices(null);
              setPendingPayment(null);
              loadBillingRecords(); // refresh table
              setShowMarkPaidModal(false);
            }
          }}
          />
        )}
      </div>
      
    );
  }
