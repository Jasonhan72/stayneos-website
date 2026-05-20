"use client";

import { useRef } from "react";
import { Upload, X } from "lucide-react";
import { useListingDraft } from "@/hooks/useListingDraft";
import WizardFooter from "@/components/host/listings/wizard/WizardFooter";

const MAX_PHOTOS = 20;

const MAX_SIZE_MB = 4;

// Compress image to JPEG at reduced quality to keep localStorage small
function compressImage(file: File, maxPx = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode failed'));
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function StepPhotosPage() {
  const { draft, updateDraft } = useListingDraft();
  const photos = draft.photos || [];
  const imported = draft.importedImages || [];
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const accepted: string[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      if (photos.length + accepted.length >= MAX_PHOTOS) break;
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`"${f.name}" is over ${MAX_SIZE_MB}MB — please use a smaller file.`);
        continue;
      }
      try {
        accepted.push(await compressImage(f));
      } catch {
        /* skip */
      }
    }
    if (accepted.length === 0) return;
    updateDraft({
      photos: [...photos, ...accepted],
      step: Math.max(draft.step || 0, 6),
    });
  }

  function removeAt(idx: number) {
    const next = photos.filter((_, i) => i !== idx);
    updateDraft({ photos: next });
  }

  const ready = photos.length >= 1;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Add some photos
        </h1>
        <p className="text-sm text-neutral-600">
          You&apos;ll need at least 1 photo to publish. Drag &amp; drop or
          click to upload.
        </p>
      </header>

      <label
        htmlFor="photo-input"
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 px-6 py-10 text-center hover:border-neutral-400 hover:bg-neutral-50"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        <Upload className="h-8 w-8 text-neutral-400" />
        <div className="text-sm font-medium text-neutral-900">
          Drag photos here or click to browse
        </div>
        <div className="text-xs text-neutral-500">
          JPG / PNG / WebP — up to {MAX_PHOTOS} photos
        </div>
        <input
          id="photo-input"
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((src, idx) => (
            <div
              key={idx}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Upload ${idx + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(idx)}
                aria-label="Remove photo"
                className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-neutral-900 opacity-100 md:opacity-0 md:transition md:group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
              {idx === 0 && (
                <div className="absolute bottom-2 left-2 rounded bg-neutral-900/80 px-2 py-0.5 text-xs font-medium text-white">
                  Cover
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {imported.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-neutral-900">
            Reference photos (from import source)
          </h2>
          <p className="text-xs text-neutral-500">
            These came from the page you imported. They&apos;re shown for
            reference only — please upload your own photos above.
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {imported.slice(0, 8).map((src, idx) => (
              <div
                key={idx}
                className="relative aspect-square overflow-hidden rounded-md border border-neutral-200 bg-neutral-100 opacity-70"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Reference ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <WizardFooter currentSlug="photos" canContinue={ready} />
    </div>
  );
}
