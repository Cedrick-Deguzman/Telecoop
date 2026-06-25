'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  CornerDownLeft,
  AlertTriangle,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import type { InventoryItem, InventorySerialStatus } from '../types';
import StockInModal from './StockInModal';
import ReleaseModal from './ReleaseModal';
import ReturnModal from './ReturnModal';
import EditItemModal from './EditItemModal';
import MarkDamagedModal from './MarkDamagedModal';

interface Props {
  items: InventoryItem[];
  onRefresh: () => void;
}

const SERIAL_STATUS_STYLES: Record<InventorySerialStatus, string> = {
  in_stock: 'bg-emerald-50 text-emerald-700',
  deployed: 'bg-blue-50 text-blue-700',
  returned: 'bg-amber-50 text-amber-700',
  damaged: 'bg-red-50 text-red-700',
};

const SERIAL_STATUS_LABELS: Record<InventorySerialStatus, string> = {
  in_stock: 'In Stock',
  deployed: 'Deployed',
  returned: 'Returned',
  damaged: 'Damaged',
};

type ModalType = 'stock-in' | 'release' | 'return' | 'edit';

function isLowStock(item: InventoryItem): boolean {
  if (item.lowStockThreshold === null) return false;
  if (item.category.type === 'consumable') return item.quantity <= item.lowStockThreshold;
  const inStock = item.serials?.filter(s => s.status === 'in_stock').length ?? 0;
  return inStock <= item.lowStockThreshold;
}

