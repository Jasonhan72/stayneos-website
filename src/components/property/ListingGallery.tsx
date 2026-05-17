'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Grid3X3 } from 'lucide-react';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { Container } from '@/components/ui';
import { useI18n } from '@/lib/i18n';

interface ListingGalleryProps {
  images: string[];
  title: string;
  className?: string;
}

export default function ListingGallery({ images, title, className = '' }: ListingGalleryProps) {
  const { t } = useI18n();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const containerWidth = scrollContainerRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / containerWidth);
      setCurrentImageIndex(Math.max(0, Math.min(newIndex, images.length - 1)));
    }
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  // ESC key handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowGallery(false);
      setShowGrid(false);
    }
  }, []);

  useEffect(() => {
    if (showGallery) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showGallery, handleKeyDown]);
  const prevImage = () => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  return (
    <>
      {/* Full Width Image Gallery - Desktop Grid / Mobile Carousel */}
      <div className={`relative ${className}`}>
        {/* Mobile: Swipe Carousel with CSS Scroll Snap */}
        <div className="md:hidden relative w-full bg-neutral-100">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {images.map((url, index) => (
              <div key={index} className="w-full flex-shrink-0 snap-center relative aspect-[4/3]">
                <ResponsiveImage src={url} alt={`${title} - Image ${index + 1}`} fill priority={index === 0} className="object-cover" />
              </div>
            ))}
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={() => { if (scrollContainerRef.current) { const w = scrollContainerRef.current.offsetWidth; scrollContainerRef.current.scrollTo({ left: (currentImageIndex - 1) * w, behavior: 'smooth' }); } }}
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center ${currentImageIndex === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                aria-label="Previous image"
              ><ChevronLeft size={18} /></button>
              <button
                onClick={() => { if (scrollContainerRef.current) { const w = scrollContainerRef.current.offsetWidth; scrollContainerRef.current.scrollTo({ left: (currentImageIndex + 1) * w, behavior: 'smooth' }); } }}
                className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center ${currentImageIndex === images.length - 1 ? 'opacity-0 pointer-events-none' : ''}`}
                aria-label="Next image"
              ><ChevronRight size={18} /></button>
            </>
          )}

          <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/70 text-white text-sm rounded-lg">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>

        {/* Desktop: Grid Gallery */}
        <Container className="hidden md:block">
          <div className="relative">
            {images.length === 1 ? (
              <div className="h-[400px] rounded-2xl overflow-hidden relative cursor-pointer hover:opacity-95 transition-opacity" onClick={() => setShowGallery(true)}>
                <ResponsiveImage src={images[0]} alt={title} fill priority className="object-cover" />
              </div>
            ) : images.length === 2 ? (
              <div className="grid grid-cols-2 gap-2 h-[400px] rounded-2xl overflow-hidden">
                {images.slice(0, 2).map((img, idx) => (
                  <div key={idx} className="relative cursor-pointer hover:opacity-95 transition-opacity" onClick={() => { setCurrentImageIndex(idx); setShowGallery(true); }}>
                    <ResponsiveImage src={img} alt={`${title} - ${idx + 1}`} fill className="object-cover" priority={idx === 0} />
                  </div>
                ))}
              </div>
            ) : images.length <= 4 ? (
              <div className="grid grid-cols-2 gap-2 h-[400px] rounded-2xl overflow-hidden">
                <div className="relative cursor-pointer hover:opacity-95 transition-opacity" onClick={() => setShowGallery(true)}>
                  <ResponsiveImage src={images[0]} alt={title} fill priority className="object-cover" />
                </div>
                <div className={`grid ${images.length === 3 ? 'grid-rows-2' : 'grid-cols-2 grid-rows-2'} gap-2`}>
                  {images.slice(1).map((img, idx) => (
                    <div key={idx} className="relative cursor-pointer hover:opacity-95 transition-opacity" onClick={() => { setCurrentImageIndex(idx + 1); setShowGallery(true); }}>
                      <ResponsiveImage src={img} alt={`${title} - ${idx + 2}`} fill className="object-cover" />
                      {idx === images.length - 2 && (
                        <button onClick={(e) => { e.stopPropagation(); setShowGallery(true); }} className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg border border-neutral-900 bg-white px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-50 z-10">
                          {t('property.showAllPhotos', 'Show all photos')}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* 5+ images: Airbnb classic - 1 large left (col-span-2 row-span-2) + 2x2 right */
              <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] rounded-2xl overflow-hidden">
                <div className="col-span-2 row-span-2 relative cursor-pointer hover:opacity-95 transition-opacity" onClick={() => setShowGallery(true)}>
                  <ResponsiveImage src={images[0]} alt={title} fill priority className="object-cover" />
                </div>
                {images.slice(1, 5).map((img, idx) => (
                  <div key={idx} className="relative cursor-pointer hover:opacity-95 transition-opacity" onClick={() => { setCurrentImageIndex(idx + 1); setShowGallery(true); }}>
                    <ResponsiveImage src={img} alt={`${title} - ${idx + 2}`} fill className="object-cover" />
                    {idx === 3 && (
                      <button onClick={(e) => { e.stopPropagation(); setShowGallery(true); }} className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg border border-neutral-900 bg-white px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-50 z-10">
                        {t('property.showAllPhotos', 'Show all photos')}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Container>
      </div>

      {/* Full Screen Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-neutral-900" onClick={() => { setShowGallery(false); setShowGrid(false); }}>
          <div className="h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Top bar: Close left, Counter right */}
            <div className="flex items-center justify-between p-4 bg-neutral-900/95 backdrop-blur-sm">
              <button
                onClick={() => { setShowGallery(false); setShowGrid(false); }}
                className="p-2 text-white hover:bg-neutral-800 transition-colors rounded-full"
                aria-label="Close gallery"
              >
                <X size={24} />
              </button>
              <span className="text-white font-medium text-sm">
                {currentImageIndex + 1} / {images.length}
              </span>
            </div>

            {showGrid ? (
              /* Grid View - 4 columns */
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentImageIndex(index);
                        setShowGrid(false);
                      }}
                      className={`relative aspect-[4/3] overflow-hidden rounded-lg transition-all ${
                        index === currentImageIndex ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <ResponsiveImage
                        src={image}
                        alt={`${title} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Single Image View */
              <>
                <div className="flex-1 relative flex items-center justify-center bg-neutral-900">
                  <ResponsiveImage
                    src={images[currentImageIndex]}
                    alt={`${title} - Image ${currentImageIndex + 1}`}
                    fill
                    className="object-contain"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 text-white transition-colors rounded-full"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={32} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 text-white transition-colors rounded-full"
                        aria-label="Next image"
                      >
                        <ChevronRight size={32} />
                      </button>
                    </>
                  )}
                </div>
                {/* Bottom bar: Grid toggle + thumbnail strip */}
                <div className="p-4 bg-neutral-900/95 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => setShowGrid(true)}
                      className="inline-flex items-center gap-2 px-3 py-2 text-white text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Grid3X3 size={16} />
                      <span>Show grid</span>
                    </button>
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto justify-center">
                      {images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative flex-shrink-0 w-20 h-14 overflow-hidden transition-all rounded-lg ${
                            index === currentImageIndex
                              ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900'
                              : 'opacity-50 hover:opacity-100'
                          }`}
                        >
                          <ResponsiveImage src={image} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
