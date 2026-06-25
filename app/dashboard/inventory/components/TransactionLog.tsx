'use client';

import { useState } from 'react';
import type { InventoryTransaction, InventoryTransactionType } from '../types';

interface Props {
  transactions: InventoryTransaction[];
}

const TYPE_STYLES: Record<InventoryTransactionType, string> = {
  stock_in: 'bg-emerald-50 text-emerald-700',
  release: 'bg-blue-50 text-blue-700',
  return: 'bg-amber-50 text-amber-700',
  usage: 'bg-violet-50 text-violet-700',
  damaged: 'bg-red-50 text-red-700',
};

const TYPE_LABELS: Record<InventoryTransactionType, string> = {
  stock_in: 'Stock In',
  release: 'Release',
  return: 'Return',
  usage: 'Usage',
  damaged: 'Damaged',
};

export default function TransactionLog({ transactions }: Props) {
  const [typeFilter, setTypeFilter] = useState<'all' | InventoryTransactionType>('all');

  const filtered = transactions.filter(
    tx => typeFilter === 'all' || tx.type === typeFilter
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(['all', 'stock_in', 'release', 'return', 'usage', 'damaged'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium capitalize transition ${
              typeFilter === t
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t === 'all' ? 'All' : TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-slate-400">
          No transactions found.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(tx => {
            const installationLabel = tx.installation
              ? tx.installation.client?.name ?? tx.installation.prospectName ?? `Job #${tx.installation.id}`
              : null;

            return (
              <div
                key={tx.id}
                className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm"
              >
                <span
                  className={`mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${TYPE_STYLES[tx.type]}`}
                >
                  {TYPE_LABELS[tx.type]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-semibold text-slate-900">{tx.item.name}</span>
                    <span className="text-xs text-slate-400">{tx.item.category.name}</span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-slate-500">
                    {tx.serial && (
                      <span className="font-mono">{tx.serial.serialNumber}</span>
                    )}
                    {tx.quantity !== null && (
                      <span>{tx.quantity} {tx.item.category.type === 'consumable' ? tx.item.unit : ''}</span>
                    )}
                    {installationLabel && <span>· {installationLabel}</span>}
                    {tx.performedBy && <span>· by {tx.performedBy}</span>}
                    {tx.notes && <span>· {tx.notes}</span>}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {new Date(tx.createdAt).toLocaleDateString('en-PH', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
