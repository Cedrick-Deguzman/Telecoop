'use client';

import { useEffect, useState } from 'react';
import { Search, Download, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { InvoiceModal } from './InvoiceModal';
import { PaymentRecord } from '@/types/Billings';
import { BillingRecord } from '@/types/Billings';

export function Payments() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentRecord['status']>('all');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BillingRecord  | null>(null);

  const handleViewInvoice = async (payment: PaymentRecord) => {
    try {
      const res = await fetch(
        `/api/billing/invoices/${payment.invoiceId}`
      );

      if (!res.ok) {
        alert("Invoice not found");
        return;
      }

      const invoice: BillingRecord = await res.json();
      setSelectedRecord(invoice);
      setShowInvoiceModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to load invoice");
    }
  };


  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await fetch('/api/billing/payment-history');
        const data = await res.json();
        setPayments(data);
      } catch (error) {
        console.error('Failed to load payment history:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  // const pendingRevenue = payments
  //   .filter(p => p.status === 'pending')
  //   .reduce((sum, p) => sum + p.amount, 0);

  // const failedPayments = payments.filter(p => p.status === 'failed').length;

  const getStatusIcon = (status: PaymentRecord['status']) => {
    switch (status) {
      case 'paid': return <CheckCircle className="text-green-600" size={20} />;
      // case 'pending': return <Clock className="text-yellow-600" size={20} />;
      // case 'failed': return <XCircle className="text-red-600" size={20} />;
    }
  };

  const getStatusColor = (status: PaymentRecord['status']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      // case 'pending': return 'bg-yellow-100 text-yellow-800';
      // case 'failed': return 'bg-red-100 text-red-800';
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading payment history...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Revenue Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-500">Total Revenue (Paid)</p>
          <p className="text-3xl mt-2 text-green-600">₱{totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-2">{payments.filter(p => p.status === 'paid').length} payments</p>
        </div>
        {/* <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-500">Pending Revenue</p>
          <p className="text-3xl mt-2 text-yellow-600">₱{pendingRevenue.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-2">{payments.filter(p => p.status === 'pending').length} payments</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-500">Failed Payments</p>
          <p className="text-3xl mt-2 text-red-600">{failedPayments}</p>
          <p className="text-sm text-gray-500 mt-2">Require attention</p>
        </div> */}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by client or invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          {/* <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div> */}

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-gray-500">Invoice ID</th>
                <th className="px-6 py-3 text-left text-gray-500">Client</th>
                <th className="px-6 py-3 text-left text-gray-500">Plan</th>
                <th className="px-6 py-3 text-left text-gray-500">Amount</th>
                <th className="px-6 py-3 text-left text-gray-500">Method</th>
                <th className="px-6 py-3 text-left text-gray-500">Billing Date</th>
                <th className="px-6 py-3 text-left text-gray-500">Payment Date</th>
                <th className="px-6 py-3 text-left text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-gray-500">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{payment.invoiceId}</td>
                  <td className="px-6 py-4">{payment.clientName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payment.plan}</td>
                  <td className="px-6 py-4">₱{payment.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payment.method}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payment.billingDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payment.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(payment.status)}
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                        onClick={() => handleViewInvoice(payment)}
                        className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm">
                        View Invoice
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
      {/* Invoice Modal */}
            {showInvoiceModal && selectedRecord && (
              <InvoiceModal
                record={selectedRecord}
                onClose={() => {
                  setShowInvoiceModal(false);
                  setSelectedRecord(null);
                }}
              />
            )}
    </div>
  );
}
