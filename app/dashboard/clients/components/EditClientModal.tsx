'use client';

import { Client, Plan, Napbox } from '../types';
import { FormInput } from '@/app/components/ui/FormInput';
import { FormSelect } from '@/app/components/ui/FormSelect';
import { useClientsPorts } from '../hooks/useClientPorts';
import { useState, type ChangeEvent } from "react";

type ClientUpdatePayload = {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  planId: number | null;
  status: Client["status"];
  napboxId?: number;
  portNumber?: number;
};

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
  const [status, setStatus] = useState<Client["status"]>(client.status);
  const [isSaving, setIsSaving] = useState(false);
  const lastNapboxName = napboxes.find(
    (n) => n.id === client.lastNapboxId
  )?.name;

  /* -------------------------------------------- */
  /* Submit handler                               */
  /* -------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const form = new FormData(e.currentTarget);

    const payload: ClientUpdatePayload = {
      id: client.id,
      name: form.get('name')?.toString(),
      email: form.get('email')?.toString(),
      phone: form.get('phone')?.toString(),
      planId: form.get('planId')
        ? Number(form.get('planId'))
        : null,
      status,
    };
    
    if (selectedNapboxId != null) {
      payload.napboxId = selectedNapboxId;
    }

    if (selectedPortNumber != null) {
      payload.portNumber = selectedPortNumber;
    }
    
    try {
      const res = await fetch('/api/clients/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to update client');
        setIsSaving(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error updating client');
      setIsSaving(false);
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
            disabled={isSaving}
          />

          <FormInput
            label="Email"
            name="email"
            type="email"
            defaultValue={client.email}
            disabled={isSaving}
          />

          <FormInput
            label="Phone"
            name="phone"
            defaultValue={client.phone}
            disabled={isSaving}
          />

          <FormSelect
            label="Plan"
            name="planId"
            options={plans.map((p) => ({
              value: p.id,
              label: p.name,
            }))}
            defaultValue={client.planId}
            disabled={isSaving}
          />

          <div>
            <label className="block text-sm mb-1 text-gray-700">
              Status
            </label>
            <select
              name="status"
              value={status}
              onChange={(e) => {
                const newStatus = e.target.value as Client["status"];
                setStatus(newStatus);

                if (newStatus === "inactive") {
                  setSelectedNapboxId(null);
                  setSelectedPortNumber(null);
                }
              }}
              disabled={isSaving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {client.lastNapboxId && client.lastPortNumber && (
            <button
              type="button"
              disabled={status !== "active" || isSaving}
              className={`mt-2 w-full px-3 py-2 rounded text-sm text-white
                ${
                  status === "active" && !isSaving
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              onClick={() => {
                if (status !== "active") return;
                setSelectedNapboxId(client.lastNapboxId ?? null);
                setSelectedPortNumber(client.lastPortNumber ?? null);
              }}
            >
              Use Previous NAP Box / Port
              {lastNapboxName && client.lastPortNumber && (
                <span className="block text-xs mt-1 opacity-90">
                  NAP Box {lastNapboxName} — Port {client.lastPortNumber}
                </span>
              )}
            </button>
          )}

         <FormSelect
            label="Napbox"
            name="napboxId"
            disabled={status === "inactive" || isSaving}
            options={napboxes.map((n) => ({
              value: n.id,
              label: n.name,
            }))}
            value={selectedNapboxId ?? ""}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              setSelectedNapboxId(Number(e.target.value));
              setSelectedPortNumber(null); // reset port when napbox changes
            }}
          />


          <FormSelect
            label="Port Number"
            name="portNumber"
            disabled={status === "inactive" || !selectedNapboxId || isSaving}
            options={availablePorts.map((p) => ({
              value: p.portNumber,
              label: `Port ${p.portNumber}`,
            }))}
            value={selectedPortNumber ?? ""}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setSelectedPortNumber(Number(e.target.value))
            }
            placeholder={selectedNapboxId ? "Select Port" : "Select Napbox first"}
          />


          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isSaving ? 'Updating Client...' : 'Update Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
