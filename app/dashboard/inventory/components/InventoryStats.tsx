'use client';

import { Package, AlertTriangle, Wifi, ArrowLeftRight } from 'lucide-react';
import type { InventoryStats } from '../types';

interface Props {
  stats: InventoryStats;
}

export default function InventoryStats({ stats }: Props) {
  const cards = [
    {
      label: 'Total Items',
      value: stats.totalItems,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Low Stock Alerts',
      value: stats.lowStockCount,
      icon: AlertTriangle,
      color: stats.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-400',
      bg: stats.lowStockCount > 0 ? 'bg-amber-50' : 'bg-slate-50',
    },
    {
      label: 'Deployed Assets',
      value: stats.deployedSerials,
      icon: Wifi,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Transactions This Month',
      value: stats.transactionsThisMonth,
      icon: ArrowLeftRight,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200/80 bg-white/75 p-5 shadow-sm"
          >
            <div className={`inline-flex rounded-xl p-2.5 ${card.bg}`}>
              <Icon size={20} className={card.color} />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="mt-0.5 text-sm text-slate-500">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}
