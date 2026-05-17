// Property Detail Page - Airbnb Style with Desktop Two-Column Layout (使用真实 API)
'use client';

import { useState, useMemo } from 'react';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Star,
  Heart,
  Share,
  ChevronLeft,
  Trophy,
  Waves,
  Check,
  ShieldCheck,
  BadgeCheck,
  MessageCircle,
  ReceiptText,
  MapPinned,
  KeyRound,
  Award,
  Wifi,
  Car,
  CookingPot,
  Tv,
  Wind,
  UtensilsCrossed,
  Shirt,
  Dumbbell,
  PawPrint,
  Flame,
  Waves as WavesIcon,
  TreePine,
} from 'lucide-react';
import { Container, Divider } from '@/components/ui';
import { Skeleton } from '@/components/ui/Skeleton';
import { ApiErrorAlert } from '@/components/error';
import { ReviewAndContinue, PaymentMethod, GuestSelector, type GuestCounts } from '@/components/booking';
// CardDetailsForm removed - PCI compliance: all card input handled by Stripe Elements
import { useI18n } from '@/lib/i18n';
import { useWishlist } from '@/lib/context/WishlistContext';
import { useAuth } from '@/lib/context/UserContext';
import { LoginModal } from '@/components/auth/LoginModal';
import { useProperty } from '@/hooks/useProperties';
import { PropertyCardData } from '@/types';
import { getPropertyLocation } from '@/lib/utils/property-transform';
import { calculateBookingPrice, getDefaultStayType, normalizeStayType, stayTypeToQuery, type StayType } from '@/lib/booking';
import { formatDateLabel, nightsBetween, normalizeDate } from '@/components/booking/calendar-utils';
import { GOOGLE_MAPS_API_KEY, googleMapsSearchUrl, hasUsableGoogleMapsKey } from '@/lib/google-maps';
import BookingSidebar from '@/components/property/BookingSidebar';
import ListingGallery from '@/components/property/ListingGallery';

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

