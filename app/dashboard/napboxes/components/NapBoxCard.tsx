import { MapPin } from 'lucide-react';
import { NapBox } from '../types';

type StatColor = 'green' | 'blue' | 'red' | 'amber' | 'purple';

interface StatProps {
  label: string;
  value: number;
  color: StatColor;
}

const statColorClasses: Record<StatColor, { bg: string; text: string }> = {
  green: { bg: 'bg-green-50', text: 'text-green-600' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  red: { bg: 'bg-red-50', text: 'text-red-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
};

export function NapBoxCard({
  napBox,
  onViewPorts,
}: {
  napBox: NapBox;
  onViewPorts: () => void;
}) {
  const statusColor = {
    active: 'bg-green-100 text-green-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    offline: 'bg-red-100 text-red-800',
  }[napBox.status];

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl text-white">{napBox.name}</h3>
            <div className="flex items-center gap-1 text-indigo-100 text-sm">
              <MapPin size={14} /> {napBox.location}
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${statusColor}`}>{napBox.status}</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Available" value={napBox.availablePorts} color="green" />
          <Stat label="Occupied" value={napBox.occupiedPorts} color="blue" />
          <Stat label="Faulty" value={napBox.faultyPorts} color="red" />
        </div>

        <div>
          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Port Utilization</span>
              <span>
                {Math.round(
                  (((napBox.occupiedPorts + napBox.internalUsePorts + napBox.testLinePorts) / napBox.totalPorts) || 0) * 100,
                )}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full"
                style={{ width: `${(((napBox.occupiedPorts + napBox.internalUsePorts + napBox.testLinePorts) / napBox.totalPorts) || 0) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p>Total Ports: {napBox.totalPorts}</p>
            <p>Installed: {napBox.installDate.split('T')[0]}</p>
            <p>Internal Use: {napBox.internalUsePorts}</p>
            <p>Test Line: {napBox.testLinePorts}</p>
          </div>
        </div>

        <button
          onClick={onViewPorts}
          className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          View Port Details
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: StatProps) {
  const classes = statColorClasses[color];

  return (
    <div className={`${classes.bg} p-3 rounded`}>
      <p className={`text-2xl ${classes.text}`}>{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}
