import { CheckCircle } from 'lucide-react';
import { PaymentRecord } from '../../billing/types';

interface PaymentsRowProps {
  payment: PaymentRecord;
  onViewInvoice: (payment: PaymentRecord) => void;
}

export function PaymentsRow({ payment, onViewInvoice }: PaymentsRowProps) {
  const getStatusIcon = (status: PaymentRecord['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="text-green-600" size={20} />;
      // case 'pending':
      //   return <Clock className="text-yellow-600" size={20} />;
      // case 'failed':
      //   return <XCircle className="text-red-600" size={20} />;
    }
  };

  const getStatusColor = (status: PaymentRecord['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      // case 'pending':
      //   return 'bg-yellow-100 text-yellow-800';
      // case 'failed':
      //   return 'bg-red-100 text-red-800';
    }
  };

  return (
    <tr className="hover:bg-gray-50">
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
          onClick={() => onViewInvoice(payment)}
          className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
        >
          View Invoice
        </button>
      </td>
    </tr>
  );
}
