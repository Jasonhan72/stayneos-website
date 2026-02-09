"use client";

import { useState, useMemo } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPropertyById } from "@/lib/data";
import { getLocalizedTitle, getLocalizedDescription } from "@/components/property/PropertyCard";
import { useI18n } from "@/lib/i18n";
import DateRangePicker from "@/components/ui/DateRangePicker";
import {
  Heart,
  Star,
  MapPin,
  Users,
  Maximize,
  Bed,
  Bath,
  Wifi,
  Wind,
  WashingMachine,
  Utensils,
  Dumbbell,
  Waves,
  Car,
  Headphones,
  Mountain,
  ArrowUpToLine,
  Palette,
  Trees,
  Briefcase,
  ChevronRight,
  Share2,
  Check,
} from "lucide-react";

interface PropertyDetailPageProps {
  params: {
    id: string;
  };
}

const amenityIcons: Record<string, React.ElementType> = {
  WiFi: Wifi,
  空调: Wind,
  洗衣机: WashingMachine,
  厨房: Utensils,
  健身房: Dumbbell,
  游泳池: Waves,
  停车位: Car,
  管家服务: Headphones,
  江景: Mountain,
  私人电梯: ArrowUpToLine,
  艺术装饰: Palette,
  阳台: Trees,
  会议室: Briefcase,
  商务中心: Briefcase,
  湖景: Mountain,
};

