import { useState, useEffect } from 'react';
import { Search, Calendar, CheckCircle, AlertCircle, Clock, Download } from 'lucide-react';
interface BillingRecord {
  id: number;
  clientId: number;
  clientName: string;
  email: string;
  plan: string;
  amount: number;
  billingDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
  paymentMethod?: string;
}

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

  const confirmMarkAsPaid = async (paymentMethod: string) => {
    if (!selectedRecord) return;

    try {
      await fetch("/api/billing/mark-as-paid", {
        method: "POST",
        body: JSON.stringify({
          id: selectedRecord.id,
          paymentMethod,
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
                confirmMarkAsPaid(paymentMethod);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm mb-2 text-gray-700">Payment Method</label>
                <select
                  name="paymentMethod"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Select method...</option>
                  <option value="cash">Cash</option>
                  <option value="gcash">Gcash</option>
                  <option value="bank">Bank Transfer</option>
                </select>
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
        <div id="invoice-pdf" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl mb-2">INVOICE</h2>
                <p className="text-gray-600">Invoice #INV-{selectedRecord.id.toString().padStart(6, '0')}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl text-indigo-900">Telecoop</p>
                <p className="text-sm text-gray-600">Internet Service Provider</p>
                <p className="text-sm text-gray-600">Rm.3 2Flr Klir-Con Bldg., Rocka Complex, Rocka Ave., Tabang, Plaridel, Bulacan</p>
                <p className="text-sm text-gray-600">Plaridel, Philippines, 3004</p>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b">
              <div>
                <p className="text-sm text-gray-600 mb-1">Bill To:</p>
                <p className="mb-1">{selectedRecord.clientName}</p>
                <p className="text-sm text-gray-600">{selectedRecord.email}</p>
                <p className="text-sm text-gray-600">Client ID: {selectedRecord.clientId}</p>
              </div>
              <div className="text-right">
                <div className="mb-2">
                  <p className="text-sm text-gray-600">Issue Date</p>
                  <p>{selectedRecord.billingDate}</p>
                </div>
                <div className="mb-2">
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p>{selectedRecord.dueDate}</p>
                </div>
                {selectedRecord.paidDate && (
                  <div>
                    <p className="text-sm text-gray-600">Paid Date</p>
                    <p className="text-green-600">{selectedRecord.paidDate}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Items */}
            <table className="w-full mb-8">
              <thead className="border-b-2 border-gray-300">
                <tr>
                  <th className="text-left py-3 text-gray-600">Description</th>
                  <th className="text-right py-3 text-gray-600">Quantity</th>
                  <th className="text-right py-3 text-gray-600">Rate</th>
                  <th className="text-right py-3 text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-4">
                    <p>{selectedRecord.plan}</p>
                    <p className="text-sm text-gray-600">Monthly Internet Service</p>
                  </td>
                  <td className="text-right py-4">1</td>
                  <td className="text-right py-4">₱{selectedRecord.amount.toFixed(2)}</td>
                  <td className="text-right py-4">₱{selectedRecord.amount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Invoice Totals */}
            <div className="mb-8">
              <div className="w-64 ml-auto">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>₱{selectedRecord.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Tax (0%):</span>
                  <span>₱0.00</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-gray-300">
                  <span>Total:</span>
                  <span className="text-2xl">₱{selectedRecord.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            {selectedRecord.status === 'paid' && selectedRecord.paidDate && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-green-800">Payment Received</span>
                </div>
                <p className="text-sm text-green-700">
                  Paid on {selectedRecord.paidDate} via {selectedRecord.paymentMethod}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 mb-6">
              <p>Thank you for your business!</p>
              <p>For questions about this invoice, please contact +63 939-143-0094</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  setSelectedRecord(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  const invoice = document.getElementById("invoice-pdf");
                  if (!invoice) return;

                  const htmlContent = invoice.outerHTML;

                  const response = await fetch("/api/billing/invoice-pdf", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ invoiceHtml: htmlContent, fileName: `Invoice-${selectedRecord.id}` }),
                  });

                  if (!response.ok) return alert("Failed to generate PDF");

                  const blob = await response.blob();
                  const url = URL.createObjectURL(blob);

                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `Invoice-${selectedRecord.id}.pdf`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
