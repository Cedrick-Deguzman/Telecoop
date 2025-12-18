import { Box, Wifi, WifiOff, User } from 'lucide-react';

interface Stats {
  totalNapBoxes: number;
  totalPorts: number;
  totalAvailable: number;
  totalOccupied: number;
}

export function NapBoxesStats({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
      <Stat icon={Box} label="Total NAP Boxes" value={stats.totalNapBoxes} color="indigo" />
      <Stat icon={Wifi} label="Total Ports" value={stats.totalPorts} color="purple" />
      <Stat icon={WifiOff} label="Available Ports" value={stats.totalAvailable} color="green" />
      <Stat icon={User} label="Occupied Ports" value={stats.totalOccupied} color="blue" />
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`bg-${color}-100 p-3 rounded-full`}>
          <Icon className={`text-${color}-600`} size={24} />
        </div>
        <div>
          <p className="text-gray-500">{label}</p>
          <p className="text-2xl mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}
