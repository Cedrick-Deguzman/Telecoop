import { BillingRecord } from "../types";
import { BillingRow } from './BillingRow';

interface BillingTableProps {
  records: BillingRecord[];
  onMarkAsPaid: (record: BillingRecord) => void;
  onViewInvoice: (record: BillingRecord) => void;
}

export function BillingTable({ records, onMarkAsPaid, onViewInvoice }: BillingTableProps) {
  return (
    <div className="shell-panel overflow-hidden">
      <div className="border-b border-slate-200/70 px-5 py-4">
        <p className="section-kicker">Records</p>
        <h3 className="mt-2 text-2xl text-slate-950">Invoice ledger</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1080px] w-full">
          <thead className="bg-slate-50/90">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Client</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Plan</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Billing Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Due Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Payment Info</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/70">
            {records.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-14 text-center">
                  <div className="mx-auto max-w-md space-y-2">
                    <p className="text-lg font-semibold text-slate-900">No billing records found</p>
                    <p className="text-sm text-slate-500">Try adjusting the current search or filter settings.</p>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <BillingRow
                  key={record.id}
                  record={record}
                  onMarkAsPaid={onMarkAsPaid}
                  onViewInvoice={onViewInvoice}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
