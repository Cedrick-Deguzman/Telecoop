'use client';

import { useEffect, useState } from 'react';
import { Plus, Settings2, Search } from 'lucide-react';
import { useInventory } from './hooks/useInventory';
import InventoryStats from './components/InventoryStats';
import InventoryTable from './components/InventoryTable';
import TransactionLog from './components/TransactionLog';
import ManageCategoriesModal from './components/ManageCategoriesModal';
import AddItemModal from './components/AddItemModal';

type Tab = 'serialized' | 'consumables' | 'transactions';

export default function InventoryContainer() {
  const {
    categories,
    transactions,
    loading,
    search,
    setSearch,
    serializedItems,
    consumableItems,
    stats,
    fetchAll,
  } = useInventory();

  const [activeTab, setActiveTab] = useState<Tab>('serialized');
  const [showCategories, setShowCategories] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'serialized', label: 'Serialized Assets', count: serializedItems.length },
    { id: 'consumables', label: 'Consumables', count: consumableItems.length },
    { id: 'transactions', label: 'Transaction Log', count: transactions.length },
  ];

  const currentItems = activeTab === 'serialized' ? serializedItems : consumableItems;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InventoryStats stats={stats} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-64 rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Search items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategories(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Settings2 size={15} /> Categories
          </button>
          <button
            onClick={() => setShowAddItem(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={15} /> Add Item
          </button>
        </div>
      </div>

      <div className="flex gap-1 rounded-2xl border border-slate-200/80 bg-slate-100/60 p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  activeTab === tab.id ? 'bg-slate-100 text-slate-600' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'transactions' ? (
        <TransactionLog transactions={transactions} />
      ) : (
        <InventoryTable items={currentItems} onRefresh={fetchAll} />
      )}

      {showCategories && (
        <ManageCategoriesModal
          categories={categories}
          onClose={() => setShowCategories(false)}
          onSuccess={fetchAll}
        />
      )}

      {showAddItem && (
        <AddItemModal
          categories={categories}
          onClose={() => setShowAddItem(false)}
          onSuccess={fetchAll}
        />
      )}
    </div>
  );
}
