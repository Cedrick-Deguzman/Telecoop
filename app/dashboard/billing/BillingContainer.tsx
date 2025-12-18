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
      return matchesSearch && matchesStatus;
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
        />

        {/* Billing Table */}
        <BillingTable
          records={filteredRecords}
          onMarkAsPaid={handleMarkAsPaid}
          onViewInvoice={handleViewInvoice}
        />

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
