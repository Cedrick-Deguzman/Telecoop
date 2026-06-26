'use client';

import { ChevronRight, AlertTriangle } from 'lucide-react';
import type { InventoryItem } from '../types';

interface Props {
  items: InventoryItem[];
  selectedId: number | null;
  onSelect: (item: InventoryItem) => void;
}

function isLowStock(item: InventoryItem): boolean {
  if (item.lowStockThreshold === null) return false;
  if (item.category.type === 'consumable') return item.quantity <= item.lowStockThreshold;
  const inStock = item.serials?.filter(s => s.status === 'in_stock').length ?? 0;
  return inStock <= item.lowStockThreshold;
}

// Photo coverage for an item: serialized = units with ≥1 photo / total units; consumable = photo count.
function coverage(item: InventoryItem): { pct: number; label: string; tone: string } {
  if (item.category.type === 'serialized') {
    const total = item.serials?.length ?? 0;
    const withPhotos = item.serials?.filter(s => (s.photos?.length ?? 0) > 0).length ?? 0;
    const pct = total === 0 ? 0 : Math.round((withPhotos / total) * 100);
    const tone = total === 0 ? 'bg-slate-300' : pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
    return { pct, label: total === 0 ? 'No units' : `${withPhotos} of ${total} units`, tone };
  }
  const n = item.photos?.length ?? 0;
  return { pct: n > 0 ? 100 : 0, label: n > 0 ? `${n} photo${n > 1 ? 's' : ''}` : 'No photos', tone: n > 0 ? 'bg-emerald-500' : 'bg-slate-300' };
}

export default function ItemsTable({ items, selectedId, onSelect }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
        No items found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
      <div className="grid grid-cols-[1fr_120px_150px_28px] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-500">
        <span>Item</span>
        <span>Stock</span>
        <span>Photo coverage</span>
        <span />
      </div>

      {items.map(item => {
        const isSerialized = item.category.type === 'serialized';
        const inStock = item.serials?.filter(s => s.status === 'in_stock').length ?? 0;
        const deployed = item.serials?.filter(s => s.status === 'deployed').length ?? 0;
        const low = isLowStock(item);
        const cov = coverage(item);
        const selected = selectedId === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={`grid w-full grid-cols-[1fr_120px_150px_28px] items-center gap-3 border-t border-slate-100 px-4 py-3 text-left transition first:border-t-0 hover:bg-slate-50 ${selected ? 'bg-indigo-50/60' : ''}`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium text-slate-900">{item.name}</span>
                {low && (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
                    <AlertTriangle size={11} /> Low
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-slate-500">{item.category.name}</p>
            </div>

            <div className={`text-sm ${low ? 'text-amber-600' : 'text-slate-700'}`}>
              {isSerialized ? (
                <span>{inStock} in · {deployed} out</span>
              ) : (
                <span>{item.quantity} {item.unit}</span>
              )}
            </div>

            <div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full ${cov.tone}`} style={{ width: `${cov.pct}%` }} />
              </div>
              <p className="mt-1 text-xs text-slate-500">{cov.label}</p>
            </div>

            <ChevronRight size={16} className="text-slate-300" />
          </button>
        );
      })}
    </div>
  );
}
