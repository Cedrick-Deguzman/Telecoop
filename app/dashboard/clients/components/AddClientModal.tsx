'use client';

import { Plan, Napbox } from '../types';
import { FormInput } from '@/app/components/ui/FormInput';
import { FormSelect } from '@/app/components/ui/FormSelect';
import { useClientsPorts } from '../hooks/useClientPorts';

interface AddClientModalProps {
  plans: Plan[];
  napboxes: Napbox[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddClientModal({
  plans,
  napboxes,
  onClose,
  onSuccess,
}: AddClientModalProps) {
   const {
    selectedNapboxId,
    setSelectedNapboxId,
    selectedPortNumber,
    setSelectedPortNumber,
    availablePorts,
  } = useClientsPorts({ napboxes, selectedClient: null });

  /* -------------------------------------------- */
  /* Submit handler                               */
  /* -------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    const payload = {
      name: form.get('name')?.toString().trim(),
      email: form.get('email')?.toString().trim(),
      phone: form.get('phone')?.toString().trim(),
      planId: Number(form.get('planId')),
      napboxId: Number(form.get('napboxId')),
      portNumber: Number(form.get('portNumber')),
      installationDate: form.get('installationDate')?.toString(),
    };

    if (!payload.name || !payload.planId || !payload.installationDate) {
      alert('Name, plan, and installation date are required');
      return;
    }

    try {
      const plan = plans.find((p) => p.id === payload.planId);

      const res = await fetch('/api/clients/add-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          planName: plan?.name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to add client');
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Something went wrong while adding client');
    }
  };

  /* -------------------------------------------- */
  /* Render                                       */
  /* -------------------------------------------- */

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl mb-4">Add New Client</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput label="Full Name" name="name" required />
          <FormInput label="Email" name="email" type="email" />
          <FormInput label="Phone" name="phone" type="tel" />

          <FormSelect
            label="Plan"
            name="planId"
            required
            options={plans.map((p) => ({
              value: p.id,
              label: p.name,
            }))}
          />

          <FormSelect
            label="Napbox"
            name="napboxId"
            required
            options={napboxes.map((n) => ({
              value: n.id,
              label: n.name,
            }))}
            value={selectedNapboxId ?? ""}
            onChange={(e: any) => {
              setSelectedNapboxId(Number(e.target.value));
              setSelectedPortNumber(null);
            }} 
          />

          <FormSelect
            label="Port Number"
            name="portNumber"
            required
            options={availablePorts.map((p) => ({
              value: p.portNumber,
              label: `Port ${p.portNumber}`,
            }))}
            value={selectedPortNumber ?? ""}
             onChange={(e: any) => setSelectedPortNumber(Number(e.target.value))}
          />

          <FormInput
            label="Installation Date"
            name="installationDate"
            type="date"
            required
          />

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Add Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
