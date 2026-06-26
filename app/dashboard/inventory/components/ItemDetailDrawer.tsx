'use client';

import { useState } from 'react';
import {
  X, Pencil, Check, AlertTriangle, Camera, ImageOff,
  ArrowDownToLine, ArrowUpFromLine, CornerDownLeft,
} from 'lucide-react';
import type { InventoryItem, InventorySerialStatus, InventoryPhoto } from '../types';
import { ModalPortal } from '@/app/components/ui/ModalPortal';
import PhotoUploader, { type RecordPhoto } from '@/app/components/PhotoUploader';
import PhotoLightbox, { type LightboxPhoto } from '@/app/components/PhotoLightbox';
import StockInModal from './StockInModal';
import ReleaseModal from './ReleaseModal';
import ReturnModal from './ReturnModal';
import EditItemModal from './EditItemModal';
import MarkDamagedModal from './MarkDamagedModal';

interface Props {
  item: InventoryItem;
  onClose: () => void;
  onRefresh: () => void;
}

type ModalType = 'stock-in' | 'release' | 'return' | 'edit';
type StatusFilter = 'all' | InventorySerialStatus;

const STATUS_STYLES: Record<InventorySerialStatus, string> = {
  in_stock: 'bg-emerald-50 text-emerald-700',
  deployed: 'bg-blue-50 text-blue-700',
  returned: 'bg-amber-50 text-amber-700',
  damaged: 'bg-red-50 text-red-700',
};
const STATUS_LABELS: Record<InventorySerialStatus, string> = {
  in_stock: 'In Stock', deployed: 'Deployed', returned: 'Returned', damaged: 'Damaged',
};
const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'in_stock', label: 'In Stock' },
  { id: 'deployed', label: 'Deployed' },
  { id: 'returned', label: 'Returned' },
  { id: 'damaged', label: 'Damaged' },
];

