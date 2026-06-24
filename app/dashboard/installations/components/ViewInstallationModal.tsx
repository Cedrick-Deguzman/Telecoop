'use client';
import { ModalPortal } from '@/app/components/ui/ModalPortal';
import { X, User, Calendar, MapPin, CheckCircle2, Package, ExternalLink, Phone, Image } from 'lucide-react';
import { Installation, PHOTO_CATEGORIES } from '../types';

const STATUS_BADGE: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  assigned:  'bg-blue-100 text-blue-700',
  ongoing:   'bg-indigo-100 text-indigo-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
};
const STATUS_LABEL: Record<string, string> = {
  pending:   'Pending',
  assigned:  'Assigned',
  ongoing:   'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function fmt(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-slate-800 font-medium">{value ?? '—'}</p>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="border-t border-slate-100 pt-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">{title}</p>
    </div>
  );
}

interface Props {
  installation: Installation;
  onClose: () => void;
  onEdit: () => void;
}

export function ViewInstallationModal({ installation: i, onClose, onEdit }: Props) {
  const mapsUrl = i.latitude && i.longitude
    ? `https://www.google.com/maps?q=${i.latitude},${i.longitude}`
    : null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black/50 overflow-y-auto z-50">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full shadow-xl">

            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{i.prospectName ?? '—'}</h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[i.status] ?? 'bg-slate-100 text-slate-600'}`}>
                    {STATUS_LABEL[i.status] ?? i.status}
                  </span>
                  {i.convertedAt && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 size={11} /> Converted — {i.client?.name}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100 shrink-0">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">

              {/* ── Prospect Info ── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="col-span-2 sm:col-span-3 flex flex-wrap gap-4 text-sm text-slate-600">
                  {i.prospectPhone && (
                    <span className="flex items-center gap-1.5"><Phone size={13} className="text-slate-400" />{i.prospectPhone}</span>
                  )}
                  {i.prospectAddress && (
                    <span className="flex items-center gap-1.5"><MapPin size={13} className="text-slate-400" />{i.prospectAddress}</span>
                  )}
                </div>
              </div>

              {/* ── Job Details ── */}
              <SectionHeader title="Job Details" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Technician</p>
                  <p className="text-sm text-slate-800 font-medium flex items-center gap-1.5">
                    {i.technician ? <><User size={13} className="text-slate-400" />{i.technician.name}</> : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Scheduled</p>
                  <p className="text-sm text-slate-800 font-medium flex items-center gap-1.5">
                    <Calendar size={13} className="text-slate-400" />{fmt(i.scheduledDate)}
                  </p>
                </div>
                <Field label="Completed" value={fmt(i.completedDate)} />
                <Field label="Notes" value={i.notes} />
              </div>

              {/* ── Fiber & Device ── */}
              <SectionHeader title="Fiber & Device" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field label="NAP Box"       value={i.napbox?.name} />
                <Field label="Port Number"   value={i.portNumber} />
                <Field label="Fiber Core"    value={i.fiberCore} />
                <Field label="ONU Serial"    value={i.onuSerial} />
                <Field label="Router Serial" value={i.routerSerial} />
                <Field label="MAC Address"   value={i.macAddress} />
                <Field label="RX Reading"    value={i.rxReading != null ? `${i.rxReading} dBm` : null} />
                <Field label="TX Reading"    value={i.txReading != null ? `${i.txReading} dBm` : null} />
              </div>

              {/* ── GPS ── */}
              {(i.latitude || i.longitude) && (
                <>
                  <SectionHeader title="GPS Location" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <Field label="Latitude"  value={i.latitude} />
                    <Field label="Longitude" value={i.longitude} />
                    {mapsUrl && (
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Map</p>
                        <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                          Open in Google Maps <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── Material Usage ── */}
              <SectionHeader title="Material Usage" />
              {i.materials ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <Field label="Drop Cable (m)"    value={i.materials.dropCable} />
                    <Field label="SC Connector"      value={i.materials.scConnector} />
                    <Field label="Cable Ties"        value={i.materials.cableTies} />
                    <Field label="Clamps"            value={i.materials.clamps} />
                    <Field label="Patch Cord"        value={i.materials.patchCord} />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700">
                    <CheckCircle2 size={12} />
                    Submitted on {fmt(i.materials.submittedAt)}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-sm text-slate-400">
                  <Package size={14} /> Not yet submitted
                </div>
              )}

              {/* ── Installation Photos ── */}
              <SectionHeader title="Installation Photos" />
              <div className="grid grid-cols-2 gap-3">
                {PHOTO_CATEGORIES.map(category => {
                  const photos = i.photos.filter(p => p.category === category);
                  return (
                    <div key={category} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-slate-600">{category}</p>
                        {photos.length > 0
                          ? <span className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full px-2 py-0.5">{photos.length} photo{photos.length > 1 ? 's' : ''}</span>
                          : <span className="text-xs bg-slate-100 text-slate-400 rounded-full px-2 py-0.5">No photo</span>}
                      </div>
                      {photos.length > 0 ? (
                        <div className="grid grid-cols-3 gap-1.5">
                          {photos.map(photo => (
                            <div key={photo.id}>
                              <a href={photo.url} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={photo.url}
                                  alt={photo.caption || category}
                                  className="w-full aspect-square object-cover rounded-lg hover:opacity-90 transition-opacity"
                                />
                              </a>
                              {photo.caption && (
                                <p className="text-xs text-slate-400 mt-1 truncate" title={photo.caption}>{photo.caption}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white py-6 gap-1.5">
                          <Image size={20} className="text-slate-300" />
                          <p className="text-xs text-slate-300">No photo uploaded</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>

            {/* ── Footer ── */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
              <button onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm hover:bg-slate-50">
                Close
              </button>
              <button onClick={() => { onClose(); onEdit(); }} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 font-medium">
                Edit Job Order
              </button>
            </div>

          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
