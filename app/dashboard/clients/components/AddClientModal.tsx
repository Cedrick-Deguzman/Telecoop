'use client';

import { ModalPortal } from '@/app/components/ui/ModalPortal';
import { Plan, Napbox } from '../types';
import { FormInput } from '@/app/components/ui/FormInput';
import { FormSelect } from '@/app/components/ui/FormSelect';
import { useClientsPorts } from '../hooks/useClientPorts';
import { LoaderCircle } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { getFirstDueDate, getDaysOfService, getProratedAmount } from '@/lib/billing-utils';

interface AddClientModalProps {
  plans: Plan[];
  napboxes: Napbox[];
  onClose: () => void;
  onSuccess: () => void;
  defaultName?: string;
  defaultPhone?: string;
  defaultAddress?: string;
  defaultInstallationDate?: string;
  defaultNapboxId?: number | null;
  defaultPortNumber?: number | null;
  installationId?: number;
}

function parseUTCDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export default function AddClientModal({
  plans,
  napboxes,
  onClose,
  onSuccess,
  defaultName,
  defaultPhone,
  defaultAddress,
  defaultInstallationDate,
  defaultNapboxId,
  defaultPortNumber,
  installationId,
}: AddClientModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(plans[0]?.id ?? null);
  const [installationDate, setInstallationDate] = useState(defaultInstallationDate || '');
  const [billingDay, setBillingDay] = useState<number>(15);

  const {
    selectedNapboxId,
    setSelectedNapboxId,
    selectedPortNumber,
    setSelectedPortNumber,
    availablePorts,
  } = useClientsPorts({ napboxes, selectedClient: null, initialNapboxId: defaultNapboxId, initialPortNumber: defaultPortNumber });

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const preview = (() => {
    if (!selectedPlan || !installationDate) return null;
    const install = parseUTCDate(installationDate);
    const firstDueDate = getFirstDueDate(install, billingDay);
    const days = getDaysOfService(install, firstDueDate);
    const amount = getProratedAmount(selectedPlan.price, days);
    return { firstDueDate, days, amount };
  })();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get('name')?.toString().trim(),
      email: form.get('email')?.toString().trim(),
      phone: form.get('phone')?.toString().trim(),
      address: form.get('address')?.toString().trim(),
      planId: Number(form.get('planId')),
      napboxId: Number(form.get('napboxId')),
      portNumber: Number(form.get('portNumber')),
      installationDate: form.get('installationDate')?.toString(),
      billingDay,
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
                Review and verify all details before confirming. Adjust the plan, port, and billing as needed.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput label="Full Name" name="name" required defaultValue={defaultName} />
              <FormInput label="Email" name="email" type="email" />
              <FormInput label="Phone" name="phone" type="tel" defaultValue={defaultPhone} />
              <FormInput label="Address" name="address" defaultValue={defaultAddress} />

              <FormSelect
                label="Plan"
                name="planId"
                required
                options={plans.map((p) => ({ value: p.id, label: p.name }))}
                value={selectedPlanId ?? ''}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedPlanId(Number(e.target.value))}
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
                onChange={(e) => setInstallationDate(e.target.value)}
              />

              <div>
                <label className="block text-sm mb-1 text-gray-700">Billing Day</label>
                <div className="flex gap-3">
                  {[15, 30].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setBillingDay(day)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        billingDay === day
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Every {day}th
                    </button>
                  ))}
                </div>
              </div>

              {preview && (
                <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4 text-sm">
                  <p className="font-semibold text-indigo-800 mb-2">First Invoice Preview</p>
                  <div className="space-y-1 text-indigo-700">
                    <div className="flex justify-between">
                      <span>First Due Date</span>
                      <span className="font-medium">
                        {preview.firstDueDate.toLocaleDateString('en-PH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          timeZone: 'UTC',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Days of Service</span>
                      <span className="font-medium">{preview.days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Prorated Amount</span>
                      <span className="font-semibold text-indigo-900">
                        ₱{preview.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 mt-1 border-t border-indigo-200">
                      <span className="text-indigo-500">Subsequent invoices</span>
                      <span className="font-medium text-indigo-500">
                        ₱{selectedPlan!.price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
                      </span>
                    </div>
                  </div>
                </div>
              )}

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
