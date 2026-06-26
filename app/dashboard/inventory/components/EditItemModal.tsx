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

export default function EditItemModal({ item, onClose, onSuccess }: Props) {
  const isConsumable = item.category.type === 'consumable';

  const [name, setName] = useState(item.name);
  const [unit, setUnit] = useState(item.unit);
  const [lowStockThreshold, setLowStockThreshold] = useState(
    item.lowStockThreshold !== null ? item.lowStockThreshold.toString() : ''
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    setSaving(true);
    try {
      const res = await fetch(`/api/inventory/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          unit,
          lowStockThreshold: lowStockThreshold !== '' ? Number(lowStockThreshold) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to update'); return; }
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
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Edit Item</h2>
            <p className="text-sm text-slate-500">{item.category.name}</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="text-sm font-medium text-slate-700">Item Name</label>
            <input
              className="input mt-1 w-full"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          {isConsumable && (
            <div>
              <label className="text-sm font-medium text-slate-700">Unit</label>
              <select
                className="input mt-1 w-full"
                value={unit}
                onChange={e => setUnit(e.target.value)}
              >
                <option value="pcs">pcs (pieces)</option>
                <option value="meters">meters</option>
                <option value="rolls">rolls</option>
                <option value="boxes">boxes</option>
              </select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700">Low Stock Threshold</label>
            <input
              type="number"
              min="0"
              className="input mt-1 w-full"
              placeholder="e.g. 5"
              value={lowStockThreshold}
              onChange={e => setLowStockThreshold(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-400">
              {isConsumable
                ? 'Alert shows when quantity reaches this level.'
                : 'Alert shows when units in stock reach this level.'}
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  );
}
