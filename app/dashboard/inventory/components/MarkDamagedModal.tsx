'use client';

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { ModalPortal } from '@/app/components/ui/ModalPortal';

interface Props {
  serial: { id: number; serialNumber: string; itemName: string };
  onClose: () => void;
  onSuccess: () => void;
}

const DAMAGE_REASONS = [
  'Physical damage',
  'Water damage',
  'Defective unit',
  'Stolen',
];

export default function MarkDamagedModal({ serial, onClose, onSuccess }: Props) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) { setError('Please select a reason.'); return; }
    setError('');
    setSaving(true);
    try {
      const res = await fetch(`/api/inventory/serials/${serial.id}/damage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, notes }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to mark as damaged'); return; }
      onSuccess();
      onClose();
    } catch {
      setError('Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            <h2 className="text-lg font-semibold text-slate-900">Mark as Damaged</h2>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">Serial</p>
            <p className="font-mono text-sm font-semibold text-slate-900">{serial.serialNumber}</p>
            <p className="text-xs text-slate-400">{serial.itemName}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Reason <span className="text-red-500">*</span></label>
            <select
              className="input mt-1 w-full"
              value={reason}
              onChange={e => { setError(''); setReason(e.target.value); }}
              required
            >
              <option value="">— Select reason —</option>
              {DAMAGE_REASONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Notes <span className="font-normal text-slate-400">(optional)</span></label>
            <textarea
              className="input mt-1 w-full resize-none"
              rows={2}
              placeholder="Additional details..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Confirm Damaged'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  );
}
