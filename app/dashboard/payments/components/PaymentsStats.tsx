import { StatCard } from '@/app/components/ui/StatCard';
import { CircleDollarSign } from 'lucide-react';
import { PaymentRecord } from '../../billing/types';
import { formatCurrency } from '@/app/utils/format';

interface Props {
  payments: PaymentRecord[];
}

export function PaymentsStats({ payments }: Props) {
  const totalRevenue = payments
    .filter((payment) => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <StatCard
        label="Total Revenue (Paid)"
        value={formatCurrency(totalRevenue)}
        color="text-green-700"
        subtitle={`${payments.filter((payment) => payment.status === 'paid').length} payments`}
        icon={<CircleDollarSign className="text-green-600" size={24} />}
      />
    </div>
  );
}
