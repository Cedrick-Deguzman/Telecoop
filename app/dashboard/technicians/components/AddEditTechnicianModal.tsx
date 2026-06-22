'use client';
import { ModalPortal } from '@/app/components/ui/ModalPortal';
import { useState, useEffect, type FormEvent } from 'react';
import { X, LoaderCircle } from 'lucide-react';
import { Technician, TechnicianStatus } from '../types';

interface Props {
  technician: Technician | null;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS: { value: TechnicianStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on_leave', label: 'On Leave' },
];

export function AddEditTechnicianModal({ technician, onClose, onSuccess }: Props) {
  const isEdit = !!technician;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    contactNumber: '',
    area: '',
    status: 'active' as TechnicianStatus,
  });

  useEffect(() => {
    if (technician) {
      setForm({
        name: technician.name,
        contactNumber: technician.contactNumber ?? '',
        area: technician.area ?? '',
        status: technician.status,
      });
    }
  }, [technician]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!form.name.trim()) { alert('Name is required'); return; }
    setIsSubmitting(true);
    try {
      const url = isEdit ? `/api/technicians/${technician!.id}` : '/api/technicians';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); alert(d.error || 'Failed'); return; }
      onSuccess();
      onClose();
    } catch { alert('Something went wrong'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <ModalPortal>
    <div className="fixed inset-0 bg-black/50 overflow-y-auto z-50">
      <div className="flex min-h-full items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">{isEdit ? 'Edit Technician' : 'Add Technician'}</h2>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
            <input className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.contactNumber} onChange={e => setForm(f => ({ ...f, contactNumber: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Area / Coverage</label>
            <input className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Barangay San Jose" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as TechnicianStatus }))}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm hover:bg-slate-50 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex flex-1 items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:bg-indigo-400">
              {isSubmitting && <LoaderCircle size={16} className="animate-spin" />}
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Technician'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
    </ModalPortal>
  );
}