export default function ItemDetailDrawer({ item, onClose, onRefresh }: Props) {
  const isSerialized = item.category.type === 'serialized';
  const serials = item.serials ?? [];
  const inStock = serials.filter(s => s.status === 'in_stock').length;
  const deployed = serials.filter(s => s.status === 'deployed').length;

  const [modal, setModal] = useState<ModalType | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [editingSerialId, setEditingSerialId] = useState<number | null>(null);
  const [serialEdit, setSerialEdit] = useState({ serialNumber: '', macAddress: '' });
  const [serialSaving, setSerialSaving] = useState(false);
  const [serialError, setSerialError] = useState('');
  const [damagedSerial, setDamagedSerial] = useState<{ id: number; serialNumber: string; itemName: string } | null>(null);
  const [photoSerialId, setPhotoSerialId] = useState<number | null>(null);
  const [serialPhotos, setSerialPhotos] = useState<Record<number, RecordPhoto[]>>({});
  const [itemPhotos, setItemPhotos] = useState<InventoryPhoto[]>(item.photos ?? []);
  const [viewer, setViewer] = useState<{ photos: LightboxPhoto[]; index: number } | null>(null);

  const photosFor = (serialId: number, fallback: InventoryPhoto[] | undefined): RecordPhoto[] =>
    serialPhotos[serialId] ?? (fallback as RecordPhoto[] | undefined) ?? [];

  const startEditSerial = (s: { id: number; serialNumber: string; macAddress: string | null }) => {
    setEditingSerialId(s.id);
    setSerialEdit({ serialNumber: s.serialNumber, macAddress: s.macAddress ?? '' });
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
        body: JSON.stringify({ serialNumber: serialEdit.serialNumber.trim(), macAddress: serialEdit.macAddress.trim() || null }),
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

  const filteredSerials = statusFilter === 'all' ? serials : serials.filter(s => s.status === statusFilter);

  return (
    <ModalPortal>
      <div onClick={onClose} className="fixed inset-0 z-40 flex justify-end bg-black/40">
        <div
          onClick={e => e.stopPropagation()}
          className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-slate-900">{item.name}</h2>
                <p className="text-sm text-slate-500">
                  {item.category.name}
                  {isSerialized
                    ? <> · {inStock} in stock · {deployed} deployed</>
                    : <> · {item.quantity} {item.unit} in stock</>}
                </p>
              </div>
              <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {/* Actions */}
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => setModal('stock-in')} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                <ArrowDownToLine size={13} /> Stock In
              </button>
              <button onClick={() => setModal('release')} className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100">
                <ArrowUpFromLine size={13} /> Release
              </button>
              <button onClick={() => setModal('return')} className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100">
                <CornerDownLeft size={13} /> Return
              </button>
              <button onClick={() => setModal('edit')} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                <Pencil size={13} /> Edit
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {isSerialized ? (
              <div className="space-y-3">
                {/* Status filter */}
                <div className="flex flex-wrap gap-1.5">
                  {FILTERS.map(f => {
                    const count = f.id === 'all' ? serials.length : serials.filter(s => s.status === f.id).length;
                    const active = statusFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setStatusFilter(f.id)}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {f.label} {count > 0 && <span className={active ? 'text-white/70' : 'text-slate-400'}>{count}</span>}
                      </button>
                    );
                  })}
                </div>

                {filteredSerials.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">No units in this view.</p>
                ) : (
                  <div className="space-y-2">
                    {filteredSerials.map(s => {
                      const isEditing = editingSerialId === s.id;
                      const ph = photosFor(s.id, s.photos);
                      return (
                        <div key={s.id} className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-sm">
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                className="input w-full font-mono text-sm"
                                placeholder="Serial number"
                                value={serialEdit.serialNumber}
                                onChange={e => setSerialEdit(p => ({ ...p, serialNumber: e.target.value }))}
                                autoFocus
                              />
                              <input
                                className="input w-full font-mono text-sm"
                                placeholder="MAC Address"
                                value={serialEdit.macAddress}
                                onChange={e => setSerialEdit(p => ({ ...p, macAddress: e.target.value }))}
                              />
                              {serialError && <p className="text-xs text-red-500">{serialError}</p>}
                              <div className="flex gap-2">
                                <button onClick={() => saveEditSerial(s.id)} disabled={serialSaving} className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-50">
                                  <Check size={12} /> {serialSaving ? 'Saving...' : 'Save'}
                                </button>
                                <button onClick={() => setEditingSerialId(null)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="min-w-0 flex-1">
                                  <p className="font-mono text-sm text-slate-800">{s.serialNumber}</p>
                                  {s.macAddress && <p className="mt-0.5 font-mono text-xs text-slate-400">{s.macAddress}</p>}
                                  {s.installation && (
                                    <p className="mt-0.5 text-xs text-slate-400">
                                      {s.installation.client?.name ?? s.installation.prospectName ?? `Job #${s.installation.id}`}
                                    </p>
                                  )}
                                </div>

                                {/* Thumbnail strip → lightbox */}
                                {ph.length > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => setViewer({ photos: ph, index: 0 })}
                                    className="flex shrink-0 -space-x-2"
                                    aria-label="View photos"
                                  >
                                    {ph.slice(0, 2).map(p => (
                                      <img key={p.id} src={p.url} alt="" className="h-9 w-9 rounded-md border-2 border-white object-cover ring-1 ring-slate-200" />
                                    ))}
                                    {ph.length > 2 && (
                                      <span className="flex h-9 w-9 items-center justify-center rounded-md border-2 border-white bg-slate-100 text-xs font-medium text-slate-500 ring-1 ring-slate-200">+{ph.length - 2}</span>
                                    )}
                                  </button>
                                ) : (
                                  <span className="flex shrink-0 items-center gap-1 text-xs text-slate-300">
                                    <ImageOff size={14} /> No photo
                                  </span>
                                )}

                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[s.status]}`}>
                                  {STATUS_LABELS[s.status]}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setPhotoSerialId(photoSerialId === s.id ? null : s.id)}
                                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ${photoSerialId === s.id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                                >
                                  <Camera size={12} /> Manage photos
                                </button>
                                <button onClick={() => startEditSerial(s)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Edit serial">
                                  <Pencil size={13} />
                                </button>
                                {(s.status === 'in_stock' || s.status === 'returned') && (
                                  <button onClick={() => setDamagedSerial({ id: s.id, serialNumber: s.serialNumber, itemName: item.name })} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500" title="Mark as damaged">
                                    <AlertTriangle size={13} />
                                  </button>
                                )}
                              </div>

                              {photoSerialId === s.id && (
                                <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2">
                                  <PhotoUploader
                                    recordType="inventorySerial"
                                    recordId={s.id}
                                    photos={ph}
                                    onChange={next => setSerialPhotos(prev => ({ ...prev, [s.id]: next }))}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Item Photos</p>
                <PhotoUploader
                  recordType="inventory"
                  recordId={item.id}
                  photos={itemPhotos as RecordPhoto[]}
                  onChange={next => setItemPhotos(next as InventoryPhoto[])}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {viewer && (
        <PhotoLightbox
          photos={viewer.photos}
          index={viewer.index}
          onIndexChange={i => setViewer(v => (v ? { ...v, index: i } : v))}
          onClose={() => setViewer(null)}
          title={item.name}
        />
      )}

      {modal === 'stock-in' && <StockInModal item={item} onClose={() => setModal(null)} onSuccess={onRefresh} />}
      {modal === 'release' && <ReleaseModal item={item} onClose={() => setModal(null)} onSuccess={onRefresh} />}
      {modal === 'return' && <ReturnModal item={item} onClose={() => setModal(null)} onSuccess={onRefresh} />}
      {modal === 'edit' && <EditItemModal item={item} onClose={() => setModal(null)} onSuccess={onRefresh} />}
      {damagedSerial && (
        <MarkDamagedModal
          serial={damagedSerial}
          onClose={() => setDamagedSerial(null)}
          onSuccess={() => { setDamagedSerial(null); onRefresh(); }}
        />
      )}
    </ModalPortal>
  );
}
