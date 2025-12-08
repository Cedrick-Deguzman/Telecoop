import { useState, useEffect } from 'react';
import { Search, Calendar, CheckCircle, AlertCircle, Clock, Download } from 'lucide-react';
import { InvoiceModal } from './InvoiceModal';
import { BillingRecord } from '@/types/Billings';

export function Billing() {
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BillingRecord['status']>('all');
  const [selectedRecord, setSelectedRecord] = useState<BillingRecord | null>(null);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const filteredRecords = billingRecords.filter(record => {
    const matchesSearch = record.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paidCount = billingRecords.filter(r => r.status === 'paid').length;
  const pendingCount = billingRecords.filter(r => r.status === 'pending').length;
  const overdueCount = billingRecords.filter(r => r.status === 'overdue').length;
  const collectedAmount = billingRecords.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0);
  const pendingAmount = billingRecords.filter(r => r.status === 'pending' || r.status === 'overdue').reduce((sum, r) => sum + r.amount, 0);
  const [paymentMethod, setPaymentMethod] = useState("");

  const getStatusColor = (status: BillingRecord['status']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
    }
  };

  const getStatusIcon = (status: BillingRecord['status']) => {
    switch (status) {
      case 'paid': return <CheckCircle className="text-green-600" size={20} />;
      case 'pending': return <Clock className="text-yellow-600" size={20} />;
      case 'overdue': return <AlertCircle className="text-red-600" size={20} />;
    }
  };

  const handleMarkAsPaid = (record: BillingRecord) => {
    setSelectedRecord(record);
    setShowMarkPaidModal(true);
  };

  const handleViewInvoice = (record: BillingRecord) => {
    setSelectedRecord(record);
    setShowInvoiceModal(true);
  };

  const confirmMarkAsPaid = async (paymentMethod: string, referenceNumber: string | null,) => {
    if (!selectedRecord) return;

    try {
      await fetch("/api/billing/mark-as-paid", {
        method: "POST",
        body: JSON.stringify({
          id: selectedRecord.id,
          paymentMethod,
          referenceNumber,
        }),
      });

      // reload billing records
      const res = await fetch("/api/billing");
      const data = await res.json();
      setBillingRecords(data);

      setShowMarkPaidModal(false);
      setSelectedRecord(null);
    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    const loadBilling = async () => {
      try {
        const res = await fetch("/api/billing");
        const data = await res.json();
        setBillingRecords(data);
      } catch (err) {
        console.error("Failed to load billing:", err);
      }
    };
    loadBilling();
  }, []);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <p className="text-yellow-800 text-sm">
        Note: This table only shows invoices for the current month. Payments collected for overdue invoices from previous months will not appear in Paid stats, but are included in the Total Revenue.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-500">Total Bills</p>
          <p className="text-3xl mt-2">{billingRecords.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-500">Paid</p>
          <p className="text-3xl mt-2 text-green-600">{paidCount}</p>
          <p className="text-sm text-gray-500 mt-1">₱{collectedAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-500">Pending</p>
          <p className="text-3xl mt-2 text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-500">Overdue</p>
          <p className="text-3xl mt-2 text-red-600">{overdueCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-500">Pending Amount</p>
          <p className="text-2xl mt-2">₱{pendingAmount.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by client name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Billing Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-gray-500">Client</th>
                <th className="px-6 py-3 text-left text-gray-500">Plan</th>
                <th className="px-6 py-3 text-left text-gray-500">Amount</th>
                <th className="px-6 py-3 text-left text-gray-500">Billing Date</th>
                <th className="px-6 py-3 text-left text-gray-500">Due Date</th>
                <th className="px-6 py-3 text-left text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-gray-500">Payment Info</th>
                <th className="px-6 py-3 text-left text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p>{record.clientName}</p>
                      <p className="text-sm text-gray-500">{record.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {record.plan}
                  </td>
                  <td className="px-6 py-4">
                    ₱{record.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {record.billingDate}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className={`text-sm ${record.status === 'overdue' ? 'text-red-600' : 'text-gray-600'}`}>
                        {record.dueDate}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(record.status)}
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {record.status === 'paid' ? (
                      <div>
                        <p className="text-green-600">Paid on {record.paidDate}</p>
                        <p className="text-gray-500">{record.paymentMethod}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">Not paid yet</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {record.status !== 'paid' ? (
                      <button
                        onClick={() => handleMarkAsPaid(record)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        Mark as Paid
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleViewInvoice(record)}
                        className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm">
                        View Invoice
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark as Paid Modal */}
      {showMarkPaidModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl mb-4">Mark Payment as Received</h2>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Client</p>
              <p className="mb-2">{selectedRecord.clientName}</p>
              <p className="text-sm text-gray-600">Amount</p>
              <p className="text-2xl text-green-600">₱{selectedRecord.amount.toFixed(2)}</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const paymentMethod = formData.get('paymentMethod') as string;
                const referenceNumber = formData.get('referenceNumber') as string | null;
                confirmMarkAsPaid(paymentMethod, referenceNumber);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm mb-2 text-gray-700">Payment Method</label>
                <select
                  name="paymentMethod"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="">Select method...</option>
                  <option value="cash">Cash</option>
                  <option value="gcash">Gcash</option>
                  <option value="bank">Bank Transfer</option>
                </select>
                {(paymentMethod === "gcash" || paymentMethod === "bank") && (
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      name="referenceNumber"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter Gcash/Bank Reference No."
                      required
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowMarkPaidModal(false);
                    setSelectedRecord(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
