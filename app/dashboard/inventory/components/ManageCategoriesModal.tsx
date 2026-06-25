'use client';

import { useState } from 'react';
import { X, Plus, Pencil, Trash2, Check } from 'lucide-react';
import type { InventoryCategory, InventoryItemType } from '../types';
import { ModalPortal } from '@/app/components/ui/ModalPortal';

interface Props {
  categories: InventoryCategory[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ManageCategoriesModal({ categories, onClose, onSuccess }: Props) {
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<InventoryItemType>('consumable');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/inventory/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), type: newType }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      setNewName('');
      onSuccess();
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleRename = async (id: number) => {
    if (!editName.trim()) return;
    setError('');
    try {
      const res = await fetch(`/api/inventory/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      setEditingId(null);
      onSuccess();
    } catch {
      setError('Something went wrong');
    }
  };

  const handleDelete = async (id: number) => {
    setError('');
    try {
      const res = await fetch(`/api/inventory/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      onSuccess();
    } catch {
      setError('Something went wrong');
    }
  };

  const serialized = categories.filter(c => c.type === 'serialized');
  const consumable = categories.filter(c => c.type === 'consumable');

  const renderList = (cats: InventoryCategory[], label: string) => (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      {cats.map(cat => (
        <div
          key={cat.id}
          className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
        >
          {editingId === cat.id ? (
            <input
              className="input flex-1 py-1 text-sm"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRename(cat.id)}
              autoFocus
            />
          ) : (
            <span className="flex-1 text-sm text-slate-800">{cat.name}</span>
          )}
          <div className="flex gap-1">
            {editingId === cat.id ? (
              <button
                onClick={() => handleRename(cat.id)}
                className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
              >
                <Check size={14} />
              </button>
            ) : (
              <button
                onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-slate-800"
              >
                <Pencil size={14} />
              </button>
            )}
            <button
              onClick={() => handleDelete(cat.id)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
              title="Delete (only if no items)"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">Manage Categories</h2>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[40vh] space-y-4 overflow-y-auto p-6 pb-2">
          {renderList(serialized, 'Serialized Assets')}
          {renderList(consumable, 'Consumables')}
        </div>

        <div className="border-t border-slate-100 p-6 pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Add New Category</p>
          {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
          <form onSubmit={handleAdd} className="space-y-3">
            <input
              className="input w-full"
              placeholder="Category name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
            <div className="flex gap-2">
              {(['serialized', 'consumable'] as InventoryItemType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNewType(t)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium capitalize transition ${
                    newType === t
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={saving || !newName.trim()}
              className="btn-primary flex w-full items-center justify-center gap-2"
            >
              <Plus size={16} /> Add Category
            </button>
          </form>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
