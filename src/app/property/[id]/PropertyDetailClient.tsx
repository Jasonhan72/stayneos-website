// Property Detail Page - Airbnb Style with Desktop Two-Column Layout
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
  Check,
  MapPin
} from 'lucide-react';
import { Container, Divider } from '@/components/ui';
import { AirbnbCalendar, ReviewAndContinue, PaymentMethod, calculateBookingPrice, GuestSelector, type GuestCounts } from '@/components/booking';
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
  const [guests, setGuests] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  
  // Guest breakdown state for GuestSelector
  const [guestBreakdown, setGuestBreakdown] = useState<GuestCounts>({
    adults: 1,
    children: 0,
    infants: 0,
  });

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

  // Desktop Booking Card Component
  const BookingCard = ({ isSticky = false }: { isSticky?: boolean }) => (
    <div className={`bg-white border border-neutral-200 rounded-2xl p-6 shadow-lg ${isSticky ? 'sticky top-24' : ''}`}>
      {/* Price Header */}
      <div className="flex items-baseline justify-between mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-neutral-900">${property.price.toLocaleString()}</span>
          <span className="text-neutral-500">CAD / {t('common.night')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star size={14} className="fill-black" />
          <span className="font-medium">{property.rating}</span>
          <span className="text-neutral-500">· {property.reviewCount} {t('property.reviews')}</span>
        </div>
      </div>

      {/* Date/Guest Selector Box */}
      <div className="border border-neutral-300 rounded-xl overflow-hidden mb-4">
        {/* Check-in / Check-out */}
        <div className="grid grid-cols-2 divide-x divide-neutral-300">
          <button 
            onClick={() => setShowCalendar(true)}
            className="p-3 text-left hover:bg-neutral-50 transition-colors"
          >
            <p className="text-xs font-semibold text-neutral-900 uppercase">Check-in</p>
            <p className="text-sm text-neutral-600 mt-1">
              {checkIn ? new Date(checkIn).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' }) : 'Add date'}
            </p>
          </button>
          <button 
            onClick={() => setShowCalendar(true)}
            className="p-3 text-left hover:bg-neutral-50 transition-colors"
          >
            <p className="text-xs font-semibold text-neutral-900 uppercase">Checkout</p>
            <p className="text-sm text-neutral-600 mt-1">
              {checkOut ? new Date(checkOut).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' }) : 'Add date'}
            </p>
          </button>
        </div>
        
        {/* Guests */}
        <button 
          onClick={() => setShowGuestSelector(true)}
          className="w-full p-3 text-left border-t border-neutral-300 hover:bg-neutral-50 transition-colors"
        >
          <p className="text-xs font-semibold text-neutral-900 uppercase">Guests</p>
          <p className="text-sm text-neutral-600 mt-1">{guests} {guests === 1 ? 'guest' : 'guests'}</p>
        </button>
      </div>

      {/* Check Availability / Reserve Button */}
      <button
        onClick={handleCheckAvailability}
        className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-rose-700 transition-colors mb-4"
      >
        {checkIn && checkOut ? 'Reserve' : t('property.checkAvailability')}
      </button>

      <p className="text-center text-neutral-500 text-sm mb-6">You won&apos;t be charged yet</p>

      {/* Price Breakdown */}
      {bookingPrice && (
        <div className="space-y-3 text-sm border-t border-neutral-100 pt-4">
          <div className="flex justify-between">
            <span className="text-neutral-600 underline">${property.price.toLocaleString()} x {bookingPrice.nights} nights</span>
            <span className="text-neutral-900">${(property.price * bookingPrice.nights).toLocaleString()}</span>
          </div>
          {bookingPrice.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Monthly stay discount</span>
              <span>-${bookingPrice.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-neutral-600 underline">Cleaning fee</span>
            <span className="text-neutral-900">${bookingPrice.cleaningFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600 underline">Service fee</span>
            <span className="text-neutral-900">${bookingPrice.serviceFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-neutral-200">
            <span className="font-semibold text-neutral-900">Total before taxes</span>
            <span className="font-semibold text-neutral-900">${bookingPrice.total.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Report */}
      <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-center gap-2 text-neutral-500 text-sm">
        <span className="underline"><MapPin size={14} className="inline" /> Report this listing</span>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white" suppressHydrationWarning>
      {/* Navigation Bar - Desktop & Mobile */}
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

      {/* Full Width Image Gallery - Desktop Grid / Mobile Carousel */}
      <div className="relative">
        {/* Mobile: Carousel */}
        <div className="md:hidden relative w-full aspect-[4/3] bg-neutral-100">
          <Image 
            src={property.images[currentImageIndex]} 
            alt={`${localizedTitle} - Image ${currentImageIndex + 1}`} 
            fill 
            priority 
            className="object-cover" 
          />
          
          {/* Image Counter */}
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

        {/* Desktop: Grid Gallery */}
        <div className="hidden md:block max-w-6xl mx-auto px-6 py-6">
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] rounded-xl overflow-hidden">
            {/* Main Large Image */}
            <div className="col-span-2 row-span-2 relative cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => setShowGallery(true)}
            >
              <Image 
                src={property.images[0]} 
                alt={localizedTitle}
                fill 
                priority 
                className="object-cover" 
              />
            </div>
            {/* Side Images */}
            {property.images.slice(1, 5).map((img, idx) => (
              <div 
                key={idx}
                className="relative cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => { setCurrentImageIndex(idx + 1); setShowGallery(true); }}
              >
                <Image 
                  src={img} 
                  alt={`${localizedTitle} - ${idx + 2}`}
                  fill 
                  className="object-cover" 
                />
                {idx === 3 && property.images.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-medium">+{property.images.length - 5} photos</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout on Desktop */}
      <Container className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2">
            {/* Title Section */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">{localizedTitle}</h1>
              <p className="text-neutral-600">{propertyType} · {locationString}</p>
              <p className="text-neutral-600 mt-1">{guestInfo}</p>
            </div>

            {/* Info Bar - Mobile Only */}
            <div className="flex md:hidden items-center justify-center gap-6 mb-6 py-4 border-y border-neutral-200">
              <div className="text-center">
                <p className="text-lg font-semibold">{property.rating}</p>
                <div className="flex justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="fill-black" />
                  ))}
                </div>
              </div>
              <div className="w-px h-10 bg-neutral-200" />
              <div className="text-center">
                <div className="flex justify-center gap-1">
                  <Trophy size={14} className="text-neutral-900" />
                  <Trophy size={14} className="text-neutral-900 transform rotate-180" />
                </div>
                <p className="text-sm font-medium">{t('property.guestFavourite')}</p>
              </div>
              <div className="w-px h-10 bg-neutral-200" />
              <div className="text-center">
                <p className="text-lg font-semibold">{property.reviewCount}</p>
                <p className="text-sm underline">{t('property.reviews')}</p>
              </div>
            </div>

            <Divider />

            {/* Host Info */}
            <div className="flex items-center gap-3 py-6">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-neutral-200">
                <Image 
                  src={mockHost.avatar} 
                  alt={mockHost.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
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
              <h2 className="text-xl font-semibold mb-4">{t('property.aboutPlace')}</h2>
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
              <button className="mt-4 font-medium underline">Show more</button>
            </div>

            <Divider />

            {/* Amenities */}
            <div className="py-6">
              <h2 className="text-xl font-semibold mb-4">{t('property.whatOffers')}</h2>
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
              <h2 className="text-xl font-semibold mb-4">{t('property.whereYouBe')}</h2>
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
              </div>
              <div className="mt-4">
                <p className="font-medium text-neutral-900">{locationString}</p>
                <p className="text-sm text-neutral-600">{property.location}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card (Desktop only) */}
          <div className="hidden lg:block">
            <BookingCard isSticky={true} />
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <>
            <Divider />
            <div className="py-6">
              <h2 className="text-xl font-semibold mb-6">{t('property.similarProperties')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarProperties.map((similarProperty) => (
                  <Link 
                    key={similarProperty.id} 
                    href={`/property/${similarProperty.id}`} 
                    className="group block"
                  >
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
                      <Image 
                        src={similarProperty.images[0]} 
                        alt={getLocalizedTitle(similarProperty, locale)} 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-neutral-900">{getLocalizedTitle(similarProperty, locale)}</h3>
                        <div className="flex items-center gap-1">
                          <Star size={12} className="fill-black" />
                          <span className="text-sm">{similarProperty.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-500">{similarProperty.location.split(',')[0]}</p>
                      <p className="mt-1">
                        <span className="font-semibold">${similarProperty.price.toLocaleString()}</span>
                        <span className="text-neutral-500"> CAD / night</span>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </Container>

      {/* Mobile Bottom Floating Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-4 z-40">
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

      {/* Calendar Modal */}
      {showCalendar && (
        <AirbnbCalendar 
          checkIn={checkIn}
          checkOut={checkOut}
          onSelectCheckIn={setCheckIn}
          onSelectCheckOut={setCheckOut}
          onClose={() => setShowCalendar(false)}
          onClearDates={() => {
            setCheckIn('');
            setCheckOut('');
          }}
          pricePerNight={property.price}
          minNights={property.minNights || 1}
          rating={property.rating}
          currency="CAD"
        />
      )}

      {/* Review and Continue Modal */}
      <ReviewAndContinue
        isOpen={showReview}
        onClose={() => setShowReview(false)}
        onBack={() => { setShowReview(false); setShowCalendar(true); }}
        onNext={() => { setShowReview(false); setShowPayment(true); }}
        onChangeDates={() => { setShowReview(false); setShowCalendar(true); }}
        onChangeGuests={() => setShowGuestSelector(true)}
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
          console.log('Selected payment method:', method);
          setShowPayment(false);
        }}
      />

      {/* Guest Selector Modal */}
      <GuestSelector
        isOpen={showGuestSelector}
        onClose={() => setShowGuestSelector(false)}
        onSave={(newGuests) => {
          setGuestBreakdown(newGuests);
          setGuests(newGuests.adults + newGuests.children);
        }}
        initialGuests={guestBreakdown}
        maxGuests={property?.maxGuests || 10}
        allowPets={false}
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
