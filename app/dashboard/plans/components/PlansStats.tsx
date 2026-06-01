import { Users, PhilippinePeso, TrendingUp } from "lucide-react";
import { StatCard } from "@/app/components/ui/StatCard";
import { formatCurrency } from "@/app/utils/format";

interface PlansStatsProps {
  totalSubscribers: number;
  totalRevenue: number;
}

export function PlansStats({ totalSubscribers, totalRevenue }: PlansStatsProps) {
  const arpu = totalSubscribers > 0 ? totalRevenue / totalSubscribers : 0;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <StatCard
        icon={<Users className="text-indigo-600" size={24} />}
        label="Total Active Subscribers"
        value={totalSubscribers}
      />
      <StatCard
        icon={<PhilippinePeso className="text-green-600" size={24} />}
        label="Monthly Revenue"
        value={formatCurrency(totalRevenue)}
        color="text-green-700"
      />
      <StatCard
        icon={<TrendingUp className="text-purple-600" size={24} />}
        label="ARPU"
        value={formatCurrency(arpu)}
        color="text-purple-700"
      />
    </div>
  );
}
