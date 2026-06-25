'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { InventoryCategory } from '../types';
import { ModalPortal } from '@/app/components/ui/ModalPortal';

interface Props {
  categories: InventoryCategory[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddItemModal({ categories, onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [lowStockThreshold, setLowStockThreshold] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedCategory = categories.find(c => c.id === Number(categoryId));
  const isConsumable = selectedCategory?.type === 'consumable';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          categoryId: Number(categoryId),
          unit,
          lowStockThreshold: lowStockThreshold || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create item'); return; }
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
          <h2 className="text-lg font-semibold text-slate-900">Add Inventory Item</h2>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="text-sm font-medium text-slate-700">Item Name</label>
            <input
              className="input mt-1 w-full"
              placeholder="e.g. Huawei HG8310M ONU"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select
              className="input mt-1 w-full"
              value={categoryId}
              onChange={e => {
                setCategoryId(e.target.value);
                const cat = categories.find(c => c.id === Number(e.target.value));
                setUnit(cat?.type === 'consumable' ? 'pcs' : 'pcs');
              }}
              required
            >
              <option value="">Select category</option>
              <optgroup label="Serialized Assets">
                {categories.filter(c => c.type === 'serialized').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </optgroup>
              <optgroup label="Consumables">
                {categories.filter(c => c.type === 'consumable').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </optgroup>
            </select>
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
            <label className="text-sm font-medium text-slate-700">Low Stock Threshold (optional)</label>
            <input
              type="number"
              min="0"
              className="input mt-1 w-full"
              placeholder={isConsumable ? 'e.g. 50' : 'e.g. 2'}
              value={lowStockThreshold}
              onChange={e => setLowStockThreshold(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-400">
              Alert will show when stock reaches this level.
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  );
}
