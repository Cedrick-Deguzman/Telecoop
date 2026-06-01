import { CheckCircle } from 'lucide-react';
import { PaymentRecord } from '../../billing/types';
import { formatCurrency, formatPaymentMethod, formatShortDate } from '@/app/utils/format';

interface PaymentsRowProps {
  payment: PaymentRecord;
  onViewInvoice: (payment: PaymentRecord) => void;
}

export function PaymentsRow({ payment, onViewInvoice }: PaymentsRowProps) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">{payment.invoiceId}</td>
      <td className="px-6 py-4">{payment.clientName}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{payment.plan}</td>
      <td className="px-6 py-4">{formatCurrency(payment.amount)}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{formatPaymentMethod(payment.method)}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{formatShortDate(payment.billingDate)}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{formatShortDate(payment.date)}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="text-green-600" size={20} />
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">{payment.status}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => onViewInvoice(payment)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          View Invoice
        </button>
      </td>
    </tr>
  );
}