export default function PropertyDetailClient({ params }: PropertyDetailPageProps) {
  const property = getPropertyById(params.id);
  const { t, locale } = useI18n();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!property) {
    notFound();
  }

  // Get localized content
  const localizedTitle = useMemo(() => getLocalizedTitle(property, locale), [property, locale]);
  const localizedDescription = useMemo(() => getLocalizedDescription(property, locale), [property, locale]);

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

  return (
    <main className="min-h-screen bg-amber-50">
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-900">{t('nav.home')}</Link>
            <ChevronRight size={14} />
            <Link href="/properties" className="hover:text-gray-900">{t('nav.properties')}</Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 truncate">{localizedTitle}</span>
          </nav>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {localizedTitle}
            </h1>
            <div className="flex items-center gap-4">
              <button 
                onClick={async () => {
                  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
                  const shareData = {
                    title: localizedTitle,
                    text: `${t('property.shareText')}: ${localizedTitle} - ${property.location}`,
                    url: shareUrl,
                  };
                  
                  if (navigator.share) {
                    try {
                      await navigator.share(shareData);
                    } catch {
                      // 用户取消分享，不处理
                    }
                  } else {
                    // 复制链接到剪贴板
                    try {
                      await navigator.clipboard.writeText(shareUrl);
                      alert(t('property.linkCopied'));
                    } catch {
                      // 备用方案
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
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <Share2 size={18} />
                <span className="text-sm font-medium">{t('common.share')}</span>
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="flex items-center gap-2 text-gray-600 hover:text-red-500"
              >
                <Heart
                  size={18}
                  className={isFavorite ? "fill-red-500 text-red-500" : ""}
                />
                <span className="text-sm font-medium">{t('common.favorite')}</span>
              </button>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 rounded-xl overflow-hidden">
            <div className="relative aspect-[4/3] md:aspect-auto">
              <Image
                src={property.images[0]}
                alt={localizedTitle}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {property.images.slice(1, 5).map((image, index) => (
                <div key={index} className="relative aspect-[4/3]">
                  <Image
                    src={image}
                    alt={`${localizedTitle} - ${index + 2}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Property Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Info */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {property.bedrooms}{t('property.bedroomsUnit')} {property.bathrooms}{t('property.bathroomsUnit')} · {property.area}m²
                    </h2>
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin size={16} />
                      <span>{property.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 rounded-lg">
                    <Star size={16} className="text-amber-600 fill-amber-600" />
                    <span className="font-semibold text-amber-800">{property.rating}</span>
                    <span className="text-amber-600">·</span>
                    <span className="text-amber-800">{property.reviewCount}{t('properties.details.reviews')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Users size={18} />
                    <span>{t('property.maxGuestsValue', { count: property.maxGuests })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed size={18} />
                    <span>{property.bedrooms}{t('property.bedroomsLabel')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath size={18} />
                    <span>{property.bathrooms}{t('property.bathroomsLabel')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Maximize size={18} />
                    <span>{property.area}m²</span>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('properties.details.amenities')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity] || Check;
                    return (
                      <div key={amenity} className="flex items-center gap-3">
                        <Icon size={20} className="text-gray-600" />
                        <span className="text-gray-700">{t(`amenities.${amenity}`) || amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('properties.details.description')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {localizedDescription || t('property.defaultDescription', { location: property.location, bedrooms: property.bedrooms, bathrooms: property.bathrooms, area: property.area, maxGuests: property.maxGuests })}
                </p>
              </div>

              {/* Map Placeholder */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('properties.details.location')}</h3>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin size={48} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">{property.location}</p>
                    <p className="text-sm text-gray-400 mt-1">{t('property.mapLoading')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-baseline justify-between mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">
                      ${property.price.toLocaleString()} CAD
                    </span>
                    <span className="text-gray-500">/{t('common.night')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-amber-400 fill-amber-400" />
                    <span className="font-medium">{property.rating}</span>
                  </div>
                </div>

                {/* 月租政策提示 */}
                {property.minNights && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800 font-medium">
                      🏠 {t('property.minNightsLabel', { count: property.minNights })}
                    </p>
                    {property.monthlyDiscount && (
                      <p className="text-sm text-amber-700 mt-1">
                        {t('property.monthlyDiscountLabel', { percent: property.monthlyDiscount })}
                      </p>
                    )}
                  </div>
                )}

                <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
                  {/* Dates - Airbnb Style */}
                  <div className="border-b border-gray-300">
                    <DateRangePicker
                      checkIn={checkIn}
                      checkOut={checkOut}
                      onCheckInChange={setCheckIn}
                      onCheckOutChange={setCheckOut}
                      minNights={property.minNights || 1}
                    />
                  </div>

                  {/* Guests */}
                  <div className="p-3">
                    <label className="block text-xs font-semibold text-gray-700 uppercase">
                      {t('property.guestCount')}
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full mt-1 text-sm focus:outline-none bg-transparent"
                    >
                      {Array.from({ length: property.maxGuests }).map((_, i) => (
                        <option key={i} value={i + 1}>
                          {i + 1} {t('property.guestsUnit')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Link
                  href={checkIn && checkOut 
                    ? `/booking/${property.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
                    : `/booking/${property.id}`
                  }
                  className="block w-full py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors mb-4 text-center"
                  onClick={(e) => {
                    if (!checkIn || !checkOut) {
                      e.preventDefault();
                      alert(t('property.selectDatesError'));
                      return;
                    }
                  }}
                >
                  {t('properties.details.bookNow')}
                </Link>

                <p className="text-center text-sm text-gray-500 mb-6">{t('booking.youWontBeCharged')}</p>

                {nights > 0 && (
                  <div className="space-y-3 text-sm border-t border-gray-100 pt-4">
                    {isMonthly && property.monthlyDiscount ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600 line-through">
                            {t('property.originalPrice')} ${property.price.toLocaleString()} CAD
                          </span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span className="underline">
                            {t('property.monthlyPrice')} ${discountedPrice.toLocaleString()} CAD x {nights}{t('common.nights')}
                          </span>
                          <span>${totalPrice.toLocaleString()} CAD</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>{t('property.monthlyDiscountLabel', { percent: property.monthlyDiscount })}</span>
                          <span>-${((property.price - discountedPrice) * nights).toLocaleString()} CAD</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-gray-600 underline">
                          ${property.price.toLocaleString()} CAD x {nights}{t('common.nights')}
                        </span>
                        <span>${totalPrice.toLocaleString()} CAD</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 underline">{t('property.serviceFee')}</span>
                      <span>${serviceFee.toLocaleString()} CAD</span>
                    </div>
                    
                    <div className="flex justify-between pt-3 border-t border-gray-100 font-semibold text-base">
                      <span>{t('properties.details.total')}</span>
                      <span>${finalPrice.toLocaleString()} CAD</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
