// Property Detail Page - Optimized with Airbnb-style Booking
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPin, 
  Star,
  Heart,
  Share,
  ChevronLeft,
  ChevronRight,
  Bed,
  Bath,
  Users,
  Maximize,
  Check,
  X
} from 'lucide-react';
import { Container, Card, Divider } from '@/components/ui';
import { BookingCard, AirbnbCalendar } from '@/components/booking';
import { getPropertyById, mockProperties } from '@/lib/data';
import { getLocalizedTitle, getLocalizedDescription } from '@/components/property/PropertyCard';
import { notFound } from 'next/navigation';

interface PropertyDetailClientProps {
  propertyId: string;
  initialProperty?: ReturnType<typeof getPropertyById>;
  initialLocale?: string;
}

export default function PropertyDetailClient({ propertyId, initialProperty, initialLocale = 'en' }: PropertyDetailClientProps) {
  const propertyFromStore = getPropertyById(propertyId);
  const property = initialProperty || propertyFromStore;
  
  const [effectiveLocale] = useState(initialLocale);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const localizedTitle = useMemo(() => {
    if (!property) return '';
    return getLocalizedTitle(property, effectiveLocale);
  }, [property, effectiveLocale]);

  const localizedDescription = useMemo(() => {
    if (!property) return '';
    return getLocalizedDescription(property, effectiveLocale);
  }, [property, effectiveLocale]);

  const similarProperties = useMemo(() => {
    if (!property) return [];
    return mockProperties
      .filter(p => p.id !== property.id)
      .filter(p => 
        p.location.includes(property.location.split(',')[1]?.trim() || '') ||
        Math.abs(p.price - property.price) / property.price < 0.3
      )
      .slice(0, 3);
  }, [property]);

  if (!property) {
    notFound();
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => prev === property.images.length - 1 ? 0 : prev + 1);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => prev === 0 ? property.images.length - 1 : prev + 1);
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <main className="min-h-screen bg-white" suppressHydrationWarning>
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-neutral-200">
        <Container>
          <div className="flex items-center justify-between h-16">
            <Link href="/properties" className="flex items-center text-neutral-600 hover:text-neutral-900 transition-colors">
              <ChevronLeft size={20} />
              <span className="ml-1 hidden sm:inline font-medium">Back to List</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsLiked(!isLiked)} 
                className="p-2.5 hover:bg-neutral-100 rounded-full transition-colors"
                aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart 
                  size={20} 
                  className={isLiked ? 'fill-error text-error' : 'text-neutral-600'} 
                />
              </button>
              <button
                onClick={async () => {
                  const shareUrl = `${window.location.origin}/property/${propertyId}`;
                  if (navigator.share) {
                    try { 
                      await navigator.share({ 
                        title: localizedTitle, 
                        text: `Check out this property: ${localizedTitle} - ${property.location}`, 
                        url: shareUrl 
                      }); 
                    } catch {}
                  } else {
                    try {
                      await navigator.clipboard.writeText(shareUrl);
                      alert('Link copied to clipboard!');
                    } catch {
                      // Fallback copy
                    }
                  }
                }}
                className="p-2.5 hover:bg-neutral-100 rounded-full transition-colors"
                aria-label="Share property"
              >
                <Share size={20} className="text-neutral-600" />
              </button>
            </div>
          </div>
        </Container>
      </nav>

      {/* Image Gallery Section */}
      <div className="bg-neutral-100">
        <Container>
          <div className="py-4">
            {/* Main Image */}
            <div 
              className="relative aspect-[16/9] max-h-[60vh] bg-neutral-200 overflow-hidden rounded-2xl cursor-pointer"
              onClick={() => setShowGallery(true)}
            >
              <Image 
                src={property.images[currentImageIndex]} 
                alt={`${localizedTitle} - Image ${currentImageIndex + 1}`} 
                fill 
                priority 
                className="object-cover" 
              />
              
              {/* Navigation Arrows */}
              <button 
                onClick={(e) => { e.stopPropagation(); prevImage(); }} 
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white transition-colors rounded-full shadow-lg"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); nextImage(); }} 
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white transition-colors rounded-full shadow-lg"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
              
              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 px-4 py-2 bg-neutral-900/80 text-white text-sm rounded-full">
                {currentImageIndex + 1} / {property.images.length}
              </div>
              
              {/* View All Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); setShowGallery(true); }} 
                className="absolute bottom-4 left-4 px-4 py-2 bg-white text-neutral-900 text-sm font-medium hover:bg-neutral-100 transition-colors rounded-full shadow-lg"
              >
                View all {property.images.length} images
              </button>
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
              {property.images.map((image, index) => (
                <button 
                  key={index} 
                  onClick={() => selectImage(index)} 
                  className={`relative flex-shrink-0 w-24 h-16 overflow-hidden rounded-lg transition-all ${
                    index === currentImageIndex 
                      ? 'ring-2 ring-primary ring-offset-2' 
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={image} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title Section */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">{localizedTitle}</h1>
                <div className="flex items-center gap-1 shrink-0">
                  <Star size={18} className="text-accent fill-accent" />
                  <span className="font-medium">{property.rating}</span>
                  <span className="text-neutral-400">({property.reviewCount} reviews)</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-neutral-600">
                <MapPin size={18} />
                <span>{property.location}</span>
              </div>
            </div>

            <Divider />

            {/* Property Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <Users className="text-primary" size={24} />
                <div>
                  <div className="font-medium">{property.maxGuests} guests</div>
                  <div className="text-sm text-neutral-500">Max capacity</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <Bed className="text-primary" size={24} />
                <div>
                  <div className="font-medium">{property.bedrooms} BR</div>
                  <div className="text-sm text-neutral-500">Bedrooms</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <Bath className="text-primary" size={24} />
                <div>
                  <div className="font-medium">{property.bathrooms} BA</div>
                  <div className="text-sm text-neutral-500">Bathrooms</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <Maximize className="text-primary" size={24} />
                <div>
                  <div className="font-medium">{property.area} m²</div>
                  <div className="text-sm text-neutral-500">Total area</div>
                </div>
              </div>
            </div>

            <Divider />

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-4">About this place</h2>
              <div className="text-neutral-600 whitespace-pre-line leading-relaxed">
                {localizedDescription || `This beautiful apartment in ${property.location} features ${property.bedrooms} spacious bedrooms and ${property.bathrooms} modern bathrooms. The apartment has a total area of ${property.area} square meters and can accommodate up to ${property.maxGuests} guests.`}
              </div>
            </div>

            <Divider />

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-semibold mb-4">What this place offers</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-neutral-700 p-3 bg-neutral-50 rounded-lg">
                    <Check size={18} className="text-success" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <Divider />

            {/* Location Map */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Where you&apos;ll be</h2>
              <div className="w-full h-[350px] bg-neutral-100 relative overflow-hidden rounded-2xl">
                <iframe 
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(property.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade" 
                  className="absolute inset-0" 
                  title={`${localizedTitle} Location`} 
                />
                <div className="absolute bottom-4 left-4 bg-white p-4 shadow-lg rounded-xl max-w-xs">
                  <h4 className="font-semibold text-neutral-900 mb-1">{localizedTitle}</h4>
                  <p className="text-sm text-neutral-600">{property.location}</p>
                  <a 
                    href={`https://maps.google.com/?q=${encodeURIComponent(property.location)}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center text-sm text-primary hover:text-primary-700 font-medium mt-2"
                  >
                    Open in Google Maps
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>

            {/* Similar Properties */}
            {similarProperties.length > 0 && (
              <>
                <Divider />
                <div>
                  <h2 className="text-xl font-semibold mb-4">Similar Properties</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {similarProperties.map((similarProperty) => (
                      <Link key={similarProperty.id} href={`/property/${similarProperty.id}`} className="group">
                        <Card className="flex gap-4 p-4 hover:shadow-lg transition-shadow">
                          <div className="relative w-32 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                            <Image 
                              src={similarProperty.images[0]} 
                              alt={getLocalizedTitle(similarProperty, effectiveLocale)} 
                              fill 
                              className="object-cover transition-transform group-hover:scale-105" 
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-neutral-900 line-clamp-1 group-hover:text-primary transition-colors">
                              {getLocalizedTitle(similarProperty, effectiveLocale)}
                            </h3>
                            <p className="text-sm text-neutral-500 line-clamp-1 mt-1">{similarProperty.location}</p>
                            <div className="flex items-center gap-1 mt-2">
                              <Star size={14} className="text-accent fill-accent" />
                              <span className="text-sm">{similarProperty.rating}</span>
                              <span className="text-sm text-neutral-400">({similarProperty.reviewCount})</span>
                            </div>
                            <div className="mt-2 font-semibold text-neutral-900">
                              ${similarProperty.price.toLocaleString()} <span className="text-sm font-normal text-neutral-500">/night</span>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Airbnb Calendar */}
            <AirbnbCalendar 
              checkIn={checkIn}
              checkOut={checkOut}
              pricePerNight={property.price}
              minNights={property.minNights || 1}
              onSelectCheckIn={(date) => setCheckIn(date)}
              onSelectCheckOut={(date) => setCheckOut(date)}
              onClose={() => { setCheckIn(''); setCheckOut(''); }}
            />
            
            <BookingCard 
              property={{
                id: property.id,
                title: localizedTitle,
                price: property.price,
                maxGuests: property.maxGuests,
                minNights: property.minNights,
                monthlyDiscount: property.monthlyDiscount,
                cleaningFee: property.cleaningFee || 80,
                rating: property.rating,
                reviewCount: property.reviewCount,
              }}
            />
          </div>
        </div>
      </Container>

      {/* Full Screen Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-neutral-900">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-neutral-900">
              <h3 className="text-white font-medium">
                {currentImageIndex + 1} / {property.images.length}
              </h3>
              <button 
                onClick={() => setShowGallery(false)} 
                className="p-2 text-white hover:bg-neutral-800 transition-colors rounded-full"
                aria-label="Close gallery"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Main Image */}
            <div className="flex-1 relative flex items-center justify-center">
              <Image 
                src={property.images[currentImageIndex]} 
                alt={`${localizedTitle} - Image ${currentImageIndex + 1}`} 
                fill 
                className="object-contain" 
              />
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
            </div>
            
            {/* Thumbnails */}
            <div className="p-4 bg-neutral-900">
              <div className="flex gap-2 overflow-x-auto justify-center">
                {property.images.map((image, index) => (
                  <button 
                    key={index} 
                    onClick={() => selectImage(index)} 
                    className={`relative flex-shrink-0 w-20 h-14 overflow-hidden transition-all rounded-lg ${
                      index === currentImageIndex 
                        ? 'ring-2 ring-accent ring-offset-2 ring-offset-neutral-900' 
                        : 'opacity-50 hover:opacity-100'
                    }`}
                  >
                    <Image src={image} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
