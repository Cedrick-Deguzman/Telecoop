'use client';

import { useState, useCallback } from 'react';
import type {
  InventoryItem,
  InventoryCategory,
  InventoryTransaction,
  InventoryStats,
} from '../types';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'serialized' | 'consumable'>('all');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, catsRes, txRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/inventory/categories'),
        fetch('/api/inventory/transactions'),
      ]);
      const [itemsData, catsData, txData] = await Promise.all([
        itemsRes.json(),
        catsRes.json(),
        txRes.json(),
      ]);
      setItems(itemsData);
      setCategories(catsData);
      setTransactions(txData);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredItems = items.filter(item => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || item.category.type === typeFilter;
    return matchSearch && matchType;
  });

  const serializedItems = filteredItems.filter(i => i.category.type === 'serialized');
  const consumableItems = filteredItems.filter(i => i.category.type === 'consumable');

  const stats: InventoryStats = (() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const deployedSerials = items.reduce((acc, item) => {
      return acc + (item.serials?.filter(s => s.status === 'deployed').length ?? 0);
    }, 0);

    const lowStockCount = items.filter(item => {
      if (item.category.type === 'consumable' && item.lowStockThreshold !== null) {
        return item.quantity <= item.lowStockThreshold;
      }
      if (item.category.type === 'serialized') {
        const inStock = item.serials?.filter(s => s.status === 'in_stock').length ?? 0;
        return item.lowStockThreshold !== null && inStock <= item.lowStockThreshold;
      }
      return false;
    });

    const transactionsThisMonth = transactions.filter(
      tx => new Date(tx.createdAt) >= startOfMonth
    ).length;

    return {
      totalItems: items.length,
      lowStockCount: lowStockCount.length,
      deployedSerials,
      transactionsThisMonth,
    };
  })();

  return {
    items,
    categories,
    transactions,
    loading,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    filteredItems,
    serializedItems,
    consumableItems,
    stats,
    fetchAll,
    setItems,
    setCategories,
  };
}
