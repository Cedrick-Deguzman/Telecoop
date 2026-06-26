'use client';

import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ModalPortal } from '@/app/components/ui/ModalPortal';

export interface LightboxPhoto {
  id: number;
  url: string;
  category: string;
  caption: string | null;
}

interface Props {
  photos: LightboxPhoto[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
  title?: string;
}

// App-wide full-screen photo viewer. Used anywhere photos are shown (inventory, installations).
export default function PhotoLightbox({ photos, index, onIndexChange, onClose, title }: Props) {
  const count = photos.length;
  const prev = useCallback(() => onIndexChange((index - 1 + count) % count), [index, count, onIndexChange]);
  const next = useCallback(() => onIndexChange((index + 1) % count), [index, count, onIndexChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, prev, next]);

  const photo = photos[index];
  if (!photo) return null;

  return (
    <ModalPortal>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4"
      >
        <div onClick={e => e.stopPropagation()} className="relative flex w-full max-w-3xl flex-col">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between text-white">
            <div className="min-w-0">
              {title && <p className="truncate text-sm font-medium">{title}</p>}
              <p className="text-xs text-white/60">
                <span className="rounded-full bg-white/15 px-2 py-0.5">{photo.category}</span>
                <span className="ml-2">{index + 1} of {count}</span>
              </p>
            </div>
            <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10" aria-label="Close">
              <X size={20} />
            </button>
          </div>

          {/* Image + nav */}
          <div className="relative flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={photo.caption || photo.category}
              className="max-h-[72vh] w-auto max-w-full rounded-xl object-contain"
            />
            {count > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                  aria-label="Previous"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                  aria-label="Next"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>

          {photo.caption && (
            <p className="mt-3 text-center text-sm text-white/80">{photo.caption}</p>
          )}
        </div>
      </div>
    </ModalPortal>
  );
}
