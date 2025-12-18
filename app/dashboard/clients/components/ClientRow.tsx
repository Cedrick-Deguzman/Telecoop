'use client';

import { Client } from '../types';
import { Pencil, Trash2, Wifi, Zap, Crown, Rocket, Box, Phone, Mail } from 'lucide-react';
import { ActionButton }  from '../../../components/ui/ActionButton';
import { getLastPayment } from '@/app/utils/payment';

interface ClientsRowProps {
  client: Client;
  napBoxes: { id: number; name: string }[];
  onEdit: (client: Client) => void;
  onView: (client: Client) => void;
  onDelete: (clientId: number) => void;
}


export default function ClientsRow({
  client,
  onEdit,
  napBoxes,
}: ClientsRowProps) {

 const planIcons: Record<string, React.ElementType> = {
    "wifi": Wifi,
    "zap": Zap,
    "crown": Crown,
    "rocket": Rocket,
  };
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        {client.name}
      </td>

      <td className="px-6 py-4">
        <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
            <Mail size={14} className="text-gray-400" />
            {client.email || "N/A"}
            </div>
            <div className="flex items-center gap-2">
            <Phone size={14} className="text-gray-400" />
            {client.phone || "N/A"}
            </div>
        </div>
      </td>


      <td className="mt-2 px-6 py-4 flex items-center gap-2">
        {client.plan?.icon && (() => {
        const Icon = planIcons[client.plan.icon];
        return <Icon size={20} className={`text-${client.plan.color}-600`} />;
        })()}
        <span>{client.plan?.name || "N/A"}</span>
      </td>

      <td className="px-6 py-4">
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            client.status === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          {client.status}
        </span>
      </td>

      <td className="px-6 py-4">₱{client.monthlyFee.toFixed(2)}</td>

      <td className="px-6 py-4 text-sm text-gray-500">
        {getLastPayment(client)}
      </td>

      <td className="px-6 py-4">
        {client.napboxPort ? (
        <div className="flex items-center gap-2">
            <Box size={16} className="text-purple-600" />
            <div>
            <p className="text-sm">{napBoxes.find((n) => n.id === client.napboxPort?.napboxId)?.name}</p>
            <p className="text-xs text-gray-500">Port {client.napboxPort.portNumber}</p>
            </div>
        </div>
        ) : (
        <span className="text-sm text-gray-400">Not assigned</span>
        )}
      </td>

      <td className="px-6 py-4">
        <div className="flex gap-2">
        <ActionButton
          icon={<Pencil size={16} />}
          color="yellow"
          onClick={() => onEdit(client)}
        />
        </div>
      </td>
    </tr>
  );
}
