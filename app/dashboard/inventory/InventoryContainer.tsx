'use client';

import { useEffect, useState } from 'react';
import { Plus, Settings2, Search } from 'lucide-react';
import { useInventory } from './hooks/useInventory';
import InventoryStats from './components/InventoryStats';
import ItemsTable from './components/ItemsTable';
import ItemDetailDrawer from './components/ItemDetailDrawer';
import TransactionLog from './components/TransactionLog';
import ManageCategoriesModal from './components/ManageCategoriesModal';
import AddItemModal from './components/AddItemModal';

type MainTab = 'items' | 'transactions';
type Segment = 'serialized' | 'consumables';

export default function InventoryContainer() {
  const {
    items,
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

  const [mainTab, setMainTab] = useState<MainTab>('items');
  const [segment, setSegment] = useState<Segment>('serialized');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const currentItems = segment === 'serialized' ? serializedItems : consumableItems;
  const selectedItem = selectedId !== null ? items.find(i => i.id === selectedId) ?? null : null;

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <InventoryStats stats={stats} />

      {/* Main tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200">
        <div className="flex gap-1">
          {([['items', 'Items'], ['transactions', 'Transaction Log']] as [MainTab, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setMainTab(id)}
              className={`relative px-4 py-2.5 text-sm font-medium transition ${
                mainTab === id ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
              <span className="ml-1.5 text-xs text-slate-400">
                {id === 'items' ? items.length : transactions.length}
              </span>
              {mainTab === id && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-slate-900" />}
            </button>
          ))}
        </div>
      </div>

      {mainTab === 'transactions' ? (
        <TransactionLog transactions={transactions} />
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 sm:max-w-xs">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Search item, serial, MAC…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <div className="flex rounded-xl bg-slate-100 p-1">
                {([['serialized', 'Serialized', serializedItems.length], ['consumables', 'Consumables', consumableItems.length]] as [Segment, string, number][]).map(([id, label, count]) => (
                  <button
                    key={id}
                    onClick={() => setSegment(id)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      segment === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {label} <span className="text-xs text-slate-400">{count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCategories(true)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <Settings2 size={15} /> Categories
              </button>
              <button onClick={() => setShowAddItem(true)} className="btn-primary flex items-center gap-2">
                <Plus size={15} /> Add Item
              </button>
            </div>
          </div>

          <ItemsTable items={currentItems} selectedId={selectedId} onSelect={i => setSelectedId(i.id)} />
        </>
      )}

      {selectedItem && (
        <ItemDetailDrawer
          item={selectedItem}
          onClose={() => setSelectedId(null)}
          onRefresh={fetchAll}
        />
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
