'use client';

import { ModalPortal } from '@/app/components/ui/ModalPortal';
import { Plan, Napbox } from '../types';
import { FormInput } from '@/app/components/ui/FormInput';
import { FormSelect } from '@/app/components/ui/FormSelect';
import { useClientsPorts } from '../hooks/useClientPorts';
import { LoaderCircle } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';

interface AddClientModalProps {
  plans: Plan[];
  napboxes: Napbox[];
  onClose: () => void;
  onSuccess: () => void;
  defaultName?: string;
  defaultPhone?: string;
  defaultInstallationDate?: string;
  installationId?: number;
}

export default function AddClientModal({
  plans,
  napboxes,
  onClose,
  onSuccess,
  defaultName,
  defaultPhone,
  defaultInstallationDate,
  installationId,
}: AddClientModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    selectedNapboxId,
    setSelectedNapboxId,
    selectedPortNumber,
    setSelectedPortNumber,
    availablePorts,
  } = useClientsPorts({ napboxes, selectedClient: null });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

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
      setIsSubmitting(true);
      const plan = plans.find((p) => p.id === payload.planId);

      const res = await fetch('/api/clients/add-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, planName: plan?.name }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to add client');
        return;
      }

      if (installationId) {
        await fetch(`/api/installations/${installationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId: data.id, convertedAt: new Date().toISOString() }),
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Something went wrong while adding client');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black/50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl mb-4">
              {installationId ? 'Convert to Client' : 'Add New Client'}
            </h2>

            {installationId && (
              <div className="mb-4 rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-3 text-sm text-indigo-700">
                Pre-filled from job order. Complete the plan and port assignment below.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput label="Full Name" name="name" required defaultValue={defaultName} />
              <FormInput label="Email" name="email" type="email" />
              <FormInput label="Phone" name="phone" type="tel" defaultValue={defaultPhone} />

              <FormSelect
                label="Plan"
                name="planId"
                required
                options={plans.map((p) => ({ value: p.id, label: p.name }))}
              />

              <FormSelect
                label="Napbox"
                name="napboxId"
                required
                options={napboxes.map((n) => ({ value: n.id, label: n.name }))}
                value={selectedNapboxId ?? ''}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  setSelectedNapboxId(Number(e.target.value));
                  setSelectedPortNumber(null);
                }}
              />

              <FormSelect
                label="Port Number"
                name="portNumber"
                required
                options={availablePorts.map((p) => ({ value: p.portNumber, label: `Port ${p.portNumber}` }))}
                value={selectedPortNumber ?? ''}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedPortNumber(Number(e.target.value))}
              />

              <FormInput
                label="Installation Date"
                name="installationDate"
                type="date"
                required
                defaultValue={defaultInstallationDate}
              />

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
                >
                  {isSubmitting && <LoaderCircle size={18} className="animate-spin" />}
                  {isSubmitting ? 'Saving...' : installationId ? 'Convert to Client' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
