import { BillingRecord } from '../types';
import { CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react';

interface BillingRowProps {
  record: BillingRecord;
  onMarkAsPaid: (record: BillingRecord) => void;
  onViewInvoice: (record: BillingRecord) => void;
}

export function BillingRow({ record, onMarkAsPaid, onViewInvoice }: BillingRowProps) {
  console.log('BillingRow render:', record);
  const getStatusColor = (status: BillingRecord['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusIcon = (status: BillingRecord['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-600" size={20} />;
      case 'overdue':
        return <AlertCircle className="text-red-600" size={20} />;
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      {/* Client */}
      <td className="px-6 py-4">
        <div>
          <p>{record.clientName}</p>
          <p className="text-sm text-gray-500">{record.email}</p>
        </div>
      </td>

      {/* Plan */}
      <td className="px-6 py-4 text-sm">{record.plan}</td>

      {/* Amount */}
      <td className="px-6 py-4">₱{record.amount.toFixed(2)}</td>

      {/* Billing Date */}
      <td className="px-6 py-4 text-sm text-gray-600">{record.billingDate} - {record.dueDate}</td>

      {/* Due Date */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <span className={`text-sm ${record.status === 'overdue' ? 'text-red-600' : 'text-gray-600'}`}>
            {record.dueDate}
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {getStatusIcon(record.status)}
          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(record.status)}`}>
            {record.status}
          </span>
        </div>
      </td>

      {/* Payment Info */}
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

      {/* Actions */}
      <td className="px-6 py-4">
        {record.status !== 'paid' ? (
          <button
            onClick={() => onMarkAsPaid(record)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            Mark as Paid
          </button>
        ) : (
          <button
            onClick={() => onViewInvoice(record)}
            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
          >
            View Invoice
          </button>
        )}
      </td>
    </tr>
  );
}
