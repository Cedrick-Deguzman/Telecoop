'use client';

import { Package, AlertTriangle, Wifi, ArrowLeftRight } from 'lucide-react';
import type { InventoryStats } from '../types';

interface Props {
  stats: InventoryStats;
}

export default function InventoryStats({ stats }: Props) {
  const cards = [
    { label: 'Total items', value: stats.totalItems, icon: Package, color: 'text-blue-600' },
    {
      label: 'Low stock',
      value: stats.lowStockCount,
      icon: AlertTriangle,
      color: stats.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-400',
    },
    { label: 'Deployed', value: stats.deployedSerials, icon: Wifi, color: 'text-emerald-600' },
    { label: 'Tx this month', value: stats.transactionsThisMonth, icon: ArrowLeftRight, color: 'text-violet-600' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-sm"
          >
            <Icon size={18} className={`shrink-0 ${card.color}`} />
            <div className="min-w-0">
              <p className="text-lg font-bold leading-none text-slate-900">{card.value}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{card.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
