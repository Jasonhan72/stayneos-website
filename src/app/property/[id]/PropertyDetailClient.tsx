// Property Detail Page - Airbnb Style Redesign
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Star,
  Heart,
  Share,
  ChevronLeft,
  ChevronRight,
  X,
  Trophy,
  Waves,
  Check
} from 'lucide-react';
import { Container, Divider } from '@/components/ui';
import { FullscreenCalendar, ReviewAndContinue, PaymentMethod, calculateBookingPrice } from '@/components/booking';
import { getPropertyById, mockProperties } from '@/lib/data';
import { getLocalizedTitle, getLocalizedDescription } from '@/components/property/PropertyCard';
import { useI18n } from '@/lib/i18n';
import { notFound } from 'next/navigation';

interface PropertyDetailClientProps {
  propertyId: string;
  initialProperty?: ReturnType<typeof getPropertyById>;
}

// Mock host data
const mockHost = {
  name: 'Nazli',
  avatar: '/images/host-avatar.jpg',
  isSuperhost: true,
  yearsHosting: 7,
};

export default function PropertyDetailClient({ propertyId, initialProperty }: PropertyDetailClientProps) {
  const propertyFromStore = getPropertyById(propertyId);
  const property = initialProperty || propertyFromStore;
  
  const { t, locale } = useI18n();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  
  // Booking state
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const localizedTitle = useMemo(() => {
    if (!property) return '';
    return getLocalizedTitle(property, locale);
  }, [property, locale]);

  const localizedDescription = useMemo(() => {
    if (!property) return '';
    return getLocalizedDescription(property, locale);
  }, [property, locale]);

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

  // Calculate booking price
  const bookingPrice = useMemo(() => {
    if (!property || !checkIn || !checkOut) return null;
    return calculateBookingPrice({
      basePrice: property.price,
      checkIn,
      checkOut,
      monthlyDiscount: property.monthlyDiscount,
      cleaningFee: property.cleaningFee || 80,
    });
  }, [property, checkIn, checkOut]);

  if (!property) {
    notFound();
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => prev === property.images.length - 1 ? 0 : prev + 1);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => prev === 0 ? property.images.length - 1 : prev - 1);
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Format property type and location
  const propertyType = property.bedrooms <= 1 ? t('property.entireCondo') : t('property.entireHome');
  const locationShort = property.location.split(',')[1]?.trim() || 'Toronto';
  
  // Translated location string
  const locationString = locale === 'zh' 
    ? `${locationShort}，加拿大`
    : locale === 'fr'
    ? `${locationShort}, Canada`
    : `${locationShort}, Canada`;
  
  // Format guest info
  const guestInfo = t('property.guestInfo', { 
    maxGuests: property.maxGuests, 
    bedrooms: property.bedrooms, 
    beds: property.bedrooms, 
    bathrooms: property.bathrooms 
  });

  const handleCheckAvailability = () => {
    if (!checkIn || !checkOut) {
      setShowCalendar(true);
    } else {
      setShowReview(true);
    }
  };

  return (
    <main className="min-h-screen bg-white pb-24" suppressHydrationWarning>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <Container>
          <div className="flex items-center justify-between h-14">
            <Link href="/properties" className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors">
              <ChevronLeft size={24} className="text-neutral-900" />
            </Link>
            
            <div className="flex items-center gap-2">
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
                      alert(t('property.linkCopied'));
                    } catch {}
                  }
                }}
                className="p-2.5 hover:bg-neutral-100 rounded-full transition-colors"
                aria-label="Share property"
              >
                <Share size={20} className="text-neutral-900" />
              </button>
              <button 
                onClick={() => setIsLiked(!isLiked)} 
                className="p-2.5 hover:bg-neutral-100 rounded-full transition-colors"
                aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart 
                  size={20} 
                  className={isLiked ? 'fill-rose-500 text-rose-500' : 'text-neutral-900'} 
                />
              </button>
            </div>
          </div>
        </Container>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-14" />

      {/* Full Width Image Carousel */}
      <div className="relative w-full aspect-[4/3] bg-neutral-100">
        <Image 
          src={property.images[currentImageIndex]} 
          alt={`${localizedTitle} - Image ${currentImageIndex + 1}`} 
          fill 
          priority 
          className="object-cover" 
        />
        
        {/* Image Counter - Bottom Right */}
        <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/70 text-white text-sm rounded-lg">
          {currentImageIndex + 1} / {property.images.length}
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={prevImage} 
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white transition-colors rounded-full shadow-lg"
          aria-label="Previous image"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={nextImage} 
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white transition-colors rounded-full shadow-lg"
          aria-label="Next image"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Main Content */}
      <Container className="pt-6">
        {/* Title Section - Centered */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">{localizedTitle}</h1>
          <p className="text-neutral-600">{t('property.inLocation', { propertyType, location: locationString })}</p>
          <p className="text-neutral-600">{guestInfo}</p>
        </div>

        {/* Three Column Info Bar */}
        <div className="flex items-center justify-center gap-6 mb-6 py-4 border-y border-neutral-200">
          {/* Rating */}
          <div className="text-center">
            <p className="text-lg font-semibold">{property.rating}</p>
            <div className="flex justify-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className="fill-black" />
              ))}
            </div>
          </div>

          <div className="w-px h-10 bg-neutral-200" />

          {/* Guest Favourite */}
          <div className="text-center">
            <div className="flex justify-center gap-1">
              <Trophy size={14} className="text-neutral-900" />
              <Trophy size={14} className="text-neutral-900 transform rotate-180" />
            </div>
            <p className="text-sm font-medium">{t('property.guest')}</p>
            <p className="text-sm font-medium">{t('property.favourite')}</p>
          </div>

          <div className="w-px h-10 bg-neutral-200" />

          {/* Reviews */}
          <div className="text-center">
            <p className="text-lg font-semibold">{property.reviewCount}</p>
            <p className="text-sm underline">{t('property.reviews')}</p>
          </div>
        </div>

        {/* Host Info */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-neutral-200">
            <Image 
              src={mockHost.avatar} 
              alt={mockHost.name}
              fill
              className="object-cover"
              onError={(e) => {
                // Fallback to placeholder
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${mockHost.name}&background=random`;
              }}
            />
          </div>
          <div>
            <p className="font-medium text-neutral-900">{t('property.hostedBy', { name: mockHost.name })}</p>
            <p className="text-sm text-neutral-600">{t('property.superhostYears', { years: mockHost.yearsHosting })}</p>
          </div>
        </div>

        <Divider />

        {/* Badges / Highlights */}
        <div className="py-6 space-y-4">
          <div className="flex gap-3">
            <Trophy size={24} className="text-neutral-900 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-neutral-900">{t('property.top10')}</p>
              <p className="text-sm text-neutral-600">{t('property.top10Desc')}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Waves size={24} className="text-neutral-900 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-neutral-900">{t('property.diveIn')}</p>
              <p className="text-sm text-neutral-600">{t('property.diveInDesc')}</p>
            </div>
          </div>
        </div>

        <Divider />

        {/* Description */}
        <div className="py-6">
          <h2 className="text-lg font-semibold mb-4">{t('property.aboutPlace')}</h2>
          <p className="text-neutral-600 leading-relaxed">
            {localizedDescription || t('property.defaultDescription', { 
              propertyType: propertyType.toLowerCase(), 
              location: property.location, 
              bedrooms: property.bedrooms, 
              bathrooms: property.bathrooms, 
              area: property.area, 
              maxGuests: property.maxGuests 
            })}
          </p>
        </div>

        <Divider />

        {/* Amenities */}
        <div className="py-6">
          <h2 className="text-lg font-semibold mb-4">{t('property.whatOffers')}</h2>
          <div className="grid grid-cols-2 gap-4">
            {property.amenities.slice(0, 6).map((item) => (
              <div key={item} className="flex items-center gap-3 text-neutral-700">
                <Check size={18} className="text-neutral-900" />
                {item}
              </div>
            ))}
          </div>
          <button className="mt-6 px-6 py-3 border border-neutral-900 rounded-xl font-medium text-neutral-900">
            {t('property.showAllAmenities', { count: property.amenities.length })}
          </button>
        </div>

        <Divider />

        {/* Location Map */}
        <div className="py-6">
          <h2 className="text-lg font-semibold mb-4">{t('property.whereYouBe')}</h2>
          <div className="w-full h-[250px] bg-neutral-100 relative overflow-hidden rounded-2xl">
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
          </div>
          <p className="mt-3 font-medium text-neutral-900">{locationString}</p>
          <p className="text-sm text-neutral-600">{property.location}</p>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <>
            <Divider />
            <div className="py-6">
              <h2 className="text-lg font-semibold mb-4">{t('property.similarProperties')}</h2>
              <div className="space-y-4">
                {similarProperties.map((similarProperty) => (
                  <Link key={similarProperty.id} href={`/property/${similarProperty.id}`} className="flex gap-4 group">
                    <div className="relative w-24 h-20 flex-shrink-0 overflow-hidden rounded-xl">
                      <Image 
                        src={similarProperty.images[0]} 
                        alt={getLocalizedTitle(similarProperty, locale)} 
                        fill 
                        className="object-cover transition-transform group-hover:scale-105" 
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-neutral-500">{similarProperty.location.split(',')[0]}</p>
                      <h3 className="font-medium text-neutral-900 line-clamp-1">{getLocalizedTitle(similarProperty, locale)}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={12} className="fill-black" />
                        <span className="text-sm">{similarProperty.rating}</span>
                        <span className="text-sm text-neutral-400">({similarProperty.reviewCount})</span>
                      </div>
                      <p className="mt-1 font-semibold">${similarProperty.price.toLocaleString()} <span className="text-sm font-normal text-neutral-500">/{t('common.night')}</span></p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </Container>

      {/* Bottom Floating Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-4 z-40">
        <div className="flex items-center justify-between">
          <div>
            {!checkIn || !checkOut ? (
              <div>
                <p className="text-neutral-900">{t('property.addDates')}</p>
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-black" />
                  <span className="text-sm">{property.rating}</span>
                </div>
              </div>
            ) : bookingPrice ? (
              <div>
                <p className="text-lg font-semibold">${bookingPrice.total.toLocaleString()} CAD</p>
                <p className="text-sm text-neutral-600">{bookingPrice.nights} {t('common.nights')}</p>
              </div>
            ) : (
              <div>
                <p className="text-neutral-900">{t('property.addDates')}</p>
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-black" />
                  <span className="text-sm">{property.rating}</span>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleCheckAvailability}
            className="px-6 py-3.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-rose-700 transition-colors"
          >
            {t('property.checkAvailability')}
          </button>
        </div>
      </div>

      {/* Full Screen Calendar Modal */}
      <FullscreenCalendar
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        checkIn={checkIn}
        checkOut={checkOut}
        onSelectCheckIn={setCheckIn}
        onSelectCheckOut={setCheckOut}
        onClearDates={() => { setCheckIn(''); setCheckOut(''); }}
        pricePerNight={property.price}
        minNights={property.minNights || 1}
        rating={property.rating}
        currency="CAD"
      />

      {/* Review and Continue Modal */}
      <ReviewAndContinue
        isOpen={showReview}
        onClose={() => setShowReview(false)}
        onBack={() => { setShowReview(false); setShowCalendar(true); }}
        onNext={() => { setShowReview(false); setShowPayment(true); }}
        onChangeDates={() => { setShowReview(false); setShowCalendar(true); }}
        onChangeGuests={() => { /* Handle guest change */ }}
        property={{
          id: property.id,
          title: localizedTitle,
          image: property.images[0],
          rating: property.rating,
          reviewCount: property.reviewCount,
          isGuestFavourite: true,
        }}
        bookingDetails={{
          checkIn,
          checkOut,
          guests,
          pricePerNight: property.price,
          cleaningFee: bookingPrice?.cleaningFee || 80,
          serviceFee: bookingPrice?.serviceFee || 0,
          tax: bookingPrice?.tax || 0,
          total: bookingPrice?.total || 0,
          currency: 'CAD',
        }}
      />

      {/* Payment Method Modal */}
      <PaymentMethod
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onBack={() => { setShowPayment(false); setShowReview(true); }}
        onNext={(method) => {
          // Handle payment method selection
          console.log('Selected payment method:', method);
          setShowPayment(false);
          // Navigate to payment form or confirmation
        }}
      />

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
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900' 
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
