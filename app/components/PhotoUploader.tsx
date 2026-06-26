'use client';

import { useState } from 'react';
import { Plus, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { PHOTO_RULES, type PhotoRecordType } from '@/lib/photoConfig';
import { compressImage } from '@/lib/compressImage';
import PhotoLightbox from './PhotoLightbox';

export interface RecordPhoto {
  id: number;
  url: string;
  publicId: string;
  category: string;
  caption: string | null;
  createdAt: string;
}

interface Props {
  recordType: PhotoRecordType;
  recordId: number;
  photos: RecordPhoto[];
  onChange: (photos: RecordPhoto[]) => void;
}

// Immediate-mode photo uploader: select -> compress -> upload -> reflect.
// Categories and required flags come from PHOTO_RULES, so each record type is self-describing.
export default function PhotoUploader({ recordType, recordId, photos, onChange }: Props) {
  const rule = PHOTO_RULES[recordType];
  const requiredSet = new Set(rule.required);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [viewer, setViewer] = useState<{ photos: RecordPhoto[]; index: number } | null>(null);

  const handleSelect = async (category: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(prev => ({ ...prev, [category]: true }));
    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async raw => {
          const file = await compressImage(raw);
          const fd = new FormData();
          fd.append('file', file);
          fd.append('recordType', recordType);
          fd.append('recordId', String(recordId));
          fd.append('category', category);
          const res = await fetch('/api/photos', { method: 'POST', body: fd });
          if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Upload failed'); }
          return res.json() as Promise<RecordPhoto>;
        }),
      );
      onChange([...photos, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo.');
    } finally {
      setUploading(prev => ({ ...prev, [category]: false }));
    }
  };

  const handleDelete = async (photoId: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/photos/${photoId}`, { method: 'DELETE' });
      if (!res.ok) { setError('Failed to delete photo.'); return; }
      onChange(photos.filter(p => p.id !== photoId));
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
          <AlertCircle size={13} className="text-red-500 shrink-0" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        {rule.categories.map(category => {
          const catPhotos = photos.filter(p => p.category === category);
          const hasPhotos = catPhotos.length > 0;
          const isRequired = requiredSet.has(category);
          const isBusy = uploading[category];
          const flagEmpty = isRequired && !hasPhotos;

          return (
            <div
              key={category}
              className={`rounded-xl border p-3 space-y-2 ${flagEmpty ? 'border-red-200 bg-red-50/20' : 'border-slate-200'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">{category}</span>
                  {hasPhotos
                    ? <span className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full px-2 py-0.5 font-medium">{catPhotos.length} photo{catPhotos.length > 1 ? 's' : ''}</span>
                    : isRequired
                      ? <span className="text-xs bg-red-50 border border-red-200 text-red-600 rounded-full px-2 py-0.5 font-medium">Required</span>
                      : <span className="text-xs bg-slate-100 text-slate-400 rounded-full px-2 py-0.5">Optional</span>}
                </div>
                <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 cursor-pointer">
                  {isBusy ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
                  {isBusy ? 'Uploading…' : 'Add Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={isBusy}
                    onChange={e => { handleSelect(category, e.target.files); e.target.value = ''; }}
                  />
                </label>
              </div>

              {hasPhotos && (
                <div className="flex flex-wrap gap-2">
                  {catPhotos.map((photo, idx) => (
                    <div key={photo.id} className="relative group">
                      <button
                        type="button"
                        onClick={() => setViewer({ photos: catPhotos, index: idx })}
                        className="block"
                      >
                        <img src={photo.url} alt={photo.caption || category} className="w-20 h-20 object-cover rounded-lg border border-slate-200 hover:opacity-90" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(photo.id)}
                        className="absolute -top-1.5 -right-1.5 hidden group-hover:flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white shadow"
                      >
                        <Trash2 size={9} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {viewer && (
        <PhotoLightbox
          photos={viewer.photos}
          index={viewer.index}
          onIndexChange={i => setViewer(v => (v ? { ...v, index: i } : v))}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
}
