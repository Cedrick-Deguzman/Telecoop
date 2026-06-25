'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { InventoryItem } from '../types';
import { ModalPortal } from '@/app/components/ui/ModalPortal';

interface Props {
  item: InventoryItem;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReturnModal({ item, onClose, onSuccess }: Props) {
  const isSerialized = item.category.type === 'serialized';
  const deployedSerials = item.serials?.filter(s => s.status === 'deployed' || s.status === 'returned') ?? [];
  const returnableSerials = item.serials?.filter(s => s.status === 'deployed') ?? [];

  const [quantity, setQuantity] = useState('');
  const [selectedSerialIds, setSelectedSerialIds] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [performedBy, setPerformedBy] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleSerial = (id: number) =>
    setSelectedSerialIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const body = isSerialized
        ? { serialIds: selectedSerialIds, notes, performedBy }
        : { quantity: Number(quantity), notes, performedBy };

      const res = await fetch(`/api/inventory/${item.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      onSuccess();
      onClose();
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Return Stock</h2>
            <p className="text-sm text-slate-500">{item.name} · {item.category.name}</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {isSerialized ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Select Units to Return ({returnableSerials.length} deployed)
              </label>
              {returnableSerials.length === 0 ? (
                <p className="text-sm text-slate-500">No deployed units to return.</p>
              ) : (
                <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
                  {returnableSerials.map(s => (
                    <label
                      key={s.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSerialIds.includes(s.id)}
                        onChange={() => toggleSerial(s.id)}
                        className="rounded"
                      />
                      <div>
                        <span className="font-mono text-sm text-slate-800">{s.serialNumber}</span>
                        {s.installation && (
                          <p className="text-xs text-slate-400">
                            {s.installation.client?.name ?? s.installation.prospectName ?? `Job #${s.installation.id}`}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {deployedSerials.length === 0 && returnableSerials.length === 0 && (
                <p className="text-sm text-slate-400">No units to return.</p>
              )}
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-slate-700">
                Quantity ({item.unit})
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className="input mt-1 w-full"
                placeholder="Enter quantity being returned"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700">Returned By</label>
            <input
              className="input mt-1 w-full"
              placeholder="Technician or staff name"
              value={performedBy}
              onChange={e => setPerformedBy(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Notes</label>
            <textarea
              className="input mt-1 w-full resize-none"
              rows={2}
              placeholder="Condition, reason for return, etc."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button
              type="submit"
              disabled={saving || (isSerialized && selectedSerialIds.length === 0)}
              className="btn-primary flex-1"
            >
              {saving ? 'Processing...' : 'Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  );
}
