import { BillingRecord } from '../types';
import { StatCard } from '@/app/components/ui/StatCard';

interface BillingStatsProps {
  records: BillingRecord[];
}

export function BillingStats({ records }: BillingStatsProps) {
  const totalRevenue = records
    .filter((r) => r.status === 'paid')
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingCount = records.filter((r) => r.status === 'pending').length;
  const overdueCount = records.filter((r) => r.status === 'overdue').length;
  const totalBills = records.length;
  const paidCount = records.filter((r) => r.status === 'paid').length;
  const pendingAmount = records
    .filter((r) => r.status === 'pending' || r.status === 'overdue')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <p className="text-yellow-800 text-sm">
        Note: This table only shows invoices for the current month. Payments collected for overdue invoices from previous months will not appear in Paid stats, but are included in the Total Revenue.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Bills" value={totalBills} color="text-blue-600" />

        <StatCard
          label="Paid"
          value={`${paidCount} payments`}
          color="text-green-600"
          subtitle={`₱${totalRevenue.toLocaleString()}`}
        />
        <StatCard
          label="Pending Invoices"
          value={pendingCount}
          color="text-yellow-600"
        />

        <StatCard
          label="Overdue Invoices"
          value={overdueCount}
          color="text-red-600"
        />

        <StatCard
          label="Pending Amount"
          value={`₱${pendingAmount.toLocaleString()}`}
          color="text-yellow-600"
        />
      </div>
    </div>
  );
}
