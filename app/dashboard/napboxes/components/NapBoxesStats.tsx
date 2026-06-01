import { Box, Wifi, WifiOff, User, Wrench, type LucideIcon } from 'lucide-react';

interface Stats {
  totalNapBoxes: number;
  totalPorts: number;
  totalAvailable: number;
  totalOccupied: number;
  totalReserved: number;
}

const colorClasses: Record<string, { badge: string; icon: string }> = {
  indigo: { badge: 'bg-indigo-100', icon: 'text-indigo-600' },
  purple: { badge: 'bg-purple-100', icon: 'text-purple-600' },
  green: { badge: 'bg-green-100', icon: 'text-green-600' },
  blue: { badge: 'bg-blue-100', icon: 'text-blue-600' },
  amber: { badge: 'bg-amber-100', icon: 'text-amber-600' },
};

export function NapBoxesStats({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
      <Stat icon={Box} label="Total NAP Boxes" value={stats.totalNapBoxes} color="indigo" />
      <Stat icon={Wifi} label="Total Ports" value={stats.totalPorts} color="purple" />
      <Stat icon={WifiOff} label="Available Ports" value={stats.totalAvailable} color="green" />
      <Stat icon={User} label="Occupied Ports" value={stats.totalOccupied} color="blue" />
      <Stat icon={Wrench} label="Internal/Test Ports" value={stats.totalReserved} color="amber" />
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
}) {
  const classes = colorClasses[color] || colorClasses.indigo;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`${classes.badge} rounded-full p-3`}>
          <Icon className={classes.icon} size={24} />
        </div>
        <div>
          <p className="text-gray-500">{label}</p>
          <p className="text-2xl mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}
