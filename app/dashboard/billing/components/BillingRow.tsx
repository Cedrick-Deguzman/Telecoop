import { BillingRecord } from '../types';
import { CheckCircle, Clock, AlertCircle, Calendar, Eye } from 'lucide-react';
import { formatCurrency, formatPaymentMethod, formatShortDate } from '@/app/utils/format';

interface BillingRowProps {
  record: BillingRecord;
  onMarkAsPaid: (record: BillingRecord) => void;
  onViewInvoice: (record: BillingRecord) => void;
}

const statusMeta = {
  paid: {
    badge: 'bg-emerald-50 text-emerald-700',
    icon: <CheckCircle className="text-emerald-600" size={18} />,
  },
  pending: {
    badge: 'bg-amber-50 text-amber-700',
    icon: <Clock className="text-amber-600" size={18} />,
  },
  overdue: {
    badge: 'bg-rose-50 text-rose-700',
    icon: <AlertCircle className="text-rose-600" size={18} />,
  },
};

export function BillingRow({ record, onMarkAsPaid, onViewInvoice }: BillingRowProps) {
  const meta = statusMeta[record.status];

  return (
    <tr className="transition hover:bg-slate-50/80">
      <td className="px-6 py-4">
        <div className="space-y-1">
          <p className="font-semibold text-slate-900">{record.clientName}</p>
          <p className="text-sm text-slate-500">{record.email}</p>
        </div>
      </td>

      <td className="px-6 py-4 text-sm text-slate-600">{record.plan}</td>

      <td className="px-6 py-4">
        <div className="text-sm font-semibold text-slate-900">{formatCurrency(record.amount)}</div>
      </td>

      <td className="px-6 py-4 text-sm text-slate-600">{formatShortDate(record.billingDate)}</td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={16} className="text-slate-400" />
          <span className={record.status === 'overdue' ? 'text-rose-700' : 'text-slate-600'}>
            {formatShortDate(record.dueDate)}
          </span>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {meta.icon}
          <span className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${meta.badge}`}>{record.status}</span>
        </div>
      </td>

      <td className="px-6 py-4 text-sm">
        {record.status === 'paid' ? (
          <div className="space-y-1">
            <p className="font-medium text-emerald-700">Paid on {formatShortDate(record.paidDate)}</p>
            <p className="text-slate-500">{formatPaymentMethod(record.paymentMethod)}</p>
          </div>
        ) : (
          <span className="text-slate-400">Not paid yet</span>
        )}
      </td>

      <td className="px-6 py-4">
        <div className="flex flex-wrap items-center gap-2">
          {record.status !== 'paid' ? (
            <button
              onClick={() => onMarkAsPaid(record)}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Mark as Paid
            </button>
          ) : (
            <button
              onClick={() => onViewInvoice(record)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Eye size={16} />
              View Invoice
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
