'use client';

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { InventoryItem } from '../types';
import { ModalPortal } from '@/app/components/ui/ModalPortal';

interface Props {
  item: InventoryItem;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StockInModal({ item, onClose, onSuccess }: Props) {
  const isSerialized = item.category.type === 'serialized';
  const [quantity, setQuantity] = useState('');
  const [serialNumbers, setSerialNumbers] = useState<string[]>(['']);
  const [macAddresses, setMacAddresses] = useState<string[]>(['']);
  const [notes, setNotes] = useState('');
  const [performedBy, setPerformedBy] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addSerial = () => {
    setSerialNumbers(prev => [...prev, '']);
    setMacAddresses(prev => [...prev, '']);
  };
  const removeSerial = (i: number) => {
    setSerialNumbers(prev => prev.filter((_, idx) => idx !== i));
    setMacAddresses(prev => prev.filter((_, idx) => idx !== i));
  };
  const updateSerial = (i: number, val: string) =>
    setSerialNumbers(prev => prev.map((s, idx) => (idx === i ? val : s)));
  const updateMac = (i: number, val: string) =>
    setMacAddresses(prev => prev.map((m, idx) => (idx === i ? val : m)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const body = isSerialized
        ? { serialNumbers: serialNumbers.map(s => s.trim()).filter(Boolean), macAddresses, notes, performedBy }
        : { quantity: Number(quantity), notes, performedBy };

      const res = await fetch(`/api/inventory/${item.id}/stock-in`, {
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
            <h2 className="text-lg font-semibold text-slate-900">Stock In</h2>
            <p className="text-sm text-slate-500">{item.name} · {item.category.name}</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {isSerialized ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Serial Numbers</label>
              {serialNumbers.map((sn, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      className="input flex-1"
                      placeholder={`Serial #${i + 1}`}
                      value={sn}
                      onChange={e => updateSerial(i, e.target.value)}
                    />
                    {serialNumbers.length > 1 && (
                      <button type="button" onClick={() => removeSerial(i)} className="rounded-xl p-2 text-red-500 hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <input
                    className="input w-full font-mono text-sm"
                    placeholder={`MAC Address #${i + 1} (e.g. AA:BB:CC:DD:EE:FF)`}
                    value={macAddresses[i] ?? ''}
                    onChange={e => updateMac(i, e.target.value)}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addSerial}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus size={14} /> Add another serial
              </button>
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
                placeholder="Enter quantity"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700">Received By</label>
            <input
              className="input mt-1 w-full"
              placeholder="Name of person receiving"
              value={performedBy}
              onChange={e => setPerformedBy(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Notes</label>
            <textarea
              className="input mt-1 w-full resize-none"
              rows={2}
              placeholder="Optional notes (supplier, PO number, etc.)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : 'Stock In'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  );
}
