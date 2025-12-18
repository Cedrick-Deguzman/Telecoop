import { PaymentRecord } from "../../billing/types";
import { PaymentsRow } from './PaymentsRow';

interface PaymentsTableProps {
  payments: PaymentRecord[];
  searchTerm: string;
  statusFilter: 'all' | PaymentRecord['status'];
  onViewInvoice: (payment: PaymentRecord) => void;
}

export function PaymentsTable({ payments, searchTerm, statusFilter, onViewInvoice }: PaymentsTableProps) {
  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceId.toString().toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
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
            {filteredPayments.map(payment => (
              <PaymentsRow key={payment.id} payment={payment} onViewInvoice={onViewInvoice} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
