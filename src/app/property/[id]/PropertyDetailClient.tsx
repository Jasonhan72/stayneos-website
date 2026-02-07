// Property Detail Page - Blueground Style + Square UI
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
  User,
  Mail,
  Phone,
  AlertCircle,
  X
} from 'lucide-react';
import { Button, Container, Card, Badge, Divider, Modal } from '@/components/ui';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { getPropertyById, mockProperties } from '@/lib/data';
import { notFound } from 'next/navigation';

interface PropertyDetailClientProps {
  propertyId: string;
}

export default function PropertyDetailClient({ propertyId }: PropertyDetailClientProps) {
  const property = getPropertyById(propertyId);
  
  if (!property) {
    notFound();
  }

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
      newErrors.checkIn = '请选择入住日期';
    }
    if (!checkOut) {
      newErrors.checkOut = '请选择退房日期';
    }
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      if (end <= start) {
        newErrors.checkOut = '退房日期必须晚于入住日期';
      }
      if (property.minNights && nights < property.minNights) {
        newErrors.checkOut = `最少需预订 ${property.minNights} 天`;
      }
    }
    if (!name.trim()) {
      newErrors.name = '请输入您的姓名';
    }
    if (!email.trim()) {
      newErrors.email = '请输入邮箱地址';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    if (!phone.trim()) {
      newErrors.phone = '请输入联系电话';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(phone)) {
      newErrors.phone = '请输入有效的电话号码';
    }
    if (guests < 1 || guests > property.maxGuests) {
      newErrors.guests = `入住人数需在 1-${property.maxGuests} 人之间`;
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setShowBookingSuccess(true);
  };

  // Get similar properties (same area or similar price)
  const similarProperties = useMemo(() => {
    return mockProperties
      .filter(p => p.id !== property.id)
      .filter(p => 
        p.location.includes(property.location.split(',')[1]?.trim() || '') ||
        Math.abs(p.price - property.price) / property.price < 0.3
      )
      .slice(0, 3);
  }, [property]);

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-neutral-200">
        <Container>
          <div className="flex items-center justify-between h-16">
            <Link href="/properties" className="flex items-center text-neutral-600 hover:text-neutral-900">
              <ChevronLeft size={20} />
              <span className="ml-1 hidden sm:inline">返回列表</span>
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
              <button className="p-2 hover:bg-neutral-100 transition-colors">
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
            {/* Main Image */}
            <div className="relative aspect-[16/9] max-h-[60vh] bg-neutral-200 overflow-hidden cursor-pointer"
                 onClick={() => setShowGallery(true)}>
              <Image
                src={property.images[currentImageIndex]}
                alt={`${property.title} - 图片 ${currentImageIndex + 1}`}
                fill
                priority
                className="object-cover"
              />
              
              {/* Image Navigation */}
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
              
              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 px-4 py-2 bg-neutral-900/80 text-white text-sm">
                {currentImageIndex + 1} / {property.images.length}
              </div>
              
              {/* View All Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); setShowGallery(true); }}
                className="absolute bottom-4 left-4 px-4 py-2 bg-white text-neutral-900 text-sm font-medium hover:bg-neutral-100 transition-colors"
              >
                查看全部 {property.images.length} 张图片
              </button>
            </div>

            {/* Thumbnail Strip */}
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
                    alt={`缩略图 ${index + 1}`}
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
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
                  {property.title}
                </h1>
                <div className="flex items-center gap-1 shrink-0">
                  <Star size={18} className="text-accent fill-accent" />
                  <span className="font-medium">{property.rating}</span>
                  <span className="text-neutral-400">({property.reviewCount} 评价)</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-neutral-600">
                <MapPin size={18} />
                <span>{property.location}</span>
              </div>
            </div>

            <Divider className="my-6" />

            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-neutral-50 border border-neutral-200">
                <Users className="text-primary" size={24} />
                <div>
                  <div className="font-medium">{property.maxGuests} 人</div>
                  <div className="text-sm text-neutral-500">最多入住</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-neutral-50 border border-neutral-200">
                <Bed className="text-primary" size={24} />
                <div>
                  <div className="font-medium">{property.bedrooms} 室</div>
                  <div className="text-sm text-neutral-500">卧室</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-neutral-50 border border-neutral-200">
                <Bath className="text-primary" size={24} />
                <div>
                  <div className="font-medium">{property.bathrooms} 卫</div>
                  <div className="text-sm text-neutral-500">卫生间</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-neutral-50 border border-neutral-200">
                <Maximize className="text-primary" size={24} />
                <div>
                  <div className="font-medium">{property.area} m²</div>
                  <div className="text-sm text-neutral-500">面积</div>
                </div>
              </div>
            </div>

            <Divider className="my-6" />

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">房源介绍</h2>
              <div className="text-neutral-600 whitespace-pre-line leading-relaxed">
                {property.description || `这套位于${property.location}的精美公寓，拥有${property.bedrooms}间宽敞舒适的卧室和${property.bathrooms}间现代化浴室。

公寓总面积${property.area}平方米，最多可容纳${property.maxGuests}位客人入住。精心设计的空间布局，高品质的装修材料，为您提供舒适的居住体验。

公寓位于市中心黄金地段，交通便利，周边配套设施完善。无论是商务出差还是家庭度假，都是您的理想选择。`}
              </div>
            </div>

            <Divider className="my-6" />

            {/* Amenities */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">配套设施</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-neutral-700 p-3 bg-neutral-50">
                    <Check size={18} className="text-success" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <Divider className="my-6" />

            {/* Location Map */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">房源位置</h2>
              <div className="w-full h-[350px] bg-neutral-100 relative overflow-hidden rounded-lg">
                {/* Google Maps Embed */}
                <iframe
                  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2880!2d-79.4!3d43.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${encodeURIComponent(property.location)}!5e0!3m2!1sen!2sca!4v1234567890`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                  title={`${property.title} Location`}
                />
                
                {/* Map Info Card */}
                <div className="absolute bottom-4 left-4 bg-white p-4 shadow-lg rounded-lg max-w-xs">
                  <h4 className="font-semibold text-neutral-900 mb-1">{property.title}</h4>
                  <p className="text-sm text-neutral-600">{property.location}</p>
                  <a 
                    href={`https://maps.google.com/?q=${encodeURIComponent(property.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-primary hover:text-primary-700 font-medium mt-2"
                  >
                    在 Google Maps 中打开
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>

            {/* Similar Properties */}
            {similarProperties.length > 0 && (
              <>
                <Divider className="my-6" />
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">相似房源推荐</h2>
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
                              alt={similarProperty.title}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-neutral-900 line-clamp-1 group-hover:text-primary transition-colors">
                              {similarProperty.title}
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
                              ${similarProperty.price} <span className="text-sm font-normal text-neutral-500">/晚</span>
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
                {/* Price */}
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-neutral-900">
                    ${property.price}
                  </span>
                  <span className="text-neutral-500">CAD / 晚</span>
                </div>
                
                {property.monthlyDiscount && property.monthlyDiscount > 0 && (
                  <Badge variant="primary" className="mb-4">
                    月租享 {property.monthlyDiscount}% 优惠
                  </Badge>
                )}

                {property.minNights && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-sm text-amber-800">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} />
                      <span className="font-medium">{property.minNights}天起租</span>
                    </div>
                  </div>
                )}

                {/* Booking Form */}
                <div className="space-y-4 mb-4">
                  {/* Dates - Airbnb Style */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      入住 / 退房日期
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

                  {/* Guests */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      入住人数
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
                          <option key={num} value={num}>{num} 位房客</option>
                        ))}
                      </select>
                    </div>
                    {errors.guests && <p className="text-xs text-error mt-1">{errors.guests}</p>}
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      您的姓名
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="请输入您的姓名"
                        className={`w-full pl-9 pr-3 py-2.5 border text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                          errors.name ? 'border-error' : 'border-neutral-300'
                        }`}
                      />
                    </div>
                    {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      邮箱地址
                    </label>
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

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      联系电话
                    </label>
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

                  {/* Special Requests */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      特殊要求 <span className="text-neutral-400">(选填)</span>
                    </label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="如有特殊要求，请在此说明..."
                      rows={3}
                      className="w-full px-3 py-2.5 border border-neutral-300 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    />
                  </div>
                </div>

                {/* Price Breakdown */}
                {nights > 0 && (
                  <div className="mb-4 p-4 bg-neutral-50 border border-neutral-200 text-sm">
                    <div className="space-y-2">
                      {isMonthly && property.monthlyDiscount ? (
                        <>
                          <div className="flex justify-between text-neutral-500">
                            <span className="line-through">原价 ${property.price.toLocaleString()} CAD</span>
                          </div>
                          <div className="flex justify-between text-success">
                            <span>月租价 ${discountedPrice.toLocaleString()} x {nights}晚</span>
                            <span>${totalPrice.toLocaleString()} CAD</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-neutral-600">${property.price.toLocaleString()} x {nights}晚</span>
                          <span>${totalPrice.toLocaleString()} CAD</span>
                        </div>
                      )}
                      <div className="flex justify-between text-neutral-600">
                        <span>服务费</span>
                        <span>${serviceFee.toLocaleString()} CAD</span>
                      </div>
                      <Divider className="my-2" />
                      <div className="flex justify-between font-semibold text-base">
                        <span>总价</span>
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
                  {isSubmitting ? '提交中...' : '立即预订'}
                </Button>
                <p className="text-center text-sm text-neutral-500 mt-3">
                  您暂时不会被收费
                </p>
              </Card>
            </div>
          </div>
        </div>
      </Container>

      {/* Full Gallery Modal */}
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
                className="p-2 text-white hover:bg-neutral-800 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Main Image */}
            <div className="flex-1 relative flex items-center justify-center">
              <Image
                src={property.images[currentImageIndex]}
                alt={`${property.title} - 图片 ${currentImageIndex + 1}`}
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
            
            {/* Thumbnails */}
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
                      alt={`缩略图 ${index + 1}`}
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
        title="预订申请已提交"
        footer={
          <Button onClick={() => setShowBookingSuccess(false)}>
            确定
          </Button>
        }
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-success/10 flex items-center justify-center">
            <Check size={32} className="text-success" />
          </div>
          <p className="text-neutral-600">
            您的预订申请已成功提交！我们的客服人员将在24小时内与您联系确认。
          </p>
          <div className="mt-4 p-4 bg-neutral-50 text-left text-sm">
            <p><strong>房源：</strong>{property.title}</p>
            <p><strong>入住日期：</strong>{checkIn}</p>
            <p><strong>退房日期：</strong>{checkOut}</p>
            <p><strong>入住人数：</strong>{guests}人</p>
            <p><strong>总价：</strong>${finalPrice.toLocaleString()} CAD</p>
          </div>
        </div>
      </Modal>
    </main>
  );
}