export default function PropertyDetailClient({ propertyId, initialProperty }: PropertyDetailClientProps) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { property, isLoading, error } = useProperty(propertyId, initialProperty);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const { isWishlisted, toggleWishlist } = useWishlist();
  const isLiked = isWishlisted(propertyId);
  // Booking state
  const [checkIn, setCheckIn] = useState(() => searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(() => searchParams.get('checkOut') || '');
  const bookedRanges = ((property as typeof property & { bookedRanges?: Array<{ start: string; end: string }> } | null)?.bookedRanges || []);
  const [guests, setGuests] = useState(() => Math.max(1, parseInt(searchParams.get('guests') || '1', 10) || 1));
  const [showCalendar, setShowCalendar] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [expandedNeighborhood, setExpandedNeighborhood] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  // showCardForm removed - card input now handled by Stripe Elements
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const [showPaymentNotice, setShowPaymentNotice] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedStayType, setSelectedStayType] = useState<StayType | null>(null);
  const [pendingCheckoutUrl, setPendingCheckoutUrl] = useState<string | null>(null);

  // Guest breakdown state for GuestSelector
  const [guestBreakdown, setGuestBreakdown] = useState<GuestCounts>({
    adults: Math.max(1, parseInt(searchParams.get('adults') || searchParams.get('guests') || '1', 10) || 1),
    children: Math.max(0, parseInt(searchParams.get('children') || '0', 10) || 0),
    infants: Math.max(0, parseInt(searchParams.get('infants') || '0', 10) || 0),
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
    return calculateBookingPrice(propertyCardData, checkIn, checkOut, selectedStayType || getDefaultStayType(propertyCardData));
  }, [propertyCardData, checkIn, checkOut, selectedStayType]);

  // Loading state
  if (isLoading) {
    return <Skeleton.PropertyDetail />;
  }

 
  // Amenity icon lookup
  const amenityIcon = (key: string, size: number) => {
    const lower = key.toLowerCase();
    if (lower.includes('wifi') || lower.includes('internet')) return <Wifi size={size} className="text-neutral-900" />;
    if (lower.includes('parking') || lower.includes('garage')) return <Car size={size} className="text-neutral-900" />;
    if (lower.includes('kitchen') || lower.includes('cook')) return <CookingPot size={size} className="text-neutral-900" />;
    if (lower.includes('tv') || lower.includes('television') || lower.includes('cable')) return <Tv size={size} className="text-neutral-900" />;
    if (lower.includes('ac') || lower.includes('air condition') || lower.includes('heating') || lower.includes('hvac')) return <Wind size={size} className="text-neutral-900" />;
    if (lower.includes('dish') || lower.includes('utensil') || lower.includes('dining')) return <UtensilsCrossed size={size} className="text-neutral-900" />;
    if (lower.includes('laundry') || lower.includes('washer') || lower.includes('dryer') || lower.includes('linen')) return <Shirt size={size} className="text-neutral-900" />;
    if (lower.includes('gym') || lower.includes('fitness') || lower.includes('exercise')) return <Dumbbell size={size} className="text-neutral-900" />;
    if (lower.includes('pet') || lower.includes('dog') || lower.includes('cat')) return <PawPrint size={size} className="text-neutral-900" />;
    if (lower.includes('fire') || lower.includes('fireplace')) return <Flame size={size} className="text-neutral-900" />;
    if (lower.includes('pool') || lower.includes('water') || lower.includes('swim')) return <WavesIcon size={size} className="text-neutral-900" />;
    if (lower.includes('garden') || lower.includes('outdoor') || lower.includes('balcony') || lower.includes('patio') || lower.includes('tree')) return <TreePine size={size} className="text-neutral-900" />;
    return <Check size={size} className="text-neutral-900" />;
  };
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

  // Format property type and location
  const propertyType = propertyCardData.bedrooms <= 1 ? t('property.entireCondo') : t('property.entireHome');
  const locationShort = getPropertyLocation(propertyCardData);
  const canEmbedGoogleMap = hasUsableGoogleMapsKey();

  // Format guest info
  const guestInfo = t('property.guestInfo', {
    maxGuests: propertyCardData.maxGuests,
    bedrooms: propertyCardData.bedrooms,
    beds: propertyCardData.bedrooms,
    bathrooms: propertyCardData.bathrooms
  });

  const effectiveStayType = normalizeStayType(selectedStayType, getDefaultStayType(propertyCardData));

  const tierPrices = (() => {
    const monthly = Number((propertyCardData as unknown as { monthlyRate?: number; priceMonthly?: number })?.monthlyRate || (propertyCardData as unknown as { priceMonthly?: number })?.priceMonthly || propertyCardData?.price || 0);
    const nightly = Number((propertyCardData as unknown as { nightlyRate?: number })?.nightlyRate || 0) || Math.max(1, Math.round(monthly / 30));
    const quarterly = Number((propertyCardData as unknown as { quarterlyRate?: number; priceQuarterly?: number })?.quarterlyRate || (propertyCardData as unknown as { priceQuarterly?: number })?.priceQuarterly || 0) || Math.round(monthly * 0.92);
    const annual = Number((propertyCardData as unknown as { yearlyRate?: number; priceAnnual?: number })?.yearlyRate || (propertyCardData as unknown as { priceAnnual?: number })?.priceAnnual || 0) || Math.round(monthly * 0.85);
    return { nightly, monthly, quarterly, annual };
  })();

  const buildCheckoutUrl = (overrides?: { checkIn?: string; checkOut?: string }) => {
    const nextCheckIn = overrides?.checkIn ?? checkIn;
    const nextCheckOut = overrides?.checkOut ?? checkOut;
    const params = new URLSearchParams({
      checkIn: nextCheckIn,
      checkOut: nextCheckOut,
      guests: guests.toString(),
      adults: guestBreakdown.adults.toString(),
      children: guestBreakdown.children.toString(),
      infants: guestBreakdown.infants.toString(),
      stayType: stayTypeToQuery(effectiveStayType),
    });
    return `/checkout/${propertyId}?${params.toString()}`;
  };

  const continueToCheckout = () => {
    const checkoutUrl = pendingCheckoutUrl || buildCheckoutUrl();
    setPendingCheckoutUrl(null);
    router.push(checkoutUrl);
  };


  const continueToCheckoutWithDates = (nextCheckIn: string, nextCheckOut: string) => {
    setCheckIn(nextCheckIn);
    setCheckOut(nextCheckOut);
    setBookingError('');

    const startDate = normalizeDate(nextCheckIn);
    const endDate = normalizeDate(nextCheckOut);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
      setBookingError(t('booking.validation.invalidRange', 'Check-out must be after check-in'));
      setShowCalendar(true);
      return;
    }

    const nights = nightsBetween(nextCheckIn, nextCheckOut);
    const minNights = bookingPrice?.minNights || propertyCardData.minNights || 1;
    if (nights < minNights) {
      setBookingError(t('booking.validation.minNights', 'Minimum {count} nights required', { count: minNights }));
      setShowCalendar(true);
      return;
    }

    setShowCalendar(false);
    router.push(buildCheckoutUrl({ checkIn: nextCheckIn, checkOut: nextCheckOut }));
  };

  const handleCheckAvailability = () => {
    if (!checkIn || !checkOut) {
      setBookingError(t('booking.validation.selectDates', 'Please select check-in and check-out dates'));
      setShowCalendar(true);
      return;
    }

    const startDate = normalizeDate(checkIn);
    const endDate = normalizeDate(checkOut);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
      setBookingError(t('booking.validation.invalidRange', 'Check-out must be after check-in'));
      setShowCalendar(true);
      return;
    }

    const nights = nightsBetween(checkIn, checkOut);
    const minNights = bookingPrice?.minNights || propertyCardData.minNights || 1;
    if (nights < minNights) {
      setBookingError(t('booking.validation.minNights', 'Minimum {count} nights required', { count: minNights }));
      setShowCalendar(true);
      return;
    }

    setBookingError('');
    const checkoutUrl = buildCheckoutUrl();

    if (isAuthLoading || !isAuthenticated) {
      setPendingCheckoutUrl(checkoutUrl);
      setShowLoginModal(true);
      return;
    }

    router.push(checkoutUrl);
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

  const selectedMonthlyEstimate = effectiveStayType === 'QUARTERLY'
    ? tierPrices.quarterly
    : effectiveStayType === 'YEARLY'
      ? tierPrices.annual
      : tierPrices.monthly || propertyCardData.price || 0;
  const estimatedTax = Math.round(selectedMonthlyEstimate * 0.13);

  const trustItems = [
    { icon: ShieldCheck, title: 'Verified by NEOS', text: 'Photos, location context, pricing, and stay terms are reviewed before publishing.' },
    { icon: ReceiptText, title: 'Transparent pricing', text: 'Monthly, quarterly, and annual rates are visible before checkout. No surprise service or cleaning fees.' },
    { icon: MessageCircle, title: 'Human support', text: 'Contact the host or NEOS support from your booking once reserved.' },
    { icon: KeyRound, title: 'Move-in ready', text: 'Furnished stay with utilities, WiFi, kitchenware, linens, and building essentials.' },
  ];

  // Airbnb-style 6-dimension review scores (mock data, backend to provide real values)
  const reviewDimensions = [
    { key: 'cleanliness', label: t('property.reviewDim.cleanliness', 'Cleanliness'), score: 4.8 },
    { key: 'accuracy', label: t('property.reviewDim.accuracy', 'Accuracy'), score: 4.9 },
    { key: 'checkin', label: t('property.reviewDim.checkin', 'Check-in'), score: 4.9 },
    { key: 'communication', label: t('property.reviewDim.communication', 'Communication'), score: 4.7 },
    { key: 'location', label: t('property.reviewDim.location', 'Location'), score: 4.7 },
    { key: 'value', label: t('property.reviewDim.value', 'Value'), score: 4.6 },
  ];

  // Desktop Booking Card Component
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
            {/* Sub-info row: ★ rating · reviews · location · Superhost badge */}
            <div className="mt-2 flex flex-wrap items-center gap-x-1.5 text-sm md:text-base text-neutral-600">
              {propertyCardData.reviewCount > 0 && (
                <>
                  <span className="inline-flex items-center gap-1">
                    <Star size={14} className="fill-black" />
                    <span className="font-medium text-neutral-900">{propertyCardData.rating}</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{propertyCardData.reviewCount} {t('property.reviews')}</span>
                  <span aria-hidden="true">·</span>
                </>
              )}
              <span>{locationShort}</span>
              {mockHost.isSuperhost && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2 py-0.5 text-xs font-medium text-white">
                    <Award size={12} />
                    {t('property.superhost', 'Superhost')}
                  </span>
                </>
              )}
            </div>
            {/* Room type summary */}
            <p className="mt-2 text-sm md:text-base text-neutral-600">
              {propertyType} · {guestInfo}
            </p>
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

      <ListingGallery images={imageUrls} title={localizedTitle} />

      {/* Main Content - Two Column Layout on Desktop */}
      <Container className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-3">
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
                <ResponsiveImage
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

            {/* Trust System */}
            <section className="py-8">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">NEOS trust layer</p>
                  <h2 className="mt-1 text-2xl font-semibold text-neutral-950">Book with confidence</h2>
                </div>
                <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 md:inline-flex">
                  <BadgeCheck size={16} className="mr-2" /> Verified stay
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {trustItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                      <Icon size={22} className="text-neutral-950" />
                      <h3 className="mt-3 font-semibold text-neutral-950">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-neutral-600">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </section>

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

            {/* Property Narrative */}
            <div className="property-narrative mt-8 mb-8">
              <p className="text-lg text-neutral-700 leading-relaxed">
                {propertyId === '1' || propertyId === '55-cooper-st-sugar-wharf' || propertyId === 'prop-55-cooper'
                  ? t('property.narrative.sugarWharf', "Perched above Toronto's newest waterfront neighborhood, this sky suite offers panoramic views of Lake Ontario and the city skyline. Step outside to Corktown Common park, walk five minutes to the legendary St. Lawrence Market, or catch the UP Express at Union Station — just eight minutes on foot. Sugar Wharf's concierge lobby, rooftop terrace, and 24-hour security make this the gold standard for executive living in Toronto.")
                  : propertyId === '2' || propertyId === '238-simcoe-st-grange-park' || propertyId === 'prop-238-simcoe'
                  ? t('property.narrative.artistAlley', "Nestled in the heart of Toronto's cultural quarter, this suite sits directly across from the Art Gallery of Ontario and steps from Grange Park. The University of Toronto campus is a ten-minute walk, and the UHN hospital network is easily accessible by streetcar. With its vibrant café culture, independent bookshops, and proximity to Chinatown and Kensington Market, this is where Toronto's creative and academic communities call home.")
                  : propertyId === '3' || propertyId === '22-wellesley-st-e'
                  ? t('property.narrative.wellesley', "Located steps from Wellesley subway station on the Yonge line, this modern studio puts the entire city at your doorstep. Walk to the shops and restaurants of Yonge Street, jog through the Don Valley trails, or commute downtown in minutes. Ideal for solo professionals who want efficiency without compromising on neighborhood energy.")
                  : ''}
              </p>
            </div>

            <Divider />

            {/* Amenities */}
            <div className="py-6">
              <h2 className="text-xl font-semibold mb-4">{t('property.whatOffers')}</h2>
              <div className="grid grid-cols-2 gap-4">
                {amenities.slice(0, 9).map((item) => (
                  <div key={item} className="flex items-center gap-3 text-neutral-700">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                      {amenityIcon(item, 24)}
                    </span>
                    <span className="text-sm">{t(`amenities.${item}`, item)}</span>
                  </div>
                ))}
              </div>
              {amenities.length > 9 && (
                <button
                  onClick={() => setShowAllAmenities(true)}
                  className="mt-6 px-6 py-3 border border-neutral-900 rounded-xl font-medium text-neutral-900 hover:bg-neutral-50 transition-colors"
                >
                  {t('property.showAllAmenities', 'Show all {count} amenities', { count: amenities.length })}
                </button>
              )}
              {/* Show all amenities modal */}
              {showAllAmenities && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAllAmenities(false)} />
                  <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-neutral-900">{t('property.whatOffers')}</h3>
                      <button
                        onClick={() => setShowAllAmenities(false)}
                        className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
                      >
                        <span className="text-xl leading-none">&times;</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {amenities.map((item) => (
                        <div key={item} className="flex items-center gap-3 text-neutral-700">
                          <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                            {amenityIcon(item, 24)}
                          </span>
                          <span>{t(`amenities.${item}`, item)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Divider />

            <div className="py-6">
              <h2 className="text-xl font-semibold mb-4">{t('property.neighborhoodTitle', 'Neighborhood highlights')}</h2>
              <p className={`text-neutral-600 leading-relaxed ${expandedNeighborhood ? '' : 'line-clamp-4'}`}>
                {neighborhoodParagraph}
              </p>
              <button
                onClick={() => setExpandedNeighborhood(!expandedNeighborhood)}
                className="mt-3 text-neutral-900 font-medium underline underline-offset-4 flex items-center gap-1 hover:text-neutral-700 transition-colors"
              >
                {expandedNeighborhood ? t('property.showLess', 'Show less') : t('property.showMore', 'Show more')} <span className="text-lg">{expandedNeighborhood ? '‹' : '›'}</span>
              </button>
            </div>

            <Divider />

            {/* Airbnb-style 6-Dimension Review Scores */}
            <section className="py-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-neutral-950">
                  {t('property.reviewScores', 'Review scores')}
                </h2>
                {propertyCardData.reviewCount > 0 && (
                  <p className="mt-1 text-sm text-neutral-600">
                    {propertyCardData.rating} · {propertyCardData.reviewCount} {t('property.reviews')}
                  </p>
                )}
              </div>
              <div className="space-y-4">
                {reviewDimensions.map((dim) => (
                  <div key={dim.key} className="flex items-center gap-4">
                    <span className="w-32 shrink-0 text-sm text-neutral-700">{dim.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-neutral-900"
                        style={{ width: `${(dim.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-sm font-medium text-neutral-900">{dim.score.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Airbnb-style Review Cards */}
            <section className="py-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-950">
                  {t('property.guestReviews', 'Guest reviews')}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {([
                  { name: 'Sarah M.', date: 'March 2025', rating: 5, text: 'Absolutely stunning property! The views of the lake are incredible, and the apartment is exactly as described. The host was very responsive and accommodating. Would definitely stay again!' },
                  { name: 'James K.', date: 'February 2025', rating: 4, text: 'Great location and very clean space. The building amenities are top-notch. Only minor issue was the street noise at night, but nothing too disruptive. Highly recommend for business travelers.' },
                  { name: 'Emily R.', date: 'January 2025', rating: 5, text: 'This was the perfect home base for our month-long stay in Toronto. Close to transit, restaurants, and everything we needed. The apartment felt like a real home, not just a rental.' },
                  { name: 'Michael T.', date: 'December 2024', rating: 5, text: 'Exceptional quality throughout. From the high-end finishes to the thoughtful amenities, everything exceeded expectations. The NEOS team made the booking process seamless.' },
                ]).map((review, idx) => (
                  <div
                    key={idx}
                    className="border border-neutral-200 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Header: Avatar + Name + Date */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-900 text-sm">{review.name}</p>
                        <p className="text-xs text-neutral-400">{review.date}</p>
                      </div>
                    </div>
                    {/* Stars */}
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < review.rating ? 'fill-black text-black' : 'fill-neutral-200 text-neutral-200'}
                        />
                      ))}
                    </div>
                    {/* Review text */}
                    <p className="text-sm text-neutral-600 leading-relaxed line-clamp-4">
                      {review.text}
                    </p>
                    {review.text.length > 200 && (
                      <button className="mt-2 text-sm font-medium text-neutral-900 underline underline-offset-2">
                        {t('property.showMore', 'Show more')}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <Divider />

            {/* Location Map */}
            <div className="py-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">{t('property.whereYouBe')}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-800"><MapPinned size={14} /> Location checked</span>
              </div>
              <div className="w-full h-[350px] bg-neutral-100 relative overflow-hidden rounded-2xl">
                {canEmbedGoogleMap ? (
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(locationShort)}&zoom=15`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                    title={`${localizedTitle} Location`}
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#e5e7eb_0,#e5e7eb_2px,transparent_3px),linear-gradient(135deg,#f5f5f4,#e7e5e4)]">
                    <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(90deg,#d4d4d4_1px,transparent_1px),linear-gradient(#d4d4d4_1px,transparent_1px)] [background-size:48px_48px]" />
                    <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 rounded-2xl bg-white/90 px-5 py-4 text-center shadow-lg">
                      <MapPinned className="text-primary" size={28} />
                      <p className="font-semibold text-neutral-900">{locationShort}</p>
                      <a href={googleMapsSearchUrl(locationShort)} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:text-primary-700">Open in Google Maps</a>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="font-medium text-neutral-900">{locationShort}</p>
                <p className="text-sm text-neutral-600">{property.location}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card (Desktop only) */}
          <div className="hidden lg:block lg:col-span-2">
          <BookingSidebar
            property={propertyCardData}
            tierPrices={tierPrices}
            selectedStayType={selectedStayType}
            defaultStayType={getDefaultStayType(propertyCardData)}
            onStayTypeChange={setSelectedStayType}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            bookingPrice={bookingPrice}
            bookingError={bookingError}
            onOpenCalendar={() => setShowCalendar(true)}
            onOpenGuestSelector={() => setShowGuestSelector(true)}
            onCheckAvailability={handleCheckAvailability}
            estimatedTax={estimatedTax}
          />
          </div>
        </div>
      </Container>

      {/* Mobile Bottom Floating Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-4 z-40">
        {checkIn && checkOut && (
          <button
            onClick={() => setShowCalendar(true)}
            className="mb-3 flex w-full items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3 text-left transition-colors hover:bg-neutral-50"
          >
            <div>
              <p className="text-sm font-semibold text-neutral-900">Modify reservation</p>
              <p className="mt-1 text-sm text-neutral-600">
                {formatDateLabel(checkIn, locale === 'zh' ? 'zh-CN' : 'en-US')} – {formatDateLabel(checkOut, locale === 'zh' ? 'zh-CN' : 'en-US')}
              </p>
            </div>
            <span className="text-sm font-semibold text-neutral-900 underline underline-offset-4">Edit</span>
          </button>
        )}
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
                <p className="text-sm text-neutral-600">{bookingPrice.unitCount} {effectiveStayType === 'NIGHTLY' ? t('booking.nights', { count: bookingPrice.unitCount }) : t('booking.months', { count: bookingPrice.unitCount })}</p>
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

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={continueToCheckout}
        callbackUrl={pendingCheckoutUrl || buildCheckoutUrl()}
        reason="reserve"
      />

      {/* Calendar Modal */}
      {showCalendar && (
        <AirbnbCalendar
          checkIn={checkIn}
          checkOut={checkOut}
          onSelectCheckIn={(date) => { setCheckIn(date); setBookingError(''); }}
          onSelectCheckOut={(date) => {
            setCheckOut(date);
            setBookingError('');
          }}
          onClose={() => setShowCalendar(false)}
          onSave={continueToCheckoutWithDates}
          saveRedirectBase={buildCheckoutUrl({ checkIn: '', checkOut: '' })}
          onClearDates={() => {
            setCheckIn('');
            setCheckOut('');
          }}
          totalPrice={bookingPrice?.total || 0}
          dailyPrice={Math.floor(tierPrices.monthly / 30)}
          minStayNights={propertyCardData.minNights || 1}
          minNights={propertyCardData.minNights || 1}
          rating={propertyCardData.reviewCount > 0 ? propertyCardData.rating : 0}
          currency="CAD"
          bookedRanges={bookedRanges}
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
            // Redirect to active checkout route; /booking/[id] is legacy and protected.
            const params = new URLSearchParams({
              checkIn,
              checkOut,
              guests: guests.toString(),
              adults: guestBreakdown.adults.toString(),
              children: guestBreakdown.children.toString(),
              infants: guestBreakdown.infants.toString(),
              stayType: stayTypeToQuery(effectiveStayType),
            });
            router.push(`/checkout/${propertyId}?${params.toString()}`);
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

          </main>
  );
}
