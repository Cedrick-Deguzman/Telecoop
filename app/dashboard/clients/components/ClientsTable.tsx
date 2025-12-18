'use client';

import { Client, Napbox } from '../types';
import  ClientsRow  from './ClientRow';

interface ClientsTableProps {
  clients: Client[];
  napboxes: Napbox[];
  onEdit: (client: Client) => void;
  onView: (client: Client) => void;
  onDelete: (clientId: number) => void;
}

export default function ClientsTable({
  clients,
  napboxes,
  onEdit,
  onView,
  onDelete,
}: ClientsTableProps) {
  if (clients.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        No clients found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className='bg-gray-50 border-b'>
          <tr className="border-b text-left text-sm text-gray-600 bg-gray-50">
            <th className="px-6 py-3 text-left text-gray-500">Client</th>
            <th className="px-6 py-3 text-left text-gray-500">Contact</th>
            <th className="px-6 py-3 text-left text-gray-500">Plan</th>
            <th className="px-6 py-3 text-left text-gray-500">Status</th>
            <th className="px-6 py-3 text-left text-gray-500">Monthly Fee</th>          
            <th className="px-6 py-3 text-left text-gray-500">Last Payment</th>
            <th className="px-6 py-3 text-left text-gray-500">Port</th>
            <th className="px-6 py-3 text-left text-gray-500">Actions</th>
          </tr>
        </thead>

        <tbody className='divide-y'>
          {clients.map((client) => (
            <ClientsRow
            key={client.id}
            client={client}
            napBoxes={napboxes}
            onEdit={onEdit}
            onView={onView}
            onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
