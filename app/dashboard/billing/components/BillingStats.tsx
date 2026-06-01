import {
  ReceiptText,
  CircleDollarSign,
  Clock3,
  AlertTriangle,
  Wallet,
  TimerReset,
  type LucideIcon,
} from 'lucide-react';
import { BillingRecord } from '../types';
import { formatCurrency } from '@/app/utils/format';

interface BillingStatsProps {
  records: BillingRecord[];
}

type Tone = 'sky' | 'emerald' | 'amber' | 'rose';

const toneClasses: Record<Tone, { value: string; icon: string; iconBg: string; accent: string }> = {
  sky: {
    value: 'text-sky-700',
    icon: 'text-sky-700',
    iconBg: 'bg-sky-50',
    accent: 'from-sky-500/18 via-sky-500/6 to-transparent',
  },
  emerald: {
    value: 'text-emerald-700',
    icon: 'text-emerald-700',
    iconBg: 'bg-emerald-50',
    accent: 'from-emerald-500/18 via-emerald-500/6 to-transparent',
  },
  amber: {
    value: 'text-amber-700',
    icon: 'text-amber-700',
    iconBg: 'bg-amber-50',
    accent: 'from-amber-500/18 via-amber-500/6 to-transparent',
  },
  rose: {
    value: 'text-rose-700',
    icon: 'text-rose-700',
    iconBg: 'bg-rose-50',
    accent: 'from-rose-500/18 via-rose-500/6 to-transparent',
  },
};

export function BillingStats({ records }: BillingStatsProps) {
  const totalRevenue = records
    .filter((record) => record.status === 'paid')
    .reduce((sum, record) => sum + record.amount, 0);

  const pendingCount = records.filter((record) => record.status === 'pending').length;
  const overdueCount = records.filter((record) => record.status === 'overdue').length;
  const totalBills = records.length;
  const paidCount = records.filter((record) => record.status === 'paid').length;
  const pendingAmount = records
    .filter((record) => record.status === 'pending')
    .reduce((sum, record) => sum + record.amount, 0);
  const overdueAmount = records
    .filter((record) => record.status === 'overdue')
    .reduce((sum, record) => sum + record.amount, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Payments collected for overdue invoices from previous months do not appear in the current-month paid count,
        but they are still included in total revenue.
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <BillingStatCard
          label="Total Bills"
          value={String(totalBills)}
          icon={ReceiptText}
          tone="sky"
          footnote="Invoices in this billing cycle"
        />
        <BillingStatCard
          label="Paid Revenue"
          value={formatCurrency(totalRevenue)}
          icon={CircleDollarSign}
          tone="emerald"
          footnote={`${paidCount} payment${paidCount === 1 ? '' : 's'} settled`}
        />
        <BillingStatCard
          label="Pending Invoices"
          value={String(pendingCount)}
          icon={Clock3}
          tone="amber"
          footnote="Awaiting customer payment"
        />
        <BillingStatCard
          label="Overdue Invoices"
          value={String(overdueCount)}
          icon={AlertTriangle}
          tone="rose"
          footnote="Need follow-up action"
        />
        <BillingStatCard
          label="Pending Amount"
          value={formatCurrency(pendingAmount)}
          icon={TimerReset}
          tone="amber"
          footnote="Expected but not yet collected"
        />
        <BillingStatCard
          label="Overdue Amount"
          value={formatCurrency(overdueAmount)}
          icon={Wallet}
          tone="rose"
          footnote="Past due balance exposure"
        />
      </div>
    </div>
  );
}

function BillingStatCard({
  label,
  value,
  footnote,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  footnote: string;
  icon: LucideIcon;
  tone: Tone;
}) {
  const styles = toneClasses[tone];

  return (
    <div className="shell-panel relative overflow-hidden p-5">
      <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${styles.accent}`} />
      <div className="relative flex h-full flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <p className="section-kicker max-w-[70%]">{label}</p>
          <div className={`shrink-0 rounded-2xl border border-slate-200/80 ${styles.iconBg} p-3`}>
            <Icon className={styles.icon} size={22} />
          </div>
        </div>

        <div className="space-y-3">
          <p className={`overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(2rem,3vw,2.75rem)] font-semibold leading-none tracking-[-0.04em] tabular-nums ${styles.value}`}>
            {value}
          </p>
          <p className="text-sm text-slate-500">{footnote}</p>
        </div>
      </div>
    </div>
  );
}
