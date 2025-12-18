import { Users, PhilippinePeso, TrendingUp } from "lucide-react";

interface PlansStatsProps {
  totalSubscribers: number;
  totalRevenue: number;
}

export function PlansStats({ totalSubscribers, totalRevenue }: PlansStatsProps) {
  const arpu = totalSubscribers > 0 ? totalRevenue / totalSubscribers : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <StatCard icon={<Users className="text-indigo-600" size={24} />} label="Total Subscribers" value={totalSubscribers} />
      <StatCard icon={<PhilippinePeso className="text-green-600" size={24} />} label="Monthly Revenue" value={`₱${totalRevenue.toFixed(2)}`} />
      <StatCard icon={<TrendingUp className="text-purple-600" size={24} />} label="ARPU" value={`₱${arpu.toFixed(2)}`} />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-3">
      <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
      <div>
        <p className="text-gray-500">{label}</p>
        <p className="text-2xl mt-1">{value}</p>
      </div>
    </div>
  );
}