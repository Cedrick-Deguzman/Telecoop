'use client';

import { Client, Plan, Napbox } from '../types';
import { FormInput } from '@/app/components/ui/FormInput';
import { FormSelect } from '@/app/components/ui/FormSelect';
import { useClientsPorts } from '../hooks/useClientPorts';

interface EditClientModalProps {
  client: Client;
  plans: Plan[];
  napboxes: Napbox[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditClientModal({
  client,
  plans,
  napboxes,
  onClose,
  onSuccess,
}: EditClientModalProps) {
  const {
    selectedNapboxId,
    setSelectedNapboxId,
    selectedPortNumber,
    setSelectedPortNumber,
    availablePorts,
  } = useClientsPorts({ napboxes, selectedClient: client });


  /* -------------------------------------------- */
  /* Submit handler                               */
  /* -------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    const payload = {
      id: client.id,
      name: form.get('name')?.toString(),
      email: form.get('email')?.toString(),
      phone: form.get('phone')?.toString(),
      planId: form.get('planId')
        ? Number(form.get('planId'))
        : null,
      status: form.get('status')?.toString(),
      napboxId: selectedNapboxId,
      portNumber: selectedPortNumber,
    };

    try {
      const res = await fetch('/api/clients/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to update client');
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error updating client');
    }
  };

  /* -------------------------------------------- */
  /* Render                                       */
  /* -------------------------------------------- */

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl mb-4">Edit Client</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormInput
            label="Full Name"
            name="name"
            defaultValue={client.name}
          />

          <FormInput
            label="Email"
            name="email"
            type="email"
            defaultValue={client.email}
          />

          <FormInput
            label="Phone"
            name="phone"
            defaultValue={client.phone}
          />

          <FormSelect
            label="Plan"
            name="planId"
            options={plans.map((p) => ({
              value: p.id,
              label: p.name,
            }))}
            defaultValue={client.planId}
          />

          <div>
            <label className="block text-sm mb-1 text-gray-700">
              Status
            </label>
            <select
              name="status"
              defaultValue={client.status}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

         <FormSelect
            label="Napbox"
            name="napboxId"
            options={napboxes.map((n) => ({
              value: n.id,
              label: n.name,
            }))}
            value={selectedNapboxId ?? ""}
            onChange={(e: any) => {
              setSelectedNapboxId(Number(e.target.value));
              setSelectedPortNumber(null); // reset port when napbox changes
            }}
          />


          <FormSelect
            label="Port Number"
            name="portNumber"
            options={availablePorts.map((p) => ({
              value: p.portNumber,
              label: `Port ${p.portNumber}`,
            }))}
            value={selectedPortNumber ?? ""}
            onChange={(e: any) =>
              setSelectedPortNumber(Number(e.target.value))
            }
            placeholder={selectedNapboxId ? "Select Port" : "Select Napbox first"}
            disabled={!selectedNapboxId}
          />


          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Update Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
