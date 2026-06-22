'use client';

import { useState, useEffect } from 'react';
import { BadgeCheck, Download } from 'lucide-react';
import { exportToCsv, formatExportDate } from '@/lib/exportToCsv';
import { BillingRecord } from './types';
import { BillingStats } from './components/BillingStats';
import { BillingSearch } from './components/BillingSearch';
import { BillingTable } from './components/BillingTable';
import { MarkPaidModal } from './components/MarkPaidModal';
import { InvoiceModal } from './components/InvoiceModal';
import { ReferenceWarningModal } from './components/ReferenceWarningModal';
import { useMarkPaid } from './hooks/useMarkPaid';
import { usePagination } from './hooks/usePagination';
import { BillingSkeleton } from '../components/PageSkeletons';

export function BillingContainer() {
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BillingRecord['status']>('all');
  const [selectedRecord, setSelectedRecord] = useState<BillingRecord | null>(null);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { confirmMarkAsPaid, refWarningInvoices, pendingPayment, setRefWarningInvoices, setPendingPayment } =
    useMarkPaid();
  const [dueFilter, setDueFilter] = useState<'all' | 15 | 30>('all');
  const [monthFilter, setMonthFilter] = useState<'all' | number>('all');

  const loadBillingRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing');
      const data = await res.json();
      setBillingRecords(data);
    } catch (err) {
      console.error('Failed to load billing records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBillingRecords();
  }, []);

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
        matchesDue = dueDay <= 15;
      } else if (dueFilter === 30) {
        const lastDayOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
        matchesDue = dueDay > 15 && dueDay <= lastDayOfMonth;
      }
    }

    let matchesMonth = true;
    if (monthFilter !== 'all') {
      const recordMonth = new Date(record.dueDate).getMonth();
      matchesMonth = recordMonth === monthFilter;
    }

    return matchesSearch && matchesStatus && matchesDue && matchesMonth;
  });

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: 'all' | BillingRecord['status']) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleDueFilterChange = (value: 'all' | 15 | 30) => {
    setDueFilter(value);
    setCurrentPage(1);
  };

  const handleMonthFilterChange = (value: 'all' | number) => {
    setMonthFilter(value);
    setCurrentPage(1);
  };

  const handleMarkAsPaid = (record: BillingRecord) => {
    setSelectedRecord(record);
    setShowMarkPaidModal(true);
  };

  const handleViewInvoice = (record: BillingRecord) => {
    setSelectedRecord(record);
    setShowInvoiceModal(true);
  };

  const { currentPage, setCurrentPage, paginatedItems, totalPages } = usePagination(filteredRecords, 10);

  if (loading) {
    return <BillingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <BillingStats records={billingRecords} />

      <BillingSearch
        searchTerm={searchTerm}
        setSearchTerm={handleSearchChange}
        statusFilter={statusFilter}
        setStatusFilter={handleStatusFilterChange}
        dueFilter={dueFilter}
        setDueFilter={handleDueFilterChange}
        monthFilter={monthFilter}
        setMonthFilter={handleMonthFilterChange}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-900">{paginatedItems.length}</span> of{' '}
          <span className="font-semibold text-slate-900">{filteredRecords.length}</span> filtered records
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToCsv('billing', billingRecords.map(r => ({
              'Invoice ID': r.id,
              'Client Name': r.clientName,
              'Email': r.email,
              'Plan': r.plan,
              'Amount (PHP)': r.amount,
              'Status': r.status,
              'Billing Date': formatExportDate(r.billingDate),
              'Due Date': formatExportDate(r.dueDate),
              'Paid Date': formatExportDate(r.paidDate),
              'Payment Method': r.paymentMethod ?? '',
            })))}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <Download size={15} />
            Export
          </button>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
            <BadgeCheck size={16} />
            Current month billing dataset
          </div>
        </div>
      </div>

      <BillingTable records={paginatedItems} onMarkAsPaid={handleMarkAsPaid} onViewInvoice={handleViewInvoice} />

      <div className="shell-panel flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Previous
        </button>

        <span className="text-sm text-slate-500">
          Page <span className="font-semibold text-slate-900">{currentPage}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalPages}</span>
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Next
        </button>
      </div>

      {showMarkPaidModal && selectedRecord && !refWarningInvoices && (
        <MarkPaidModal
          invoice={selectedRecord}
          isOpen={showMarkPaidModal}
          onClose={() => setShowMarkPaidModal(false)}
          onSuccess={() => {
            setSelectedRecord(null);
            void loadBillingRecords();
          }}
          confirmMarkAsPaid={confirmMarkAsPaid}
        />
      )}

      {showInvoiceModal && selectedRecord && (
        <InvoiceModal
          invoice={selectedRecord}
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}

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

            const success = await confirmMarkAsPaid({
              id: selectedRecord!.id,
              paymentMethod: pendingPayment.paymentMethod,
              referenceNumber: pendingPayment.referenceNumber,
              force: true,
            });

            if (success) {
              setRefWarningInvoices(null);
              setPendingPayment(null);
              void loadBillingRecords();
              setShowMarkPaidModal(false);
            }
          }}
        />
      )}
    </div>
  );
}
