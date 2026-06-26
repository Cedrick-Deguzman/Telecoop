'use client';
import { ModalPortal } from '@/app/components/ui/ModalPortal';
import { useState, useEffect, type FormEvent } from 'react';
import { X, LoaderCircle, CheckCircle2, Package, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { Installation, InstallationStatus, InstallationMaterialUsage, TechnicianOption, NapboxOption, InstallationPhoto, PHOTO_CATEGORIES } from '../types';
import { compressImage } from '@/lib/compressImage';

interface Props {
  installation: Installation | null;
  technicians: TechnicianOption[];
  napboxes: NapboxOption[];
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS: { value: InstallationStatus; label: string }[] = [
  { value: 'pending',   label: 'Pending' },
  { value: 'assigned',  label: 'Assigned' },
  { value: 'ongoing',   label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const SectionHeader = ({ title }: { title: string }) => (
  <div className="border-t border-slate-100 pt-4">
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">{title}</p>
  </div>
);

export function AddEditInstallationModal({ installation, technicians, napboxes, onClose, onSuccess }: Props) {
  const isEdit = !!installation;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingMaterials, setIsSubmittingMaterials] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [matErrors, setMatErrors] = useState<string[]>([]);

  const buildUsageMap = (inst: typeof installation): Record<number, string> => {
    const map: Record<number, string> = {};
    for (const u of inst?.materialUsages ?? []) {
      map[u.inventoryItemId] = u.quantity.toString();
    }
    return map;
  };
  const [localMaterialUsages, setLocalMaterialUsages] = useState<InstallationMaterialUsage[]>(
    installation?.materialUsages ?? []
  );
  const [matUsages, setMatUsages] = useState<Record<number, string>>(() => buildUsageMap(installation));
  const [consumableItems, setConsumableItems] = useState<Array<{ id: number; name: string; unit: string; quantity: number; category: { name: string } }>>([]);
  const [inventoryLoaded, setInventoryLoaded] = useState(false);

  const [localPhotos, setLocalPhotos] = useState<InstallationPhoto[]>(installation?.photos ?? []);
  const [categoryUpload, setCategoryUpload] = useState<Record<string, { show: boolean; staged: { file: File; caption: string; preview: string }[]; uploading: boolean }>>({});
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [onuSerials, setOnuSerials] = useState<{ id: number; serialNumber: string; macAddress: string | null; item: { name: string } }[]>([]);
  const [routerSerials, setRouterSerials] = useState<{ id: number; serialNumber: string; macAddress: string | null; item: { name: string } }[]>([]);

  const [form, setForm] = useState({
    // Prospect / job info
    prospectName: '',
    prospectPhone: '',
    prospectAddress: '',
    technicianId: '',
    scheduledDate: '',
    completedDate: '',
    status: 'pending' as InstallationStatus,
    notes: '',
    // Fiber
    napboxId: '',
    portNumber: '',
    fiberCore: '',
    dropCableLength: '',
    // Device
    onuSerial: '',
    routerSerial: '',
    macAddress: '',
    // Signal
    rxReading: '',
    txReading: '',
    // GPS
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    const map = buildUsageMap(installation);
    setLocalMaterialUsages(installation?.materialUsages ?? []);
    setMatUsages(map);
    setLocalPhotos(installation?.photos ?? []);
    setCategoryUpload({});
    setPhotoError(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installation]);

  useEffect(() => {
    if (installation) {
      setForm({
        prospectName:    installation.prospectName ?? '',
        prospectPhone:   installation.prospectPhone ?? '',
        prospectAddress: installation.prospectAddress ?? '',
        technicianId:    installation.technicianId?.toString() ?? '',
        scheduledDate:   installation.scheduledDate ? installation.scheduledDate.slice(0, 10) : '',
        completedDate:   installation.completedDate ? installation.completedDate.slice(0, 10) : '',
        status:          installation.status,
        notes:           installation.notes ?? '',
        napboxId:        installation.napboxId?.toString() ?? '',
        portNumber:      installation.portNumber?.toString() ?? '',
        fiberCore:       installation.fiberCore ?? '',
        dropCableLength: installation.dropCableLength?.toString() ?? '',
        onuSerial:       installation.onuSerial ?? '',
        routerSerial:    installation.routerSerial ?? '',
        macAddress:      installation.macAddress ?? '',
        rxReading:       installation.rxReading?.toString() ?? '',
        txReading:       installation.txReading?.toString() ?? '',
        latitude:        installation.latitude?.toString() ?? '',
        longitude:       installation.longitude?.toString() ?? '',
      });
    }
  }, [installation]);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const [serialsRes, itemsRes] = await Promise.all([
          fetch('/api/inventory/serials?status=in_stock'),
          fetch('/api/inventory'),
        ]);
        const [serialsData, itemsData] = await Promise.all([
          serialsRes.json(),
          itemsRes.json(),
        ]);
        type SerialEntry = { id: number; serialNumber: string; macAddress: string | null; item: { name: string; category: { name: string } } };
        setOnuSerials(serialsData.filter((s: SerialEntry) => s.item?.category?.name === 'Modem-Router'));
        setRouterSerials(serialsData.filter((s: SerialEntry) => s.item?.category?.name === 'Router'));
        type ItemEntry = { id: number; name: string; unit: string; quantity: number; category: { type: string; name: string } };
        setConsumableItems(
          (itemsData as ItemEntry[])
            .filter(item => item.category?.type === 'consumable')
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      } catch {
        // inventory hints are non-blocking — fail silently
      } finally {
        setInventoryLoaded(true);
      }
    };
    fetchInventory();
  }, []);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const selectedNapbox = napboxes.find(n => n.id === Number(form.napboxId));
  const availablePorts = selectedNapbox
    ? selectedNapbox.ports.filter(p => p.status === 'available')
    : [];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFormErrors([]);

    // Basic required fields
    const basicErrors: string[] = [];
    if (!form.prospectName.trim()) basicErrors.push('Prospect name is required.');
    if (!form.scheduledDate) basicErrors.push('Scheduled date is required.');
    if (basicErrors.length > 0) { setFormErrors(basicErrors); return; }

    // Business rules per status
    if ((form.status === 'assigned' || form.status === 'ongoing') && !form.technicianId) {
      setFormErrors([`A technician must be assigned before setting the status to ${form.status === 'assigned' ? 'Assigned' : 'Ongoing'}.`]);
      return;
    }
    if (form.status === 'completed') {
      const blocking: string[] = [];
      if (!form.technicianId) blocking.push('A technician must be assigned before marking this job as Completed.');
      if (!form.completedDate) blocking.push('Completed date is required when marking this job as Completed.');
      const REQUIRED_MATERIAL_CATEGORIES = ['Drop Cable', 'SC Connector'];
      for (const cat of REQUIRED_MATERIAL_CATEGORIES) {
        const item = consumableItems.find(i => i.category.name === cat);
        if (!item) continue;
        const savedQty = localMaterialUsages.find(u => u.inventoryItemId === item.id)?.quantity ?? 0;
        const enteredQty = Number(matUsages[item.id] ?? 0);
        if (savedQty <= 0 && enteredQty <= 0) {
          blocking.push(`${cat} quantity is required before marking as Completed.`);
        }
      }
      // Check all 8 photo categories have at least 1 uploaded or staged photo
      const coveredCategories = new Set([
        ...localPhotos.map(p => p.category),
        ...Object.entries(categoryUpload).filter(([, s]) => s.staged?.length > 0).map(([c]) => c),
      ]);
      const missingPhotoCategories = PHOTO_CATEGORIES.filter(c => !coveredCategories.has(c));
      if (missingPhotoCategories.length > 0) blocking.push(`Missing required photos for: ${missingPhotoCategories.join(', ')}.`);
      if (blocking.length > 0) { setFormErrors(blocking); return; }
    }

    setIsSubmitting(true);
    try {
      // Auto-submit material usages if any quantities are entered
      if (isEdit && installation?.id) {
        const usages = Object.entries(matUsages)
          .filter(([, qty]) => Number(qty) > 0)
          .map(([itemId, qty]) => ({ inventoryItemId: Number(itemId), quantity: Number(qty) }));
        if (usages.length > 0) {
          const matRes = await fetch(`/api/installations/${installation.id}/material-usage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usages }),
          });
          if (!matRes.ok) {
            const d = await matRes.json();
            setFormErrors([d.error || 'Failed to submit materials.']);
            return;
          }
          const matData = await matRes.json();
          setLocalMaterialUsages(matData);
        }
      }

      // Upload all staged photos
      if (isEdit && installation?.id) {
        const stagedEntries = Object.entries(categoryUpload).filter(([, s]) => s.staged?.length > 0);
        if (stagedEntries.length > 0) {
          try {
            const allUploaded = await Promise.all(
              stagedEntries.flatMap(([category, state]) =>
                state.staged.map(async ({ file, caption }) => {
                  const compressed = await compressImage(file);
                  const fd = new FormData();
                  fd.append('file', compressed);
                  fd.append('recordType', 'installation');
                  fd.append('recordId', String(installation.id));
                  fd.append('category', category);
                  fd.append('caption', caption);
                  const res = await fetch('/api/photos', { method: 'POST', body: fd });
                  if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Photo upload failed'); }
                  return res.json() as Promise<InstallationPhoto>;
                })
              )
            );
            stagedEntries.forEach(([, s]) => s.staged.forEach(p => URL.revokeObjectURL(p.preview)));
            setLocalPhotos(prev => [...prev, ...allUploaded]);
            setCategoryUpload({});
          } catch (err) {
            setFormErrors([err instanceof Error ? err.message : 'Failed to upload photos. Please try again.']);
            return;
          }
        }
      }

      // Skip job save if editing and nothing changed
      if (isEdit && installation) {
        const i = installation;
        const jobUnchanged =
          form.prospectName    === (i.prospectName    ?? '')                        &&
          form.prospectPhone   === (i.prospectPhone   ?? '')                        &&
          form.prospectAddress === (i.prospectAddress ?? '')                        &&
          form.technicianId    === (i.technicianId?.toString()    ?? '')            &&
          form.scheduledDate   === (i.scheduledDate   ? i.scheduledDate.slice(0, 10)  : '') &&
          form.completedDate   === (i.completedDate   ? i.completedDate.slice(0, 10)  : '') &&
          form.status          === i.status                                         &&
          form.notes           === (i.notes           ?? '')                        &&
          form.napboxId        === (i.napboxId?.toString()        ?? '')            &&
          form.portNumber      === (i.portNumber?.toString()      ?? '')            &&
          form.fiberCore       === (i.fiberCore       ?? '')                        &&
          form.dropCableLength === (i.dropCableLength?.toString() ?? '')            &&
          form.onuSerial       === (i.onuSerial       ?? '')                        &&
          form.routerSerial    === (i.routerSerial    ?? '')                        &&
          form.macAddress      === (i.macAddress      ?? '')                        &&
          form.rxReading       === (i.rxReading?.toString()       ?? '')            &&
          form.txReading       === (i.txReading?.toString()       ?? '')            &&
          form.latitude        === (i.latitude?.toString()        ?? '')            &&
          form.longitude       === (i.longitude?.toString()       ?? '');
        if (jobUnchanged) { onSuccess(); onClose(); return; }
      }

      // Save job
      const url = isEdit ? `/api/installations/${installation!.id}` : '/api/installations';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectName:    form.prospectName,
          prospectPhone:   form.prospectPhone || null,
          prospectAddress: form.prospectAddress || null,
          technicianId:    form.technicianId ? Number(form.technicianId) : null,
          scheduledDate:   form.scheduledDate || null,
          completedDate:   form.completedDate || null,
          status:          form.status,
          notes:           form.notes || null,
          napboxId:        form.napboxId ? Number(form.napboxId) : null,
          portNumber:      form.portNumber ? Number(form.portNumber) : null,
          fiberCore:       form.fiberCore || null,
          dropCableLength: form.dropCableLength !== '' ? Number(form.dropCableLength) : null,
          onuSerial:       form.onuSerial || null,
          routerSerial:    form.routerSerial || null,
          macAddress:      form.macAddress || null,
          rxReading:       form.rxReading !== '' ? Number(form.rxReading) : null,
          txReading:       form.txReading !== '' ? Number(form.txReading) : null,
          latitude:        form.latitude !== '' ? Number(form.latitude) : null,
          longitude:       form.longitude !== '' ? Number(form.longitude) : null,
        }),
      });
      if (!res.ok) { const d = await res.json(); setFormErrors([d.error || 'Failed to save. Please try again.']); return; }
      onSuccess();
      onClose();
    } catch { setFormErrors(['Something went wrong. Please try again.']); }
    finally { setIsSubmitting(false); }
  };

  const handleSubmitMaterials = async () => {
    if (!installation?.id || isSubmittingMaterials) return;

    const allowedStatuses = ['ongoing', 'completed'];
    if (!allowedStatuses.includes(installation.status) && !allowedStatuses.includes(form.status)) {
      setMatErrors(['Materials can only be submitted when the job status is Ongoing or Completed.']);
      return;
    }

    const usages = Object.entries(matUsages)
      .filter(([, qty]) => Number(qty) > 0)
      .map(([itemId, qty]) => ({ inventoryItemId: Number(itemId), quantity: Number(qty) }));

    if (usages.length === 0) {
      setMatErrors(['Please enter at least one material quantity.']);
      return;
    }

    setMatErrors([]);
    setIsSubmittingMaterials(true);
    try {
      const res = await fetch(`/api/installations/${installation.id}/material-usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usages }),
      });
      if (!res.ok) { const d = await res.json(); setMatErrors([d.error || 'Failed to submit materials']); return; }
      const data = await res.json();
      setLocalMaterialUsages(data);
    } catch { setMatErrors(['Something went wrong. Please try again.']); }
    finally { setIsSubmittingMaterials(false); }
  };

  const handleFileSelect = (category: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newStaged = Array.from(files).map(file => ({
      file,
      caption: '',
      preview: URL.createObjectURL(file),
    }));
    setCategoryUpload(prev => ({
      ...prev,
      [category]: {
        show: true,
        staged: [...(prev[category]?.staged ?? []), ...newStaged],
        uploading: false,
      },
    }));
  };

  const handleRemoveStaged = (category: string, index: number) => {
    setCategoryUpload(prev => {
      const staged = prev[category]?.staged ?? [];
      URL.revokeObjectURL(staged[index].preview);
      return { ...prev, [category]: { ...prev[category], staged: staged.filter((_, i) => i !== index) } };
    });
  };

  const handleStagedCaption = (category: string, index: number, caption: string) => {
    setCategoryUpload(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        staged: prev[category].staged.map((s, i) => i === index ? { ...s, caption } : s),
      },
    }));
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!installation?.id) return;
    setPhotoError(null);
    try {
      const res = await fetch(`/api/photos/${photoId}`, { method: 'DELETE' });
      if (!res.ok) { setPhotoError('Failed to delete photo.'); return; }
      setLocalPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch { setPhotoError('Something went wrong. Please try again.'); }
  };

  const activeTechs = technicians.filter(t => t.status === 'active');

  const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black/50 overflow-y-auto z-50">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-xl">

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold">{isEdit ? 'Edit Job Order' : 'New Job Order'}</h2>
              <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100"><X size={18} /></button>
            </div>

            {isEdit && installation?.convertedAt && (
              <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">✓ Converted to Client</p>
                <p className="text-sm text-emerald-600 mt-0.5">{installation.client?.name}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* ── Prospect Information ─────────────────────────────── */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prospect Name <span className="text-red-500">*</span></label>
                  <input className={inputCls} value={form.prospectName} onChange={set('prospectName')} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                  <input className={inputCls} value={form.prospectPhone} onChange={set('prospectPhone')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address / Area</label>
                  <input className={inputCls} placeholder="e.g. Brgy. San Jose, Zone 3" value={form.prospectAddress} onChange={set('prospectAddress')} />
                </div>
              </div>

              {/* ── Job Details ──────────────────────────────────────── */}
              <SectionHeader title="Job Details" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assign Technician</label>
                  <select className={inputCls} value={form.technicianId} onChange={set('technicianId')}>
                    <option value="">— Not assigned yet —</option>
                    {activeTechs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select className={inputCls} value={form.status} onChange={set('status')}>
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Date</label>
                  <input type="date" className={inputCls} value={form.scheduledDate} min={new Date().toISOString().slice(0, 10)} onChange={set('scheduledDate')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Completed Date</label>
                  <input type="date" className={inputCls} value={form.completedDate} onChange={set('completedDate')} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                  <textarea className={inputCls + ' resize-none'} rows={2} placeholder="Field notes or remarks..." value={form.notes} onChange={set('notes')} />
                </div>
              </div>

              {/* ── Fiber Information ────────────────────────────────── */}
              <SectionHeader title="Fiber Information" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NAP Box</label>
                  <select
                    className={inputCls}
                    value={form.napboxId}
                    onChange={e => setForm(f => ({ ...f, napboxId: e.target.value, portNumber: '' }))}
                  >
                    <option value="">— Select NAP box —</option>
                    {napboxes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Port Number</label>
                  <select
                    className={inputCls}
                    value={form.portNumber}
                    onChange={set('portNumber')}
                    disabled={!form.napboxId}
                  >
                    <option value="">{form.napboxId ? '— Select port —' : '— Select NAP box first —'}</option>
                    {availablePorts.map(p => (
                      <option key={p.portNumber} value={p.portNumber}>Port {p.portNumber}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fiber Core Used</label>
                  <input className={inputCls} placeholder="e.g. Core 3A" value={form.fiberCore} onChange={set('fiberCore')} />
                </div>
              </div>

              {/* ── Device Information ───────────────────────────────── */}
              <SectionHeader title="Device Information" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Modem-Router</label>
                  <select
                    className={inputCls}
                    value={form.onuSerial}
                    onChange={e => {
                      const sn = e.target.value;
                      const matched = onuSerials.find(s => s.serialNumber === sn);
                      setForm(f => ({
                        ...f,
                        onuSerial: sn,
                        macAddress: matched?.macAddress ?? f.macAddress,
                      }));
                    }}
                  >
                    <option value="">— None —</option>
                    {form.onuSerial && !onuSerials.find(s => s.serialNumber === form.onuSerial) && (
                      <option value={form.onuSerial}>{form.onuSerial} (current)</option>
                    )}
                    {onuSerials.map(s => (
                      <option key={s.id} value={s.serialNumber}>
                        {s.item.name} — {s.serialNumber}
                      </option>
                    ))}
                  </select>
                  {onuSerials.length === 0 && (
                    <p className="mt-1 text-xs text-slate-400">No Modem-Router units in stock</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Router <span className="font-normal text-slate-400">(optional)</span></label>
                  <select className={inputCls} value={form.routerSerial} onChange={set('routerSerial')}>
                    <option value="">— None —</option>
                    {form.routerSerial && !routerSerials.find(s => s.serialNumber === form.routerSerial) && (
                      <option value={form.routerSerial}>{form.routerSerial} (current)</option>
                    )}
                    {routerSerials.map(s => (
                      <option key={s.id} value={s.serialNumber}>
                        {s.item.name} — {s.serialNumber}
                      </option>
                    ))}
                  </select>
                  {routerSerials.length === 0 && (
                    <p className="mt-1 text-xs text-slate-400">No Router units in stock</p>
                  )}
                </div>
                <div className="col-span-2">
                  <div className="flex items-baseline justify-between mb-1">
                    <label className="block text-sm font-medium text-slate-700">MAC Address</label>
                    {form.macAddress && form.onuSerial && onuSerials.find(s => s.serialNumber === form.onuSerial)?.macAddress === form.macAddress && (
                      <span className="text-xs text-emerald-600">Auto-filled from inventory</span>
                    )}
                  </div>
                  <input className={inputCls} placeholder="e.g. AA:BB:CC:DD:EE:FF" value={form.macAddress} onChange={set('macAddress')} />
                </div>
              </div>

              {/* ── Signal Readings ──────────────────────────────────── */}
              <SectionHeader title="Signal Readings" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">RX Reading (dBm)</label>
                  <input type="number" step="0.01" className={inputCls} placeholder="e.g. -18.5" value={form.rxReading} onChange={set('rxReading')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">TX Reading (dBm)</label>
                  <input type="number" step="0.01" className={inputCls} placeholder="e.g. -7.2" value={form.txReading} onChange={set('txReading')} />
                </div>
              </div>

              {/* ── GPS Location ─────────────────────────────────────── */}
              <SectionHeader title="GPS Location" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                  <input type="number" step="any" className={inputCls} placeholder="e.g. 14.5995" value={form.latitude} onChange={set('latitude')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                  <input type="number" step="any" className={inputCls} placeholder="e.g. 120.9842" value={form.longitude} onChange={set('longitude')} />
                </div>
              </div>

              {/* ── Material Usage (edit only) ───────────────────────── */}
              {isEdit && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-slate-400" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Material Usage</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSubmitMaterials}
                      disabled={isSubmittingMaterials}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {isSubmittingMaterials
                        ? <><LoaderCircle size={12} className="animate-spin" /> Saving...</>
                        : <><Package size={12} /> {localMaterialUsages.length > 0 ? 'Update Materials' : 'Submit Materials'}</>}
                    </button>
                  </div>

                  {localMaterialUsages.length > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <p className="text-xs text-emerald-700">
                        Submitted on {new Date(localMaterialUsages[0].createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  )}

                  {matErrors.length > 0 && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
                      <AlertCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        {matErrors.map((err, i) => (
                          <p key={i} className="text-xs text-red-700">{err}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {!inventoryLoaded ? (
                    <p className="text-xs text-slate-400">Loading inventory...</p>
                  ) : consumableItems.length === 0 ? (
                    <p className="text-sm text-slate-400">No consumable items in inventory. Add items in the Inventory module first.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {consumableItems.map(item => {
                        const isRequired = ['Drop Cable', 'SC Connector'].includes(item.category.name);
                        const qty = matUsages[item.id] ?? '';
                        const entered = parseFloat(qty || '0');
                        const isOverStock = item.quantity >= 0 && entered > item.quantity;
                        return (
                          <div key={item.id}>
                            <div className="flex items-baseline justify-between mb-1">
                              <label className="flex items-center gap-1 text-xs font-medium text-slate-600">
                                {item.name}
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-400">
                                  {item.category.name}
                                </span>
                                <span className="text-slate-400">({item.unit})</span>
                                {isRequired && <span className="text-red-500">*</span>}
                              </label>
                              <span className={`text-xs ${isOverStock ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                                {isOverStock ? `⚠ only ${item.quantity} avail.` : `${item.quantity} in stock`}
                              </span>
                            </div>
                            <input
                              type="number" min="0" step="0.01"
                              placeholder="0"
                              className={`${inputCls} ${isOverStock ? 'border-red-400 focus:ring-red-400' : ''}`}
                              value={qty}
                              onChange={e => {
                                setMatErrors([]);
                                setMatUsages(prev => ({ ...prev, [item.id]: e.target.value }));
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── Installation Photos (edit only) ─────────────────── */}
              {isEdit && (
                <div className="space-y-3">
                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Installation Photos</p>
                    <span className="text-xs text-slate-500">
                      {PHOTO_CATEGORIES.filter(c => localPhotos.some(p => p.category === c)).length}/{PHOTO_CATEGORIES.length} categories done
                    </span>
                  </div>

                  {photoError && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
                      <AlertCircle size={13} className="text-red-500 shrink-0" />
                      <p className="text-xs text-red-700">{photoError}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {PHOTO_CATEGORIES.map(category => {
                      const photos = localPhotos.filter(p => p.category === category);
                      const hasPhotos = photos.length > 0;
                      const upload = categoryUpload[category];
                      return (
                        <div key={category} className={`rounded-xl border p-3 space-y-2 ${hasPhotos ? 'border-slate-200' : 'border-red-200 bg-red-50/20'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-700">{category}</span>
                              {hasPhotos
                                ? <span className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full px-2 py-0.5 font-medium">{photos.length} photo{photos.length > 1 ? 's' : ''}</span>
                                : <span className="text-xs bg-red-50 border border-red-200 text-red-600 rounded-full px-2 py-0.5 font-medium">Required</span>}
                            </div>
                            {!upload?.show && (
                              <button
                                type="button"
                                onClick={() => setCategoryUpload(prev => ({ ...prev, [category]: { show: true, staged: [], uploading: false } }))}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                              >
                                <Plus size={11} /> Add Photo
                              </button>
                            )}
                          </div>

                          {hasPhotos && (
                            <div className="flex flex-wrap gap-2">
                              {photos.map(photo => (
                                <div key={photo.id} className="relative group">
                                  <img src={photo.url} alt={photo.caption || category} className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePhoto(photo.id)}
                                    className="absolute -top-1.5 -right-1.5 hidden group-hover:flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white shadow"
                                  >
                                    <Trash2 size={9} />
                                  </button>
                                  {photo.caption && (
                                    <p className="text-xs text-slate-500 mt-1 max-w-[80px] truncate" title={photo.caption}>{photo.caption}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {upload?.show && (
                            <div className="space-y-3 pt-2 border-t border-slate-100">
                              {/* Staged photos — saved when you click Save Changes */}
                              {(upload.staged ?? []).length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-xs font-medium text-amber-600">Pending — will upload on Save Changes</p>
                                  {upload.staged.map((s, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <img src={s.preview} alt="" className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0" />
                                      <input
                                        type="text"
                                        placeholder="Caption (optional)"
                                        className={`${inputCls} text-xs flex-1`}
                                        value={s.caption}
                                        onChange={e => handleStagedCaption(category, idx, e.target.value)}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveStaged(category, idx)}
                                        className="shrink-0 p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                                      >
                                        <X size={11} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Select / Add more */}
                              <div className="flex items-center gap-2">
                                <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">
                                  <Plus size={11} />
                                  {(upload.staged ?? []).length === 0 ? 'Select Photos' : 'Add More'}
                                  <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleFileSelect(category, e.target.files)} />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    (upload.staged ?? []).forEach(s => URL.revokeObjectURL(s.preview));
                                    setCategoryUpload(prev => ({ ...prev, [category]: { show: false, staged: [], uploading: false } }));
                                  }}
                                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Form-level errors ────────────────────────────────── */}
              {formErrors.length > 0 && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                  <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    {formErrors.map((err, i) => (
                      <p key={i} className="text-sm text-red-700">{err}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Actions ──────────────────────────────────────────── */}
              <div className="flex gap-3 pt-2 border-t border-slate-200">
                <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm hover:bg-slate-50 disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex flex-1 items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:bg-indigo-400">
                  {isSubmitting && <LoaderCircle size={16} className="animate-spin" />}
                  {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Job Order'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
