// Property Detail Page - Blueground Style + Square UI
'use client';

import { useState, useMemo, useEffect } from 'react';
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
  User,
  Mail,
  Phone,
  AlertCircle,
  X
} from 'lucide-react';
import { Button, Container, Card, Badge, Divider, Modal } from '@/components/ui';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { getPropertyById, mockProperties } from '@/lib/data';
import { getLocalizedTitle, getLocalizedDescription } from '@/components/property/PropertyCard';
import { notFound } from 'next/navigation';
import { useAuth } from '@/lib/UserContext';
import { useI18n } from '@/lib/i18n';

interface PropertyDetailClientProps {
  propertyId: string;
  initialProperty?: ReturnType<typeof getPropertyById>;
  initialLocale?: string;
}

export default function PropertyDetailClient({ propertyId, initialProperty, initialLocale = 'en' }: PropertyDetailClientProps) {
  // All hooks must be called before any conditional returns
  const propertyFromStore = getPropertyById(propertyId);
  // Use initialProperty from SSR if available, otherwise fall back to client-side data
  const property = initialProperty || propertyFromStore;
  const { user, isAuthenticated } = useAuth();
  const { t, locale: contextLocale } = useI18n();
  
  // Client hydration state
  const [isMounted, setIsMounted] = useState(false);
  
  // Use initialLocale from SSR for hydration consistency, then sync with context
  const [effectiveLocale, setEffectiveLocale] = useState(initialLocale);
  
  // Sync with context locale when it changes (user manual switch)
  useEffect(() => {
    if (contextLocale && contextLocale !== effectiveLocale) {
      setEffectiveLocale(contextLocale);
    }
  }, [contextLocale]);
  
  // Image gallery state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  
  // Booking form state
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  
  // Mount detection
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Auto-fill user data effect
  useEffect(() => {
    if (isAuthenticated && user) {
      setName(user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [isAuthenticated, user]);
  
  // Get localized content - MUST be before conditional returns
  const localizedTitle = useMemo(() => {
    if (!property) return '';
    return getLocalizedTitle(property, effectiveLocale);
  }, [property, effectiveLocale]);
  
  const localizedDescription = useMemo(() => {
    if (!property) return '';
    return getLocalizedDescription(property, effectiveLocale);
  }, [property, effectiveLocale]);

  // Get similar properties - MUST be before conditional returns
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

  // Conditional returns after all hooks
  // FIX: Only check isMounted, not isLocaleLoading to prevent hydration issues
  if (!isMounted) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-500">Loading...</p>
        </div>
      </main>
    );
  }
  
  if (!property) {
    notFound();
  }

  // Calculate nights and pricing
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const nights = calculateNights();
  const isMonthly = nights >= 28;
  const discountRate = isMonthly && property.monthlyDiscount ? (100 - property.monthlyDiscount) / 100 : 1;
  const discountedPrice = Math.round(property.price * discountRate);
  const totalPrice = nights * discountedPrice;
  const serviceFee = Math.round(totalPrice * 0.1);
  const finalPrice = totalPrice + serviceFee;

  // Image navigation
  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!checkIn) {
      newErrors.checkIn = t('property.pleaseSelectCheckIn');
    }
    if (!checkOut) {
      newErrors.checkOut = t('property.pleaseSelectCheckOut');
    }
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      if (end <= start) {
        newErrors.checkOut = t('errors.checkOutAfterCheckIn');
      }
      if (property.minNights && nights < property.minNights) {
        newErrors.checkOut = t('properties.details.minNightsWarning', { count: property.minNights });
      }
    }
    if (!isAuthenticated) {
      if (!name.trim()) {
        newErrors.name = t('errors.required');
      }
      if (!email.trim()) {
        newErrors.email = t('errors.required');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = t('errors.invalidEmail');
      }
      if (!phone.trim()) {
        newErrors.phone = t('errors.required');
      } else if (!/^[\d\s\-\+\(\)]+$/.test(phone)) {
        newErrors.phone = t('errors.invalidPhone');
      }
    }
    if (guests < 1 || guests > property.maxGuests) {
      newErrors.guests = t('property.maxGuestsError', { min: 1, max: property.maxGuests });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle booking submission
  const handleBooking = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const finalGuestName = isAuthenticated 
        ? (user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()) 
        : name;
      const finalGuestEmail = isAuthenticated ? user?.email : email;
      const finalGuestPhone = isAuthenticated ? (user?.phone || phone) : phone;
      
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          propertyTitle: localizedTitle,
          checkIn,
          checkOut,
          nights,
          guests,
          basePrice: property.price,
          discountRate: isMonthly ? (property.monthlyDiscount || 0) : 0,
          discountAmount: isMonthly ? (property.price - discountedPrice) * nights : 0,
          serviceFee,
          totalPrice: finalPrice,
          guestName: finalGuestName,
          guestEmail: finalGuestEmail,
          guestPhone: finalGuestPhone,
          specialRequests,
          userId: isAuthenticated ? user?.id : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('booking.createBookingError'));
      }

      setShowBookingSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('booking.createBookingError');
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white" suppressHydrationWarning>
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-neutral-200">
        <Container>
          <div className="flex items-center justify-between h-16">
            <Link href="/properties" className="flex items-center text-neutral-600 hover:text-neutral-900">
              <ChevronLeft size={20} />
              <span className="ml-1 hidden sm:inline">{t('properties.details.backToList')}</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="p-2 hover:bg-neutral-100 transition-colors"
              >
                <Heart
                  size={20}
                  className={isLiked ? 'fill-error text-error' : 'text-neutral-600'}
                />
              </button>
              <button
                onClick={async () => {
                  const shareUrl = `${window.location.origin}/property/${propertyId}`;
                  const shareData = {
                    title: localizedTitle,
                    text: `${t('property.shareText')}: ${localizedTitle} - ${property.location}`,
                    url: shareUrl,
                  };
                  
                  if (navigator.share) {
                    try {
                      await navigator.share(shareData);
                    } catch {
                      // User cancelled share, ignore
                    }
                  } else {
                    try {
                      await navigator.clipboard.writeText(shareUrl);
                      alert(t('property.linkCopied'));
                    } catch {
                      const textArea = document.createElement('textarea');
                      textArea.value = shareUrl;
                      document.body.appendChild(textArea);
                      textArea.select();
                      document.execCommand('copy');
                      document.body.removeChild(textArea);
                      alert(t('property.linkCopied'));
                    }
                  }
                }}
                className="p-2 hover:bg-neutral-100 transition-colors"
              >
                <Share size={20} className="text-neutral-600" />
              </button>
            </div>
          </div>
        </Container>
      </nav>

      {/* Image Gallery - Main Display */}
      <div className="bg-neutral-100">
        <Container>
          <div className="py-4">
            <div className="relative aspect-[16/9] max-h-[60vh] bg-neutral-200 overflow-hidden cursor-pointer"
                 onClick={() => setShowGallery(true)}>
              <Image
                src={property.images[currentImageIndex]}
                alt={`${localizedTitle} - ${t('property.image')} ${currentImageIndex + 1}`}
                fill
                priority
                className="object-cover"
              />
              
              <button 
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white transition-colors shadow-lg"
              >
                <ChevronLeft size={24} />
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white transition-colors shadow-lg"
              >
                <ChevronRight size={24} />
              </button>
              
              <div className="absolute bottom-4 right-4 px-4 py-2 bg-neutral-900/80 text-white text-sm">
                {currentImageIndex + 1} / {property.images.length}
              </div>
              
              <button
                onClick={(e) => { e.stopPropagation(); setShowGallery(true); }}
                className="absolute bottom-4 left-4 px-4 py-2 bg-white text-neutral-900 text-sm font-medium hover:bg-neutral-100 transition-colors"
              >
                {t('property.viewAllImages', { count: property.images.length })}
              </button>
            </div>

            <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => selectImage(index)}
                  className={`relative flex-shrink-0 w-24 h-16 overflow-hidden transition-all ${
                    index === currentImageIndex 
                      ? 'ring-2 ring-primary ring-offset-2' 
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${t('property.thumbnail')} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Info */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
                  {localizedTitle}
                </h1>
                <div className="flex items-center gap-1 shrink-0">
                  <Star size={18} className="text-accent fill-accent" />
                  <span className="font-medium">{property.rating}</span>
                  <span className="text-neutral-400">({property.reviewCount} {t('properties.details.reviews')})</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-neutral-600">
                <MapPin size={18} />
                <span>{property.location}</span>
              </div>
            </div>

            <Divider className="my-6" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-neutral-50 border border-neutral-200">
                <Users className="text-primary" size={24} />
                <div>
                  <div className="font-medium">{property.maxGuests} {t('common.people')}</div>
                  <div className="text-sm text-neutral-500">{t('property.maxGuestsLabel')}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-neutral-50 border border-neutral-200">
                <Bed className="text-primary" size={24} />
                <div>
                  <div className="font-medium">{property.bedrooms} {t('property.bedroomsUnit')}</div>
                  <div className="text-sm text-neutral-500">{t('property.bedroomsLabel')}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-neutral-50 border border-neutral-200">
                <Bath className="text-primary" size={24} />
                <div>
                  <div className="font-medium">{property.bathrooms} {t('property.bathroomsUnit')}</div>
                  <div className="text-sm text-neutral-500">{t('property.bathroomsLabel')}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-neutral-50 border border-neutral-200">
                <Maximize className="text-primary" size={24} />
                <div>
                  <div className="font-medium">{property.area} m²</div>
                  <div className="text-sm text-neutral-500">{t('property.areaLabel')}</div>
                </div>
              </div>
            </div>

            <Divider className="my-6" />

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">{t('properties.details.description')}</h2>
              <div className="text-neutral-600 whitespace-pre-line leading-relaxed">
                {localizedDescription || t('property.defaultDescription', { location: property.location, bedrooms: property.bedrooms, bathrooms: property.bathrooms, area: property.area, maxGuests: property.maxGuests })}
              </div>
            </div>

            <Divider className="my-6" />

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">{t('properties.details.amenities')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-neutral-700 p-3 bg-neutral-50">
                    <Check size={18} className="text-success" />
                    {t(`amenities.${item}`) || item}
                  </div>
                ))}
              </div>
            </div>

            <Divider className="my-6" />

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">{t('properties.details.location')}</h2>
              <div className="w-full h-[350px] bg-neutral-100 relative overflow-hidden rounded-lg">
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
                
                <div className="absolute bottom-4 left-4 bg-white p-4 shadow-lg rounded-lg max-w-xs">
                  <h4 className="font-semibold text-neutral-900 mb-1">{localizedTitle}</h4>
                  <p className="text-sm text-neutral-600">{property.location}</p>
                  <a 
                    href={`https://maps.google.com/?q=${encodeURIComponent(property.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-primary hover:text-primary-700 font-medium mt-2"
                  >
                    {t('contact.openInMaps')}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>

            {similarProperties.length > 0 && (
              <>
                <Divider className="my-6" />
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">{t('property.similarProperties')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {similarProperties.map((similarProperty) => (
                      <Link 
                        key={similarProperty.id} 
                        href={`/property/${similarProperty.id}`}
                        className="group"
                      >
                        <Card className="flex gap-4 p-4 hover:shadow-lg transition-shadow">
                          <div className="relative w-32 h-24 flex-shrink-0 overflow-hidden">
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
                            <p className="text-sm text-neutral-500 line-clamp-1 mt-1">
                              {similarProperty.location}
                            </p>
                            <div className="flex items-center gap-1 mt-2">
                              <Star size={14} className="text-accent fill-accent" />
                              <span className="text-sm">{similarProperty.rating}</span>
                              <span className="text-sm text-neutral-400">({similarProperty.reviewCount})</span>
                            </div>
                            <div className="mt-2 font-semibold text-neutral-900">
                              ${similarProperty.price} <span className="text-sm font-normal text-neutral-500">{t('property.perNight')}</span>
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
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="p-6 border border-neutral-200">
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-neutral-900">
                    ${property.price}
                  </span>
                  <span className="text-neutral-500">CAD {t('property.perNight')}</span>
                </div>

                {property.monthlyDiscount && property.monthlyDiscount > 0 && (
                  <Badge variant="primary" className="mb-4">
                    {t('property.monthlyDiscountLabel', { percent: property.monthlyDiscount })}
                  </Badge>
                )}

                {property.minNights && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-sm text-amber-800">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} />
                      <span className="font-medium">{t('property.minNightsLabel', { count: property.minNights })}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      {t('property.checkInOutDates')}
                    </label>
                    <DateRangePicker
                      checkIn={checkIn}
                      checkOut={checkOut}
                      onCheckInChange={setCheckIn}
                      onCheckOutChange={setCheckOut}
                      minNights={property.minNights || 1}
                    />
                    {(errors.checkIn || errors.checkOut) && (
                      <p className="text-xs text-error mt-1">
                        {errors.checkIn || errors.checkOut}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      {t('property.guestCount')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                      <select
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className={`w-full pl-9 pr-3 py-2.5 border text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white ${
                          errors.guests ? 'border-error' : 'border-neutral-300'
                        }`}
                      >
                        {Array.from({ length: property.maxGuests }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>{num} {t('property.guestsUnit')}</option>
                        ))}
                      </select>
                    </div>
                    {errors.guests && <p className="text-xs text-error mt-1">{errors.guests}</p>}
                  </div>

                  {isAuthenticated === false && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">{t('property.yourName')}</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('property.yourName')}
                            className={`w-full pl-9 pr-3 py-2.5 border text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                              errors.name ? 'border-error' : 'border-neutral-300'
                            }`}
                          />
                        </div>
                        {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">{t('property.email')}</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className={`w-full pl-9 pr-3 py-2.5 border text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                              errors.email ? 'border-error' : 'border-neutral-300'
                            }`}
                          />
                        </div>
                        {errors.email && <p className="text-xs text-error mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">{t('property.phone')}</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (xxx) xxx-xxxx"
                            className={`w-full pl-9 pr-3 py-2.5 border text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                              errors.phone ? 'border-error' : 'border-neutral-300'
                            }`}
                          />
                        </div>
                        {errors.phone && <p className="text-xs text-error mt-1">{errors.phone}</p>}
                      </div>
                    </>
                  )}
                  
                  {isAuthenticated === true && user && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-neutral-900">{t('booking.loggedInAccount')}</span>
                      </div>
                      <p className="text-sm text-neutral-600">{user.name || user.email}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">{t('property.specialRequests')}</label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder={t('property.specialRequestsPlaceholder')}
                      rows={3}
                      className="w-full px-3 py-2.5 border border-neutral-300 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    />
                  </div>
                </div>

                {nights > 0 && (
                  <div className="mb-4 p-4 bg-neutral-50 border border-neutral-200 text-sm">
                    <div className="space-y-2">
                      {isMonthly && property.monthlyDiscount ? (
                        <>
                          <div className="flex justify-between text-neutral-500">
                            <span className="line-through">{t('property.originalPrice')} ${property.price.toLocaleString()} CAD</span>
                          </div>
                          <div className="flex justify-between text-success">
                            <span>{t('property.monthlyPrice')} ${discountedPrice.toLocaleString()} x {nights}{t('common.nights')}</span>
                            <span>${totalPrice.toLocaleString()} CAD</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-neutral-600">${property.price.toLocaleString()} x {nights}{t('common.nights')}</span>
                          <span>${totalPrice.toLocaleString()} CAD</span>
                        </div>
                      )}
                      <div className="flex justify-between text-neutral-600">
                        <span>{t('property.serviceFee')}</span>
                        <span>${serviceFee.toLocaleString()} CAD</span>
                      </div>
                      <Divider className="my-2" />
                      <div className="flex justify-between font-semibold text-base">
                        <span>{t('properties.details.total')}</span>
                        <span>${finalPrice.toLocaleString()} CAD</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  size="lg"
                  isLoading={isSubmitting}
                  onClick={handleBooking}
                >
                  {isSubmitting ? t('common.loading') : t('properties.details.bookNow')}
                </Button>
                <p className="text-center text-sm text-neutral-500 mt-3">{t('booking.youWontBeCharged')}</p>
              </Card>
            </div>
          </div>
        </div>
      </Container>

      {/* Full Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-neutral-900">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 bg-neutral-900">
              <h3 className="text-white font-medium">
                {currentImageIndex + 1} / {property.images.length}
              </h3>
              <button 
                onClick={() => setShowGallery(false)}
                className="p-2 text-white hover:bg-neutral-800 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 relative flex items-center justify-center">
              <Image
                src={property.images[currentImageIndex]}
                alt={`${localizedTitle} - ${t('property.image')} ${currentImageIndex + 1}`}
                fill
                className="object-contain"
              />
              
              <button 
                onClick={prevImage}
                className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronLeft size={32} />
              </button>
              
              <button 
                onClick={nextImage}
                className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronRight size={32} />
              </button>
            </div>
            
            <div className="p-4 bg-neutral-900">
              <div className="flex gap-2 overflow-x-auto justify-center">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => selectImage(index)}
                    className={`relative flex-shrink-0 w-20 h-14 overflow-hidden transition-all ${
                      index === currentImageIndex 
                        ? 'ring-2 ring-accent ring-offset-2 ring-offset-neutral-900' 
                        : 'opacity-50 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${t('property.thumbnail')} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Success Modal */}
      <Modal
        isOpen={showBookingSuccess}
        onClose={() => setShowBookingSuccess(false)}
        title={t('property.bookingSuccessTitle')}
        footer={
          <Button onClick={() => setShowBookingSuccess(false)}>
            {t('common.ok')}
          </Button>
        }
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-success/10 flex items-center justify-center">
            <Check size={32} className="text-success" />
          </div>
          <p className="text-neutral-600">{t('property.bookingSuccessMessage')}</p>
          <div className="mt-4 p-4 bg-neutral-50 text-left text-sm">
            <p><strong>{t('property.property')}</strong>{localizedTitle}</p>
            <p><strong>{t('booking.checkIn')}</strong>{checkIn}</p>
            <p><strong>{t('booking.checkOut')}</strong>{checkOut}</p>
            <p><strong>{t('property.guests')}</strong>{guests}{t('common.people')}</p>
            {isAuthenticated && user && (
              <>
                <p><strong>{t('property.bookedBy')}</strong>{user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()}</p>
                <p><strong>{t('property.contactEmail')}</strong>{user.email}</p>
              </>
            )}
            <p><strong>{t('property.totalPrice')}</strong>${finalPrice.toLocaleString()} CAD</p>
          </div>
        </div>
      </Modal>
    </main>
  );
}
