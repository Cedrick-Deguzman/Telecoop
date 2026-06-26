export type InventoryItemType = 'serialized' | 'consumable';

export type InventorySerialStatus = 'in_stock' | 'deployed' | 'returned' | 'damaged';

export type InventoryTransactionType = 'stock_in' | 'release' | 'return' | 'usage' | 'damaged';

export interface InventoryCategory {
  id: number;
  name: string;
  type: InventoryItemType;
  createdAt: string;
  updatedAt: string;
}

export interface InventorySerial {
  id: number;
  itemId: number;
  serialNumber: string;
  macAddress: string | null;
  status: InventorySerialStatus;
  installationId: number | null;
  installation: { id: number; prospectName: string | null; client: { name: string } | null } | null;
  photos?: InventoryPhoto[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryPhoto {
  id: number;
  url: string;
  publicId: string;
  category: string;
  caption: string | null;
  createdAt: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  categoryId: number;
  category: InventoryCategory;
  unit: string;
  quantity: number;
  lowStockThreshold: number | null;
  createdAt: string;
  updatedAt: string;
  serials: InventorySerial[];
  photos?: InventoryPhoto[];
  _count?: { serials: number };
}

export interface InventoryTransaction {
  id: number;
  itemId: number;
  item: { id: number; name: string; unit: string; category: { name: string; type: InventoryItemType } };
  type: InventoryTransactionType;
  quantity: number | null;
  serialId: number | null;
  serial: { id: number; serialNumber: string } | null;
  installationId: number | null;
  installation: { id: number; prospectName: string | null; client: { name: string } | null } | null;
  notes: string | null;
  performedBy: string | null;
  createdAt: string;
}

export interface InventoryStats {
  totalItems: number;
  lowStockCount: number;
  deployedSerials: number;
  transactionsThisMonth: number;
}