export default function InventoryTable({ items, onRefresh }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [modal, setModal] = useState<{ type: ModalType; item: InventoryItem } | null>(null);
  const [editingSerialId, setEditingSerialId] = useState<number | null>(null);
  const [serialEdit, setSerialEdit] = useState({ serialNumber: '', macAddress: '' });
  const [serialSaving, setSerialSaving] = useState(false);
  const [serialError, setSerialError] = useState('');
  const [damagedSerial, setDamagedSerial] = useState<{ id: number; serialNumber: string; itemName: string } | null>(null);

  const toggleExpand = (id: number) =>
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const openModal = (type: ModalType, item: InventoryItem) => setModal({ type, item });
  const closeModal = () => setModal(null);

  const startEditSerial = (s: { id: number; serialNumber: string; macAddress: string | null }) => {
    setEditingSerialId(s.id);
    setSerialEdit({ serialNumber: s.serialNumber, macAddress: s.macAddress ?? '' });
    setSerialError('');
  };

  const cancelEditSerial = () => {
    setEditingSerialId(null);
    setSerialError('');
  };

  const saveEditSerial = async (serialId: number) => {
    if (!serialEdit.serialNumber.trim()) { setSerialError('Serial number is required'); return; }
    setSerialSaving(true);
    setSerialError('');
    try {
      const res = await fetch(`/api/inventory/serials/${serialId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialNumber: serialEdit.serialNumber.trim(),
          macAddress: serialEdit.macAddress.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setSerialError(data.error || 'Failed to save'); return; }
      setEditingSerialId(null);
      onRefresh();
    } catch {
      setSerialError('Something went wrong');
    } finally {
      setSerialSaving(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
        No items found.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {items.map(item => {
          const expanded = expandedIds.has(item.id);
          const low = isLowStock(item);
          const isSerialized = item.category.type === 'serialized';
          const inStockCount = isSerialized
            ? (item.serials?.filter(s => s.status === 'in_stock').length ?? 0)
            : null;
          const deployedCount = isSerialized
            ? (item.serials?.filter(s => s.status === 'deployed').length ?? 0)
            : null;

          return (
            <div
              key={item.id}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
            >
              <div className="flex items-center gap-3 px-5 py-4">
                {isSerialized && (
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                  >
                    {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{item.name}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      {item.category.name}
                    </span>
                    {low && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
                        <AlertTriangle size={11} /> Low Stock
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex gap-4 text-sm text-slate-500">
                    {isSerialized ? (
                      <>
                        <span>{inStockCount} in stock</span>
                        <span>{deployedCount} deployed</span>
                        <span>{item.serials?.filter(s => s.status === 'returned').length ?? 0} returned</span>
                      </>
                    ) : (
                      <span>
                        {item.quantity} {item.unit} in stock
                        {item.lowStockThreshold !== null && (
                          <span className="ml-2 text-slate-400">· threshold: {item.lowStockThreshold}</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => openModal('edit', item)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                    title="Edit item"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => openModal('stock-in', item)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                    title="Stock In"
                  >
                    <ArrowDownToLine size={13} /> Stock In
                  </button>
                  <button
                    onClick={() => openModal('release', item)}
                    className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                    title="Release"
                  >
                    <ArrowUpFromLine size={13} /> Release
                  </button>
                  <button
                    onClick={() => openModal('return', item)}
                    className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
                    title="Return"
                  >
                    <CornerDownLeft size={13} /> Return
                  </button>
                </div>
              </div>

              {isSerialized && expanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 px-5 pb-4 pt-3">
                  <div className="space-y-1.5">
                    {(item.serials ?? []).length === 0 ? (
                      <p className="text-sm text-slate-400">No serials registered yet.</p>
                    ) : (
                      item.serials.map(s => {
                        const isEditing = editingSerialId === s.id;
                        return (
                          <div
                            key={s.id}
                            className="rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-sm"
                          >
                            {isEditing ? (
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <input
                                    className="input flex-1 font-mono text-sm"
                                    placeholder="Serial number"
                                    value={serialEdit.serialNumber}
                                    onChange={e => setSerialEdit(p => ({ ...p, serialNumber: e.target.value }))}
                                    autoFocus
                                  />
                                </div>
                                <input
                                  className="input w-full font-mono text-sm"
                                  placeholder="MAC Address (e.g. AA:BB:CC:DD:EE:FF)"
                                  value={serialEdit.macAddress}
                                  onChange={e => setSerialEdit(p => ({ ...p, macAddress: e.target.value }))}
                                />
                                {serialError && (
                                  <p className="text-xs text-red-500">{serialError}</p>
                                )}
                                <div className="flex gap-2 pt-1">
                                  <button
                                    onClick={() => saveEditSerial(s.id)}
                                    disabled={serialSaving}
                                    className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-50"
                                  >
                                    <Check size={12} /> {serialSaving ? 'Saving...' : 'Save'}
                                  </button>
                                  <button
                                    onClick={cancelEditSerial}
                                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                                  >
                                    <X size={12} /> Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <span className="font-mono text-sm text-slate-800">{s.serialNumber}</span>
                                  {s.macAddress && (
                                    <p className="mt-0.5 font-mono text-xs text-slate-400">{s.macAddress}</p>
                                  )}
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                  {s.installation && (
                                    <span className="text-xs text-slate-400">
                                      {s.installation.client?.name ?? s.installation.prospectName ?? `Job #${s.installation.id}`}
                                    </span>
                                  )}
                                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${SERIAL_STATUS_STYLES[s.status]}`}>
                                    {SERIAL_STATUS_LABELS[s.status]}
                                  </span>
                                  <button
                                    onClick={() => startEditSerial(s)}
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                    title="Edit serial"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  {(s.status === 'in_stock' || s.status === 'returned') && (
                                    <button
                                      onClick={() => setDamagedSerial({ id: s.id, serialNumber: s.serialNumber, itemName: item.name })}
                                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                                      title="Mark as damaged"
                                    >
                                      <AlertTriangle size={13} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modal?.type === 'edit' && (
        <EditItemModal item={modal.item} onClose={closeModal} onSuccess={onRefresh} />
      )}
      {damagedSerial && (
        <MarkDamagedModal
          serial={damagedSerial}
          onClose={() => setDamagedSerial(null)}
          onSuccess={() => { setDamagedSerial(null); onRefresh(); }}
        />
      )}
      {modal?.type === 'stock-in' && (
        <StockInModal item={modal.item} onClose={closeModal} onSuccess={onRefresh} />
      )}
      {modal?.type === 'release' && (
        <ReleaseModal item={modal.item} onClose={closeModal} onSuccess={onRefresh} />
      )}
      {modal?.type === 'return' && (
        <ReturnModal item={modal.item} onClose={closeModal} onSuccess={onRefresh} />
      )}
    </>
  );
}
