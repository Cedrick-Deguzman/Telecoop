'use client';
import { ModalPortal } from '@/app/components/ui/ModalPortal';
import { useState, useEffect, type FormEvent } from 'react';
import { X, LoaderCircle } from 'lucide-react';
import { Installation, InstallationStatus, TechnicianOption } from '../types';

interface Props {
  installation: Installation | null;
  technicians: TechnicianOption[];
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS: { value: InstallationStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'rescheduled', label: 'Rescheduled' },
];

export function AddEditInstallationModal({ installation, technicians, onClose, onSuccess }: Props) {
  const isEdit = !!installation;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    prospectName: '',
    prospectPhone: '',
    prospectAddress: '',
    technicianId: '',
    scheduledDate: '',
    completedDate: '',
    status: 'pending' as InstallationStatus,
    notes: '',
  });

  useEffect(() => {
    if (installation) {
      setForm({
        prospectName: installation.prospectName ?? '',
        prospectPhone: installation.prospectPhone ?? '',
        prospectAddress: installation.prospectAddress ?? '',
        technicianId: installation.technicianId?.toString() ?? '',
        scheduledDate: installation.scheduledDate ? installation.scheduledDate.slice(0, 10) : '',
        completedDate: installation.completedDate ? installation.completedDate.slice(0, 10) : '',
        status: installation.status,
        notes: installation.notes ?? '',
      });
    }
  }, [installation]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!form.prospectName.trim()) { alert('Prospect name is required'); return; }
    setIsSubmitting(true);
    try {
      const url = isEdit ? `/api/installations/${installation!.id}` : '/api/installations';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectName: form.prospectName,
          prospectPhone: form.prospectPhone || null,
          prospectAddress: form.prospectAddress || null,
          technicianId: form.technicianId ? Number(form.technicianId) : null,
          scheduledDate: form.scheduledDate || null,
          completedDate: form.completedDate || null,
          status: form.status,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) { const d = await res.json(); alert(d.error || 'Failed'); return; }
      onSuccess();
      onClose();
    } catch { alert('Something went wrong'); }
    finally { setIsSubmitting(false); }
  };

  const activeTechs = technicians.filter(t => t.status === 'active');

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black/50 overflow-y-auto z-50">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold">{isEdit ? 'Edit Job Order' : 'New Job Order'}</h2>
              <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100"><X size={18} /></button>
            </div>

            {isEdit && installation?.convertedAt && (
              <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">✓ Converted to Client</p>
                <p className="text-sm text-emerald-600 mt-0.5">{installation.client?.name}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prospect Name <span className="text-red-500">*</span></label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.prospectName}
                  onChange={e => setForm(f => ({ ...f, prospectName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.prospectPhone}
                  onChange={e => setForm(f => ({ ...f, prospectPhone: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address / Area</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Brgy. San Jose, Zone 3"
                  value={form.prospectAddress}
                  onChange={e => setForm(f => ({ ...f, prospectAddress: e.target.value }))}
                />
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assign Technician</label>
                  <select
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.technicianId}
                    onChange={e => setForm(f => ({ ...f, technicianId: e.target.value }))}
                  >
                    <option value="">— Not assigned yet —</option>
                    {activeTechs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as InstallationStatus }))}
                  >
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Date</label>
                  <input type="date" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Completed Date</label>
                  <input type="date" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.completedDate} onChange={e => setForm(f => ({ ...f, completedDate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                  <textarea className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" rows={3} placeholder="Field notes or remarks..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm hover:bg-slate-50 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex flex-1 items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:bg-indigo-400">
                  {isSubmitting && <LoaderCircle size={16} className="animate-spin" />}
                  {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Job Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
