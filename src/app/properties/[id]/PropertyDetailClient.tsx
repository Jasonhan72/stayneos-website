"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { getPropertyById } from "@/lib/data";
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

// 模拟评价数据
const mockReviews = [
  {
    id: 1,
    user: "张先生",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    rating: 5,
    date: "2024-01-15",
    content: "非常棒的住宿体验！房间干净整洁，设施齐全，位置也很方便。管家服务非常贴心，下次还会选择这里。",
  },
  {
    id: 2,
    user: "李女士",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    rating: 5,
    date: "2024-01-10",
    content: "性价比很高，装修很有品味，床品也很舒适。厨房设备齐全，自己做饭很方便。",
  },
  {
    id: 3,
    user: "王先生",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    rating: 4,
    date: "2024-01-05",
    content: "整体体验不错，就是停车位有点紧张。不过位置真的很好，周边吃喝玩乐都很方便。",
  },
];

export default function PropertyDetailClient({ params }: PropertyDetailPageProps) {
  const property = getPropertyById(params.id);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!property) {
    notFound();
  }

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
      <Navbar />

      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-900">首页</Link>
            <ChevronRight size={14} />
            <Link href="/properties" className="hover:text-gray-900">房源</Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 truncate">{property.title}</span>
          </nav>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {property.title}
            </h1>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <Share2 size={18} />
                <span className="text-sm font-medium">分享</span>
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="flex items-center gap-2 text-gray-600 hover:text-red-500"
              >
                <Heart
                  size={18}
                  className={isFavorite ? "fill-red-500 text-red-500" : ""}
                />
                <span className="text-sm font-medium">收藏</span>
              </button>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 rounded-xl overflow-hidden">
            <div className="relative aspect-[4/3] md:aspect-auto">
              <Image
                src={property.images[0]}
                alt={property.title}
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
                    alt={`${property.title} - ${index + 2}`}
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
                      {property.bedrooms}室{property.bathrooms}卫 · {property.area}m²
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
                    <span className="text-amber-800">{property.reviewCount}条评价</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Users size={18} />
                    <span>最多{property.maxGuests}人</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed size={18} />
                    <span>{property.bedrooms}间卧室</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath size={18} />
                    <span>{property.bathrooms}间浴室</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Maximize size={18} />
                    <span>{property.area}m²</span>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">配套设施</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity] || Check;
                    return (
                      <div key={amenity} className="flex items-center gap-3">
                        <Icon size={20} className="text-gray-600" />
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">房源介绍</h3>
                <p className="text-gray-600 leading-relaxed">
                  这套位于{property.location}的精美公寓，拥有{property.bedrooms}间宽敞舒适的卧室和{property.bathrooms}间现代化浴室。
                  公寓总面积{property.area}平方米，最多可容纳{property.maxGuests}位客人入住。
                </p>
                {property.description && (
                  <p className="text-gray-600 leading-relaxed mt-4">{property.description}</p>
                )}
              </div>

              {/* Map Placeholder */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">房源位置</h3>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin size={48} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">{property.location}</p>
                    <p className="text-sm text-gray-400 mt-1">地图加载中...</p>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Star size={24} className="text-amber-500 fill-amber-500" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    {property.rating} · {property.reviewCount}条评价
                  </h3>
                </div>

                <div className="space-y-6">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                          <Image
                            src={review.avatar}
                            alt={review.user}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{review.user}</p>
                          <p className="text-sm text-gray-500">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < review.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                      <p className="text-gray-600">{review.content}</p>
                    </div>
                  ))}
                </div>

                <button className="mt-6 px-6 py-3 border border-gray-900 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  查看全部评价
                </button>
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
                    <span className="text-gray-500">/{property.priceUnit}</span>
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
                      🏠 {property.minNights}天起租
                    </p>
                    {property.monthlyDiscount && (
                      <p className="text-sm text-amber-700 mt-1">
                        月租享{property.monthlyDiscount}%折扣
                      </p>
                    )}
                  </div>
                )}

                <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
                  {/* Dates */}
                  <div className="grid grid-cols-2 border-b border-gray-300">
                    <div className="p-3 border-r border-gray-300">
                      <label className="block text-xs font-semibold text-gray-700 uppercase">
                        入住日期
                      </label>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full mt-1 text-sm focus:outline-none"
                      />
                    </div>
                    <div className="p-3">
                      <label className="block text-xs font-semibold text-gray-700 uppercase">
                        退房日期
                      </label>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full mt-1 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="p-3">
                    <label className="block text-xs font-semibold text-gray-700 uppercase">
                      入住人数
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full mt-1 text-sm focus:outline-none bg-transparent"
                    >
                      {Array.from({ length: property.maxGuests }).map((_, i) => (
                        <option key={i} value={i + 1}>
                          {i + 1}位房客
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors mb-4"
                  onClick={() => {
                    if (!checkIn || !checkOut) {
                      alert("请选择入住和退房日期");
                      return;
                    }
                    alert("预订功能开发中...");
                  }}
                >
                  预订
                </button>

                <p className="text-center text-sm text-gray-500 mb-6">您暂时不会被收费</p>

                {nights > 0 && (
                  <div className="space-y-3 text-sm border-t border-gray-100 pt-4">
                    {isMonthly && property.monthlyDiscount ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600 line-through">
                            原价 ${property.price.toLocaleString()} CAD
                          </span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span className="underline">
                            月租价 ${discountedPrice.toLocaleString()} CAD x {nights}晚
                          </span>
                          <span>${totalPrice.toLocaleString()} CAD</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>月租优惠 ({property.monthlyDiscount}% off)</span>
                          <span>-${((property.price - discountedPrice) * nights).toLocaleString()} CAD</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-gray-600 underline">
                          ${property.price.toLocaleString()} CAD x {nights}晚
                        </span>
                        <span>${totalPrice.toLocaleString()} CAD</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 underline">服务费</span>
                      <span>${serviceFee.toLocaleString()} CAD</span>
                    </div>
                    
                    <div className="flex justify-between pt-3 border-t border-gray-100 font-semibold text-base">
                      <span>总价</span>
                      <span>${finalPrice.toLocaleString()} CAD</span>
                    </div>
                    {nights < (property.minNights || 0) && (
                      <p className="text-amber-600 text-xs mt-2">
                        * 最少需预订 {property.minNights} 天
                      </p>
                    )}
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
