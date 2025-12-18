import { BillingRecord } from "../types";
import { BillingRow } from './BillingRow';

interface BillingTableProps {
  records: BillingRecord[];
  onMarkAsPaid: (record: BillingRecord) => void;
  onViewInvoice: (record: BillingRecord) => void;
}

export function BillingTable({
  records,
  onMarkAsPaid,
  onViewInvoice,
}: BillingTableProps) {
  return (
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
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  No billing records found
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
