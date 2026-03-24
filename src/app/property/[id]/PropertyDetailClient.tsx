// Property Detail Page - Airbnb Style with Desktop Two-Column Layout (使用真实 API)
'use client';

import { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { Container, Divider } from '@/components/ui';
import { Skeleton } from '@/components/ui/Skeleton';
import { ApiErrorAlert } from '@/components/error';
import { ReviewAndContinue, PaymentMethod, GuestSelector, type GuestCounts } from '@/components/booking';
// CardDetailsForm removed - PCI compliance: all card input handled by Stripe Elements
import { useI18n } from '@/lib/i18n';
import { useWishlist } from '@/lib/context/WishlistContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useProperty } from '@/hooks/useProperties';
import { PropertyCardData } from '@/types';
import { getPropertyLocation } from '@/lib/utils/property-transform';
import { calculateBookingPrice } from '@/lib/booking';

interface PropertyDetailClientProps {
  propertyId: string;
  initialProperty?: PropertyCardData;
}

// Mock host data（后续可从 API 获取）

type PropertyFacts = {
  pricing: string;
  layout: string;
  allInclusive: string;
  building: string;
  location: string;
  minimumStay: string;
  extra?: string;
};

type PropertyLocationDetails = PropertyCardData & {
  city?: string;
  neighborhood?: string;
  nearestSubway?: string | null;
  subwayWalkMinutes?: number | null;
  nearbyLandmarks?: string[];
};

const PROPERTY_FACTS: Record<string, Record<string, PropertyFacts>> = {
  en: {
    'prop-55-cooper': {
      pricing: 'Monthly $8,000-10,000 · Quarterly (3-6 months) $7,500-9,000 · Annual (12 months) $6,500-8,000',
      layout: '3BR/2BA · approx. 1,200 sqft · 55+ floors',
      allInclusive: 'WiFi, hydro/water/gas/heating, basic cable, full kitchenware, linens/towels, bi-weekly cleaning, and building amenities.',
      building: 'Pool, gym, 24-hour concierge, visitor parking, and party room.',
      location: '8-minute walk to Union Station · 5-minute walk to Financial District.',
      minimumStay: 'Minimum stay 30 days · Smart lock self check-in.',
      extra: 'Developer: Menkes · Building year: 2024.',
    },
    '55-cooper-st-sugar-wharf': {
      pricing: 'Monthly $8,000-10,000 · Quarterly (3-6 months) $7,500-9,000 · Annual (12 months) $6,500-8,000',
      layout: '3BR/2BA · approx. 1,200 sqft · 55+ floors',
      allInclusive: 'WiFi, hydro/water/gas/heating, basic cable, full kitchenware, linens/towels, bi-weekly cleaning, and building amenities.',
      building: 'Pool, gym, 24-hour concierge, visitor parking, and party room.',
      location: '8-minute walk to Union Station · 5-minute walk to Financial District.',
      minimumStay: 'Minimum stay 30 days · Smart lock self check-in.',
      extra: 'Developer: Menkes · Building year: 2024.',
    },
    'prop-238-simcoe': {
      pricing: 'Monthly $6,500-8,000 · Quarterly $6,000-7,000 · Annual $5,500-6,500',
      layout: '3BR/2BA',
      allInclusive: 'WiFi, hydro/water/gas/heating, basic cable, full kitchenware, linens/towels, bi-weekly cleaning, and building amenities.',
      building: 'Gym, lobby concierge, and mail room.',
      location: '3-minute walk to St. Patrick/Osgoode subway · Walkable to major hospitals and UofT.',
      minimumStay: 'Minimum stay 30 days · Smart lock self check-in.',
    },
    '238-simcoe-st-grange-park': {
      pricing: 'Monthly $6,500-8,000 · Quarterly $6,000-7,000 · Annual $5,500-6,500',
      layout: '3BR/2BA',
      allInclusive: 'WiFi, hydro/water/gas/heating, basic cable, full kitchenware, linens/towels, bi-weekly cleaning, and building amenities.',
      building: 'Gym, lobby concierge, and mail room.',
      location: '3-minute walk to St. Patrick/Osgoode subway · Walkable to major hospitals and UofT.',
      minimumStay: 'Minimum stay 30 days · Smart lock self check-in.',
    },
  },
  zh: {
    'prop-55-cooper': {
      pricing: '月租 $8,000-10,000 · 季租（3-6个月）$7,500-9,000 · 年租（12个月）$6,500-8,000',
      layout: '3室2卫 · 约 1,200 平方英尺 · 55+ 层',
      allInclusive: '包含 WiFi、水电气暖、基础有线电视、全套厨具、床品毛巾、双周保洁及楼宇配套。',
      building: '泳池、健身房、24 小时礼宾、访客停车位和派对室。',
      location: '步行 8 分钟到 Union Station · 步行 5 分钟到金融区。',
      minimumStay: '最短入住 30 天 · 智能门锁自助入住。',
      extra: '开发商：Menkes · 建成时间：2024 年。',
    },
    '55-cooper-st-sugar-wharf': {
      pricing: '月租 $8,000-10,000 · 季租（3-6个月）$7,500-9,000 · 年租（12个月）$6,500-8,000',
      layout: '3室2卫 · 约 1,200 平方英尺 · 55+ 层',
      allInclusive: '包含 WiFi、水电气暖、基础有线电视、全套厨具、床品毛巾、双周保洁及楼宇配套。',
      building: '泳池、健身房、24 小时礼宾、访客停车位和派对室。',
      location: '步行 8 分钟到 Union Station · 步行 5 分钟到金融区。',
      minimumStay: '最短入住 30 天 · 智能门锁自助入住。',
      extra: '开发商：Menkes · 建成时间：2024 年。',
    },
    'prop-238-simcoe': {
      pricing: '月租 $6,500-8,000 · 季租 $6,000-7,000 · 年租 $5,500-6,500',
      layout: '3室2卫',
      allInclusive: '包含 WiFi、水电气暖、基础有线电视、全套厨具、床品毛巾、双周保洁及楼宇配套。',
      building: '健身房、大堂礼宾和信件收发室。',
      location: '步行 3 分钟到 St. Patrick/Osgoode 地铁站 · 可步行到主要医院和多伦多大学。',
      minimumStay: '最短入住 30 天 · 智能门锁自助入住。',
    },
    '238-simcoe-st-grange-park': {
      pricing: '月租 $6,500-8,000 · 季租 $6,000-7,000 · 年租 $5,500-6,500',
      layout: '3室2卫',
      allInclusive: '包含 WiFi、水电气暖、基础有线电视、全套厨具、床品毛巾、双周保洁及楼宇配套。',
      building: '健身房、大堂礼宾和信件收发室。',
      location: '步行 3 分钟到 St. Patrick/Osgoode 地铁站 · 可步行到主要医院和多伦多大学。',
      minimumStay: '最短入住 30 天 · 智能门锁自助入住。',
    },
  },
  fr: {
    'prop-55-cooper': {
      pricing: 'Mensuel 8 000-10 000 $ · Trimestriel (3-6 mois) 7 500-9 000 $ · Annuel (12 mois) 6 500-8 000 $',
      layout: '3 ch./2 sdb · env. 1 200 pi² · plus de 55 étages',
      allInclusive: 'Inclus : WiFi, électricité/eau/gaz/chauffage, câble de base, cuisine entièrement équipée, draps/serviettes, ménage bihebdomadaire et commodités de l’immeuble.',
      building: 'Piscine, gym, concierge 24 h, stationnement visiteurs et salle de réception.',
      location: 'À 8 minutes à pied de Union Station · À 5 minutes du quartier financier.',
      minimumStay: 'Séjour minimum de 30 jours · Arrivée autonome avec serrure intelligente.',
      extra: 'Promoteur : Menkes · Année de construction : 2024.',
    },
    '55-cooper-st-sugar-wharf': {
      pricing: 'Mensuel 8 000-10 000 $ · Trimestriel (3-6 mois) 7 500-9 000 $ · Annuel (12 mois) 6 500-8 000 $',
      layout: '3 ch./2 sdb · env. 1 200 pi² · plus de 55 étages',
      allInclusive: 'Inclus : WiFi, électricité/eau/gaz/chauffage, câble de base, cuisine entièrement équipée, draps/serviettes, ménage bihebdomadaire et commodités de l’immeuble.',
      building: 'Piscine, gym, concierge 24 h, stationnement visiteurs et salle de réception.',
      location: 'À 8 minutes à pied de Union Station · À 5 minutes du quartier financier.',
      minimumStay: 'Séjour minimum de 30 jours · Arrivée autonome avec serrure intelligente.',
      extra: 'Promoteur : Menkes · Année de construction : 2024.',
    },
    'prop-238-simcoe': {
      pricing: 'Mensuel 6 500-8 000 $ · Trimestriel 6 000-7 000 $ · Annuel 5 500-6 500 $',
      layout: '3 ch./2 sdb',
      allInclusive: 'Inclus : WiFi, électricité/eau/gaz/chauffage, câble de base, cuisine entièrement équipée, draps/serviettes, ménage bihebdomadaire et commodités de l’immeuble.',
      building: 'Gym, concierge du hall et salle du courrier.',
      location: 'À 3 minutes à pied du métro St. Patrick/Osgoode · Accès à pied aux principaux hôpitaux et à l’Université de Toronto.',
      minimumStay: 'Séjour minimum de 30 jours · Arrivée autonome avec serrure intelligente.',
    },
    '238-simcoe-st-grange-park': {
      pricing: 'Mensuel 6 500-8 000 $ · Trimestriel 6 000-7 000 $ · Annuel 5 500-6 500 $',
      layout: '3 ch./2 sdb',
      allInclusive: 'Inclus : WiFi, électricité/eau/gaz/chauffage, câble de base, cuisine entièrement équipée, draps/serviettes, ménage bihebdomadaire et commodités de l’immeuble.',
      building: 'Gym, concierge du hall et salle du courrier.',
      location: 'À 3 minutes à pied du métro St. Patrick/Osgoode · Accès à pied aux principaux hôpitaux et à l’Université de Toronto.',
      minimumStay: 'Séjour minimum de 30 jours · Arrivée autonome avec serrure intelligente.',
    },
  },
};


const mockHost = {
  name: 'NEOS',
  avatar: '/logo.png',
  isSuperhost: true,
  yearsHosting: 2,
};

const AirbnbCalendar = dynamic(() => import('@/components/booking').then((mod) => mod.AirbnbCalendar), {
  ssr: false,
  loading: () => null,
});

export default function PropertyDetailClient({ propertyId }: PropertyDetailClientProps) {
  const { t, locale } = useI18n();
  const { formatPrice: fp } = useCurrency();
  const router = useRouter();
  const { property, isLoading, error } = useProperty(propertyId);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const isLiked = isWishlisted(propertyId);
  const [showGallery, setShowGallery] = useState(false);
  
  // Mobile carousel scroll ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle scroll to update current image index
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const containerWidth = scrollContainerRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / containerWidth);
      setCurrentImageIndex(Math.max(0, Math.min(newIndex, imageUrls.length - 1)));
    }
  };

  // Booking state
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  // showCardForm removed - card input now handled by Stripe Elements
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const [showPaymentNotice, setShowPaymentNotice] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string>('');
  
  // Guest breakdown state for GuestSelector
  const [guestBreakdown, setGuestBreakdown] = useState<GuestCounts>({
    adults: 1,
    children: 0,
    infants: 0,
  });

  // 转换 API 数据为组件格式
  const propertyCardData = useMemo(() => {
    if (!property) return null;
    return property;
  }, [property]);

  const localizedTitle = useMemo(() => {
    if (!propertyCardData) return '';
    switch (locale) {
      case 'zh':
        return propertyCardData.titleZh || propertyCardData.title;
      case 'fr':
        return propertyCardData.titleFr || propertyCardData.title;
      default:
        return propertyCardData.title;
    }
  }, [propertyCardData, locale]);

  const localizedFacts = useMemo(() => {
    const languageFacts = PROPERTY_FACTS[locale] || PROPERTY_FACTS.en;
    return languageFacts[propertyId] || PROPERTY_FACTS.en[propertyId];
  }, [locale, propertyId]);

  const localizedDescription = useMemo(() => {
    if (!propertyCardData) return '';
    switch (locale) {
      case 'zh':
        return propertyCardData.descriptionZh || propertyCardData.description;
      case 'fr':
        return propertyCardData.descriptionFr || propertyCardData.description;
      default:
        return propertyCardData.description;
    }
  }, [propertyCardData, locale]);

  // 从 API 获取 amenities 列表
  const amenities = useMemo(() => {
    if (!property?.amenities) return [];
    return property.amenities;
  }, [property]);

  const propertyDetails = propertyCardData as PropertyLocationDetails;

  // Calculate booking price from single source of truth
  const bookingPrice = useMemo(() => {
    if (!propertyCardData || !checkIn || !checkOut) return null;
    return calculateBookingPrice(propertyCardData, checkIn, checkOut);
  }, [propertyCardData, checkIn, checkOut]);

  // Loading state
  if (isLoading) {
    return <Skeleton.PropertyDetail />;
  }

  // Error state
  if (error || !property || !propertyCardData) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-12">
        <Container>
          <ApiErrorAlert 
            error={error || new Error('Property not found')}
            onRetry={() => window.location.reload()}
          />
          <div className="mt-6 text-center">
            <Link 
              href="/properties"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ChevronLeft size={18} />
              {t('common.backToList')}
            </Link>
          </div>
        </Container>
      </div>
    );
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
  const propertyType = propertyCardData.bedrooms <= 1 ? t('property.entireCondo') : t('property.entireHome');
  const locationShort = getPropertyLocation(propertyCardData);
  
  // Format guest info
  const guestInfo = t('property.guestInfo', { 
    maxGuests: propertyCardData.maxGuests, 
    bedrooms: propertyCardData.bedrooms, 
    beds: propertyCardData.bedrooms, 
    bathrooms: propertyCardData.bathrooms 
  });

  const tierPrices = (() => {
    const monthly = propertyCardData?.price || 0;
    const quarterly = Number((propertyCardData as unknown as { priceQuarterly?: number })?.priceQuarterly || 0) || Math.round(monthly * 0.92);
    const annual = Number((propertyCardData as unknown as { priceAnnual?: number })?.priceAnnual || 0) || Math.round(monthly * 0.85);
    return { monthly, quarterly, annual };
  })();

  const handleCheckAvailability = () => {
    if (!checkIn || !checkOut) {
      setBookingError(t('booking.validation.selectDates', 'Please select check-in and check-out dates'));
      setShowCalendar(true);
      return;
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
      setBookingError(t('booking.validation.invalidRange', 'Check-out must be after check-in'));
      setShowCalendar(true);
      return;
    }

    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const minNights = propertyCardData.minNights || 1;
    if (nights < minNights) {
      setBookingError(t('booking.validation.minNights', 'Minimum {count} nights required', { count: minNights }));
      setShowCalendar(true);
      return;
    }

    setBookingError('');
    // Navigate to the booking page with Stripe payment integration
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: guests.toString(),
    });
    router.push(`/booking/${propertyId}?${params.toString()}`);
  };

  // 获取图片 URL 列表 - 使用可选链避免条件调用 hook
  const imageUrls = property.images?.length 
    ? property.images.filter(Boolean)
    : ['/images/placeholder-property.jpg'];

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/property/${propertyId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: localizedTitle,
          text: `Check out this property: ${localizedTitle} - ${locationShort}`,
          url: shareUrl,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert(t('property.linkCopied'));
      } catch {}
    }
  };

  const neighborhoodName = propertyDetails.neighborhood || 'Downtown Toronto';
  const nearestSubway = propertyDetails.nearestSubway || 'Union Station';
  const subwayWalkMinutes = propertyDetails.subwayWalkMinutes ?? 10;
  const nearbyLandmarks = propertyDetails.nearbyLandmarks?.filter(Boolean) || [];

  // Build a natural paragraph like Airbnb
  const neighborhoodParagraph = (() => {
    const parts: string[] = [];
    parts.push(t('property.neighborhoodIntro', 'At this location, you\'ll find all that {neighborhood} has to offer right outside your door.', { neighborhood: neighborhoodName }));
    if (nearestSubway) {
      parts.push(t('property.neighborhoodSubway', 'The nearest subway station is {station}, just a {minutes}-minute walk away.', { station: nearestSubway, minutes: String(subwayWalkMinutes) }));
    }
    if (nearbyLandmarks.length > 0) {
      parts.push(t('property.neighborhoodLandmarks', 'Nearby highlights include {landmarks}.', { landmarks: nearbyLandmarks.join(', ') }));
    } else {
      parts.push(t('property.neighborhoodDefaultHighlights', 'You\'ll discover great restaurants, cafes, and shopping within walking distance. The Eaton Centre, Queen Street shopping and entertainment, and the Financial District are all close by.'));
    }
    parts.push(t('property.neighborhoodGrocery', 'For groceries, pharmacies, and daily essentials, there are multiple options within a short walk.'));
    return parts.join(' ');
  })();

  // Desktop Booking Card Component
  const BookingCard = ({ isSticky = false }: { isSticky?: boolean }) => (
    <div className={`bg-white border border-neutral-200 rounded-2xl p-6 shadow-lg ${isSticky ? 'sticky top-24' : ''}`}>
      {/* Price Header */}
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-2xl font-bold text-neutral-900">
          {t('property.fromPrice', 'From ${price}/Mo', { price: fp(propertyCardData.price).replace(/[$€¥]/, '') })}
        </span>
        {propertyCardData.reviewCount > 0 && (
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-black" />
            <span className="font-medium">{propertyCardData.rating}</span>
            <span className="text-neutral-500">· {propertyCardData.reviewCount} {t('property.reviews')}</span>
          </div>
        )}
      </div>

      <div className="mb-4 rounded-xl border border-neutral-200 p-3 bg-neutral-50">
        <div className="flex items-center justify-between text-sm"><span className="text-neutral-600">{t('property.monthly', 'Monthly')}</span><span className="font-semibold text-neutral-900">{fp(tierPrices.monthly)}/Mo</span></div>
        <div className="flex items-center justify-between text-sm mt-1"><span className="text-neutral-600">{t('property.quarterly', 'Quarterly')} (3 {t('common.months', 'mo')})</span><span className="font-medium text-neutral-900">{fp(tierPrices.quarterly)}/Mo</span></div>
        <div className="flex items-center justify-between text-sm mt-1"><span className="text-neutral-600">{t('property.annual', 'Annual')} (12 {t('common.months', 'mo')})</span><span className="font-medium text-neutral-900">{fp(tierPrices.annual)}/Mo</span></div>
      </div>

      {/* Date/Guest Selector Box */}
      <div className="border border-neutral-300 rounded-xl overflow-hidden mb-4">
        {/* {t('booking.checkIn', 'Check-in')} / Check-out */}
        <div className="grid grid-cols-2 divide-x divide-neutral-300">
          <button 
            onClick={() => setShowCalendar(true)}
            className="p-3 text-left hover:bg-neutral-50 transition-colors"
          >
            <p className="text-xs font-semibold text-neutral-900 uppercase">{t('booking.checkIn', 'Check-in')}</p>
            <p className="text-sm text-neutral-600 mt-1">
              {checkIn ? new Date(checkIn).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' }) : t('booking.addDate')}
            </p>
          </button>
          <button 
            onClick={() => setShowCalendar(true)}
            className="p-3 text-left hover:bg-neutral-50 transition-colors"
          >
            <p className="text-xs font-semibold text-neutral-900 uppercase">{t('booking.checkOut', 'Checkout')}</p>
            <p className="text-sm text-neutral-600 mt-1">
              {checkOut ? new Date(checkOut).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' }) : t('booking.addDate')}
            </p>
          </button>
        </div>
        
        {/* {t('booking.guests', 'Guests')} */}
        <button 
          onClick={() => setShowGuestSelector(true)}
          className="w-full p-3 text-left border-t border-neutral-300 hover:bg-neutral-50 transition-colors"
        >
          <p className="text-xs font-semibold text-neutral-900 uppercase">{t('booking.guests', 'Guests')}</p>
          <p className="text-sm text-neutral-600 mt-1">{guests} {guests === 1 ? t('booking.guestSingular') : t('booking.guestsPlural')}</p>
        </button>
      </div>

      {/* Check Availability / Reserve Button */}
      <button
        onClick={handleCheckAvailability}
        className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-rose-700 transition-colors mb-4"
      >
        {checkIn && checkOut ? t('property.reserve', 'Reserve') : t('property.checkAvailability')}
      </button>

      <p className="text-center text-neutral-500 text-sm mb-6">{t('booking.youWontBeCharged')}</p>
      {bookingError ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{bookingError}</p>
      ) : null}

      {/* Price Breakdown */}
      {bookingPrice && (
        <div className="space-y-3 text-sm border-t border-neutral-100 pt-4">
          <div className="flex justify-between">
            <span className="text-neutral-600 underline">{fp(bookingPrice.ratePerMonth)} x {bookingPrice.months} {t('booking.months', { count: bookingPrice.months })} ({bookingPrice.tierName})</span>
            <span className="text-neutral-900">{fp(bookingPrice.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">{t('booking.taxes', 'Taxes')} (13%)</span>
            <span className="text-neutral-900">{fp(bookingPrice.tax)}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-neutral-200">
            <span className="font-semibold text-neutral-900">{t('property.totalBeforeTaxes', 'Total')}</span>
            <span className="font-semibold text-neutral-900">{fp(bookingPrice.total)}</span>
          </div>
          <p className="text-xs text-neutral-500 text-center pt-2">
            {t('booking.allInclusive', 'All-inclusive pricing: WiFi, utilities, cleaning & service fees included')}
          </p>
        </div>
      )}

      {/* Report */}
      <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-center gap-2 text-neutral-500 text-sm">
        <span className="underline">{t('property.reportListing')}</span>
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
                onClick={handleShare}
                className="p-2.5 hover:bg-neutral-100 rounded-full transition-colors"
                aria-label="Share property"
              >
                <Share size={20} className="text-neutral-900" />
              </button>
              <button 
                onClick={() => toggleWishlist(propertyId)} 
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

      <Container className="pt-6 pb-2">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-neutral-500">
          <ol className="flex items-center gap-2 flex-wrap">
            <li><Link href="/" className="hover:text-neutral-800">{t('nav.home')}</Link></li>
            <li>/</li>
            <li><Link href="/properties" className="hover:text-neutral-800">{t('nav.properties')}</Link></li>
            <li>/</li>
            <li className="text-neutral-800 truncate max-w-[14rem]">{localizedTitle}</li>
          </ol>
        </nav>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">{localizedTitle}</h1>
            <p className="mt-2 text-sm md:text-base text-neutral-600">
              {locationShort} · {propertyType}
            </p>
            <p className="mt-1 text-sm md:text-base text-neutral-600">{guestInfo}</p>
          </div>

          <div className="flex items-center gap-4 md:gap-6 shrink-0">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 underline underline-offset-2"
            >
              <Share size={16} />
              <span>{t('property.share', 'Share')}</span>
            </button>
            <button
              onClick={() => toggleWishlist(propertyId)}
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 underline underline-offset-2"
              aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={16} className={isLiked ? 'fill-rose-500 text-rose-500' : 'text-neutral-900'} />
              <span>{t('property.save', 'Save')}</span>
            </button>
          </div>
        </div>
      </Container>

      {/* Full Width Image Gallery - Desktop Grid / Mobile Carousel */}
      <div className="relative">
        {/* Mobile: Swipe Carousel with CSS Scroll Snap */}
        <div className="md:hidden relative w-full bg-neutral-100">
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {imageUrls.map((url, index) => (
              <div 
                key={index} 
                className="w-full flex-shrink-0 snap-center relative aspect-[4/3]"
              >
                <Image 
                  src={url} 
                  alt={`${localizedTitle} - Image ${index + 1}`}
                  fill 
                  priority={index === 0}
                  className="object-cover" 
                />
              </div>
            ))}
          </div>
          
          {/* Mobile Carousel Arrows */}
          {imageUrls.length > 1 && (
            <>
              <button
                onClick={() => {
                  if (scrollContainerRef.current) {
                    const w = scrollContainerRef.current.offsetWidth;
                    scrollContainerRef.current.scrollTo({ left: (currentImageIndex - 1) * w, behavior: 'smooth' });
                  }
                }}
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center ${currentImageIndex === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                aria-label="Previous image"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => {
                  if (scrollContainerRef.current) {
                    const w = scrollContainerRef.current.offsetWidth;
                    scrollContainerRef.current.scrollTo({ left: (currentImageIndex + 1) * w, behavior: 'smooth' });
                  }
                }}
                className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center ${currentImageIndex === imageUrls.length - 1 ? 'opacity-0 pointer-events-none' : ''}`}
                aria-label="Next image"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/70 text-white text-sm rounded-lg">
            {currentImageIndex + 1} / {imageUrls.length}
          </div>
        </div>

        {/* Desktop: Grid Gallery */}
        <Container className="hidden md:block">
          <div className="relative">
            {imageUrls.length === 1 ? (
              /* 1 image: full width */
              <div className="h-[400px] rounded-xl overflow-hidden relative cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => setShowGallery(true)}
              >
                <Image src={imageUrls[0]} alt={localizedTitle} fill priority={true} className="object-cover" />
              </div>
            ) : imageUrls.length === 2 ? (
              /* 2 images: side by side */
              <div className="grid grid-cols-2 gap-2 h-[400px] rounded-xl overflow-hidden">
                {imageUrls.slice(0, 2).map((img, idx) => (
                  <div key={idx} className="relative cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => { setCurrentImageIndex(idx); setShowGallery(true); }}>
                    <Image src={img} alt={`${localizedTitle} - ${idx + 1}`} fill className="object-cover" priority={idx === 0} />
                  </div>
                ))}
              </div>
            ) : imageUrls.length <= 4 ? (
              /* 3-4 images: 1 large left + stacked right */
              <div className="grid grid-cols-2 gap-2 h-[400px] rounded-xl overflow-hidden">
                <div className="relative cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => setShowGallery(true)}>
                  <Image src={imageUrls[0]} alt={localizedTitle} fill priority={true} className="object-cover" />
                </div>
                <div className={`grid ${imageUrls.length === 3 ? 'grid-rows-2' : 'grid-cols-2 grid-rows-2'} gap-2`}>
                  {imageUrls.slice(1).map((img, idx) => (
                    <div key={idx} className={`relative cursor-pointer hover:opacity-95 transition-opacity ${imageUrls.length === 4 ? '' : idx === 0 ? '' : ''}`}
                      onClick={() => { setCurrentImageIndex(idx + 1); setShowGallery(true); }}>
                      <Image src={img} alt={`${localizedTitle} - ${idx + 2}`} fill className="object-cover" />
                      {idx === imageUrls.length - 2 && (
                        <button onClick={(e) => { e.stopPropagation(); setShowGallery(true); }}
                          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg border border-neutral-900 bg-white px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-50 z-10">
                          {t('property.showAllPhotos', 'Show all photos')}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* 5+ images: Airbnb classic - 1 large left (2x2) + 4 right */
              <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] rounded-xl overflow-hidden">
                <div className="col-span-2 row-span-2 relative cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => setShowGallery(true)}>
                  <Image src={imageUrls[0]} alt={localizedTitle} fill priority={true} className="object-cover" />
                </div>
                {imageUrls.slice(1, 5).map((img, idx) => (
                  <div key={idx} className="relative cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => { setCurrentImageIndex(idx + 1); setShowGallery(true); }}>
                    <Image src={img} alt={`${localizedTitle} - ${idx + 2}`} fill className="object-cover" />
                    {idx === 3 && (
                      <button onClick={(e) => { e.stopPropagation(); setShowGallery(true); }}
                        className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg border border-neutral-900 bg-white px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-50 z-10">
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

      {/* Main Content - Two Column Layout on Desktop */}
      <Container className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2">
            {/* Info Bar - Mobile Only */}
            <div className="flex md:hidden items-center justify-center gap-6 mb-6 py-4 border-y border-neutral-200">
              {propertyCardData.reviewCount > 0 && (
              <div className="text-center">
                <p className="text-lg font-semibold">{propertyCardData.rating}</p>
                <div className="flex justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="fill-black" />
                  ))}
                </div>
              </div>
              )}
              {propertyCardData.reviewCount > 0 && <div className="w-px h-10 bg-neutral-200" />}
              <div className="text-center">
                <div className="flex justify-center gap-1">
                  <Trophy size={14} className="text-neutral-900" />
                  <Trophy size={14} className="text-neutral-900 transform rotate-180" />
                </div>
                <p className="text-sm font-medium">{t('property.guestFavourite')}</p>
              </div>
              {propertyCardData.reviewCount > 0 && (
                <>
                  <div className="w-px h-10 bg-neutral-200" />
                  <div className="text-center">
                    <p className="text-lg font-semibold">{propertyCardData.reviewCount}</p>
                    <p className="text-sm underline">{t('property.reviews')}</p>
                  </div>
                </>
              )}
            </div>

            <Divider />

            {/* Host Info */}
            <div className="flex items-center gap-3 py-6">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white border border-neutral-200 p-1.5">
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
                  location: locationShort, 
                  bedrooms: propertyCardData.bedrooms, 
                  bathrooms: propertyCardData.bathrooms, 
                  area: propertyCardData.area, 
                  maxGuests: propertyCardData.maxGuests 
                })}
              </p>
              {localizedFacts && (
                <section className="mt-6 border border-neutral-200 rounded-2xl p-5">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3">{t('property.highlights.title', 'Property highlights')}</h3>
                  <ul className="space-y-2 text-sm text-neutral-700">
                    <li><strong>{t('property.highlights.pricing', 'Pricing')}:</strong> {localizedFacts.pricing}</li>
                    <li><strong>{t('property.highlights.layout', 'Layout')}:</strong> {localizedFacts.layout}</li>
                    <li><strong>{t('property.highlights.allInclusive', 'All-inclusive')}:</strong> {localizedFacts.allInclusive}</li>
                    <li><strong>{t('property.highlights.building', 'Building amenities')}:</strong> {localizedFacts.building}</li>
                    <li><strong>{t('property.highlights.location', 'Location')}:</strong> {localizedFacts.location}</li>
                    <li><strong>{t('property.highlights.stayTerms', 'Stay terms')}:</strong> {localizedFacts.minimumStay}</li>
                    {localizedFacts?.extra && <li><strong>{t('property.highlights.buildingInfo', 'Building info')}:</strong> {localizedFacts.extra}</li>}
                  </ul>
                </section>
              )}
              <button className="mt-4 font-medium underline">{t('property.showMore')}</button>
            </div>

            <Divider />

            {/* Amenities */}
            <div className="py-6">
              <h2 className="text-xl font-semibold mb-4">{t('property.whatOffers')}</h2>
              <div className="grid grid-cols-2 gap-4">
                {amenities.slice(0, 6).map((item) => (
                  <div key={item} className="flex items-center gap-3 text-neutral-700">
                    <Check size={18} className="text-neutral-900" />
                    {t(`amenities.${item}`, item)}
                  </div>
                ))}
              </div>
              <button className="mt-6 px-6 py-3 border border-neutral-900 rounded-xl font-medium text-neutral-900">
                {t('property.showAllAmenities', { count: amenities.length })}
              </button>
            </div>

            <Divider />

            <div className="py-6">
              <h2 className="text-xl font-semibold mb-4">{t('property.neighborhoodTitle', 'Neighborhood highlights')}</h2>
              <p className="text-neutral-600 leading-relaxed line-clamp-4">
                {neighborhoodParagraph}
              </p>
              <button
                onClick={() => {/* TODO: expand full text */}}
                className="mt-3 text-neutral-900 font-medium underline underline-offset-4 flex items-center gap-1 hover:text-neutral-700 transition-colors"
              >
                {t('property.showMore', 'Show more')} <span className="text-lg">›</span>
              </button>
            </div>

            <Divider />

            {/* Location Map */}
            <div className="py-6">
              <h2 className="text-xl font-semibold mb-4">{t('property.whereYouBe')}</h2>
              <div className="w-full h-[350px] bg-neutral-100 relative overflow-hidden rounded-2xl">
                <iframe 
                  src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${encodeURIComponent(locationShort)}&zoom=15`}
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
                <p className="font-medium text-neutral-900">{locationShort}</p>
                <p className="text-sm text-neutral-600">{property.location}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card (Desktop only) */}
          <div className="hidden lg:block">
            <BookingCard isSticky={true} />
          </div>
        </div>
      </Container>

      {/* Mobile Bottom Floating Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-4 z-40">
        <div className="flex items-center justify-between">
          <div>
            {!checkIn || !checkOut ? (
              <div>
                <p className="text-neutral-900">{t('property.addDates')}</p>
                {propertyCardData.reviewCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-black" />
                    <span className="text-sm">{propertyCardData.rating}</span>
                  </div>
                )}
              </div>
            ) : bookingPrice ? (
              <div>
                <p className="text-lg font-semibold">${bookingPrice.total.toLocaleString()}</p>
                <p className="text-sm text-neutral-600">{bookingPrice.months} {t('booking.months', { count: bookingPrice.months })}</p>
              </div>
            ) : (
              <div>
                <p className="text-neutral-900">{t('property.addDates')}</p>
                {propertyCardData.reviewCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-black" />
                    <span className="text-sm">{propertyCardData.rating}</span>
                  </div>
                )}
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
          onSelectCheckIn={(date) => { setCheckIn(date); setBookingError(''); }}
          onSelectCheckOut={(date) => { setCheckOut(date); setBookingError(''); }}
          onClose={() => setShowCalendar(false)}
          onClearDates={() => {
            setCheckIn('');
            setCheckOut('');
          }}
          totalPrice={bookingPrice?.total || 0}
          minNights={propertyCardData.minNights || 1}
          rating={propertyCardData.reviewCount > 0 ? propertyCardData.rating : 0}
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
          image: imageUrls[0],
          rating: propertyCardData.rating,
          reviewCount: propertyCardData.reviewCount,
          isGuestFavourite: true,
        }}
        bookingDetails={{
          checkIn,
          checkOut,
          guests,
          pricePerNight: bookingPrice?.ratePerMonth || propertyCardData.price,
          cleaningFee: 0, // Included in all-inclusive pricing
          serviceFee: 0,  // Included in all-inclusive pricing
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
          setShowPayment(false);
          if (method === 'card') {
            // Redirect to booking page with Stripe integration
            const params = new URLSearchParams({
              checkIn,
              checkOut,
              guests: guests.toString(),
            });
            router.push(`/booking/${propertyId}?${params.toString()}`);
          } else if (method === 'paypal' || method === 'applepay') {
            // PayPal and Apple Pay coming soon - show inline message
            setShowPayment(false);
            setShowPaymentNotice(method === 'paypal' ? 'PayPal' : 'Apple Pay');
          }
        }}
      />

      {/* Card details now handled by Stripe Elements on the booking page */}
      {/* Guest Selector Modal */}
      <GuestSelector
        isOpen={showGuestSelector}
        onClose={() => setShowGuestSelector(false)}
        onSave={(newGuests) => {
          setGuestBreakdown(newGuests);
          setGuests(newGuests.adults + newGuests.children);
        }}
        initialGuests={guestBreakdown}
        maxGuests={propertyCardData.maxGuests}
        allowPets={false}
      />

      {/* Payment Method Coming Soon Notice */}
      {showPaymentNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPaymentNotice(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 text-center">
            <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚧</span>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">{t('payment.comingSoonTitle', { method: showPaymentNotice })}</h3>
            <p className="text-neutral-600 text-sm mb-6">
              {t('payment.comingSoonDescription', { method: showPaymentNotice })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentNotice(null)}
                className="flex-1 py-3 border border-neutral-300 text-neutral-700 font-medium rounded-xl hover:bg-neutral-50 transition-colors"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={() => { setShowPaymentNotice(null); setShowPayment(true); }}
                className="flex-1 py-3 bg-neutral-900 text-white font-semibold rounded-xl hover:bg-neutral-800 transition-colors"
              >
                {t('payment.useCard', 'Use Card')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-neutral-900">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-neutral-900">
              <h3 className="text-white font-medium">
                {currentImageIndex + 1} / {imageUrls.length}
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
                src={imageUrls[currentImageIndex]} 
                alt={`${localizedTitle} - Image ${currentImageIndex + 1}`} 
                fill 
                className="object-cover" 
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
                {imageUrls.map((image, index) => (
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
