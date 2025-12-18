import { StatCard } from '@/app/components/ui/StatCard';
import { PaymentRecord } from '../../billing/types';

interface Props {
  payments: PaymentRecord[];
}

export function PaymentsStats({ payments }: Props) {
  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <StatCard 
      label="Total Revenue (Paid)" 
      value={`₱${totalRevenue.toFixed(2)}`} 
      color="text-green-600" 
      subtitle={`${payments.filter(p => p.status === 'paid').length} payments`}
      />
    </div>
  );
}
