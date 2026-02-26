'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Home,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  Bed,
  Bath,
  Users,
  Maximize,
  Check,
  ChevronLeft,
  Plus,
  X,
  Loader2,
  Globe,
  Building2,
  User
} from 'lucide-react';
import { PropertyType, PropertyStatus } from '@prisma/client';
import { createPropertySchema } from '@/lib/validation/property';
import { HostOption } from '@/types/host';

// 房型选项
const PROPERTY_TYPES = [
  { value: PropertyType.APARTMENT, label: 'Apartment', labelZh: '公寓' },
  { value: PropertyType.CONDO, label: 'Condo', labelZh: '公寓式住宅' },
  { value: PropertyType.TOWNHOUSE, label: 'Townhouse', labelZh: '联排别墅' },
  { value: PropertyType.HOUSE, label: 'House', labelZh: '独栋别墅' },
  { value: PropertyType.LOFT, label: 'Loft', labelZh: '阁楼' },
  { value: PropertyType.STUDIO, label: 'Studio', labelZh: '单间公寓' },
  { value: PropertyType.PENTHOUSE, label: 'Penthouse', labelZh: '顶层豪华公寓' },
];

// 常见设施列表
const COMMON_AMENITIES = [
  { id: 'wifi', label: 'WiFi', icon: '📶' },
  { id: 'ac', label: 'Air Conditioning', labelZh: '空调', icon: '❄️' },
  { id: 'heating', label: 'Heating', labelZh: '暖气', icon: '🔥' },
  { id: 'washer', label: 'Washer', labelZh: '洗衣机', icon: '🧺' },
  { id: 'dryer', label: 'Dryer', labelZh: '烘干机', icon: '👕' },
  { id: 'tv', label: 'TV', labelZh: '电视', icon: '📺' },
  { id: 'kitchen', label: 'Kitchen', labelZh: '厨房', icon: '🍳' },
  { id: 'fridge', label: 'Refrigerator', labelZh: '冰箱', icon: '🧊' },
  { id: 'microwave', label: 'Microwave', labelZh: '微波炉', icon: '⏲️' },
  { id: 'dishwasher', label: 'Dishwasher', labelZh: '洗碗机', icon: '🍽️' },
  { id: 'coffee', label: 'Coffee Maker', labelZh: '咖啡机', icon: '☕' },
  { id: 'highspeed_wifi', label: 'High-speed WiFi', labelZh: '高速网络', icon: '🚀' },
  { id: 'gym', label: 'Gym', labelZh: '健身房', icon: '💪' },
  { id: 'parking', label: 'Parking', labelZh: '停车位', icon: '🚗' },
  { id: 'elevator', label: 'Elevator', labelZh: '电梯', icon: '🛗' },
  { id: 'balcony', label: 'Balcony', labelZh: '阳台', icon: '🌅' },
  { id: 'security', label: '24/7 Security', labelZh: '24小时安保', icon: '🔒' },
  { id: 'luggage', label: 'Luggage Storage', labelZh: '行李寄存', icon: '🧳' },
  { id: 'iron', label: 'Iron', labelZh: '熨斗', icon: '👔' },
  { id: 'hairdryer', label: 'Hair Dryer', labelZh: '吹风机', icon: '💨' },
  { id: 'bathtub', label: 'Bathtub', labelZh: '浴缸', icon: '🛁' },
  { id: 'shower', label: 'Shower', labelZh: '淋浴', icon: '🚿' },
  { id: 'fireplace', label: 'Fireplace', labelZh: '壁炉', icon: '🔥' },
  { id: 'garden', label: 'Garden', labelZh: '花园', icon: '🌳' },
  { id: 'pool', label: 'Pool', labelZh: '游泳池', icon: '🏊' },
  { id: 'bbq', label: 'BBQ Area', labelZh: '烧烤区', icon: '🍖' },
  { id: 'workspace', label: 'Workspace', labelZh: '办公区域', icon: '💻' },
  { id: 'pets', label: 'Pet Friendly', labelZh: '宠物友好', icon: '🐾' },
];

// 房源状态选项
const STATUS_OPTIONS = [
  { value: PropertyStatus.DRAFT, label: 'Draft', labelZh: '草稿', color: 'bg-gray-100 text-gray-700' },
  { value: PropertyStatus.PENDING_REVIEW, label: 'Pending Review', labelZh: '待审核', color: 'bg-yellow-100 text-yellow-700' },
  { value: PropertyStatus.PUBLISHED, label: 'Published', labelZh: '已发布', color: 'bg-green-100 text-green-700' },
  { value: PropertyStatus.PAUSED, label: 'Paused', labelZh: '已暂停', color: 'bg-orange-100 text-orange-700' },
  { value: PropertyStatus.ARCHIVED, label: 'Archived', labelZh: '已归档', color: 'bg-red-100 text-red-700' },
];

interface PropertyFormProps {
  initialData?: {
    id?: string;
    title?: { zh?: string; en?: string };
    description?: { zh?: string; en?: string };
    address?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
    propertyType?: PropertyType;
    pricePerNight?: number;
    cleaningFee?: number;
    serviceFee?: number;
    maxGuests?: number;
    bedrooms?: number;
    beds?: number;
    bathrooms?: number;
    area?: number;
    amenities?: string[];
    images?: string[];
    hostId?: string;
    minNights?: number;
    maxNights?: number;
    isInstantBook?: boolean;
    status?: PropertyStatus;
  };
  mode: 'create' | 'edit';
  hosts?: HostOption[];
}

export function PropertyForm({ initialData, mode, hosts = [] }: PropertyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [activeLangTab, setActiveLangTab] = useState<'zh' | 'en'>('zh');

  // 默认系统Host（admin录入时使用）
  const systemHostId = '00000000-0000-0000-0000-000000000001';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      title: { zh: '', en: '' },
      description: { zh: '', en: '' },
      address: '',
      city: '',
      province: 'Ontario',
      postalCode: '',
      country: 'Canada',
      propertyType: PropertyType.APARTMENT,
      pricePerNight: 100,
      cleaningFee: 50,
      serviceFee: 30,
      maxGuests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      area: 50,
      amenities: [],
      images: [],
      hostId: systemHostId,
      minNights: 28,
      maxNights: undefined,
      isInstantBook: false,
      status: PropertyStatus.DRAFT,
      ...initialData,
    },
  });

  const watchedAmenities = watch('amenities') || [];
  const watchedImages = watch('images') || [];
  const watchedStatus = watch('status');
  const watchedHostId = watch('hostId');

  // 预填充表单数据
  useEffect(() => {
    if (initialData) {
      reset({
        title: { zh: initialData.title?.zh || '', en: initialData.title?.en || '' },
        description: { zh: initialData.description?.zh || '', en: initialData.description?.en || '' },
        address: initialData.address || '',
        city: initialData.city || '',
        province: initialData.province || 'Ontario',
        postalCode: initialData.postalCode || '',
        country: initialData.country || 'Canada',
        propertyType: initialData.propertyType || PropertyType.APARTMENT,
        pricePerNight: initialData.pricePerNight || 100,
        cleaningFee: initialData.cleaningFee || 50,
        serviceFee: initialData.serviceFee || 30,
        maxGuests: initialData.maxGuests || 2,
        bedrooms: initialData.bedrooms || 1,
        beds: initialData.beds || 1,
        bathrooms: initialData.bathrooms || 1,
        area: initialData.area || 50,
        amenities: initialData.amenities || [],
        images: initialData.images || [],
        hostId: initialData.hostId || systemHostId,
        minNights: initialData.minNights || 28,
        maxNights: initialData.maxNights,
        isInstantBook: initialData.isInstantBook || false,
        status: initialData.status || PropertyStatus.DRAFT,
      });
    }
  }, [initialData, reset]);

  // 切换设施选择
  const toggleAmenity = (amenityId: string) => {
    const current = watchedAmenities;
    if (current.includes(amenityId)) {
      setValue('amenities', current.filter((id: string) => id !== amenityId));
    } else {
      setValue('amenities', [...current, amenityId]);
    }
  };

  // 添加图片URL
  const addImage = () => {
    if (newImageUrl.trim() && !watchedImages.includes(newImageUrl.trim())) {
      setValue('images', [...watchedImages, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  // 删除图片
  const removeImage = (index: number) => {
    setValue('images', watchedImages.filter((_: string, i: number) => i !== index));
  };

  // 提交表单
  const onSubmit = async (data: unknown) => {
    setLoading(true);
    setError(null);

    try {
      const url = mode === 'create' 
        ? '/api/admin/properties' 
        : `/api/admin/properties/${initialData?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save property');
      }
      
      // 跳转到列表页
      router.push('/admin/properties');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* 头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/admin/properties')}
            className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-neutral-900">
            {mode === 'create' ? 'Add New Property' : 'Edit Property'}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/properties')}
            className="px-4 py-2 text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {mode === 'create' ? 'Create Property' : 'Save Changes'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：主要表单 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 多语言标题和描述 */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Property Information
              </h2>
              
              {/* 语言切换标签 */}
              <div className="flex bg-neutral-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setActiveLangTab('zh')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    activeLangTab === 'zh' 
                      ? 'bg-white text-neutral-900 shadow-sm' 
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  中文
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLangTab('en')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    activeLangTab === 'en' 
                      ? 'bg-white text-neutral-900 shadow-sm' 
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* 标题 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Title ({activeLangTab === 'zh' ? '中文' : 'English'}) *
                </label>
                <input
                  type="text"
                  {...register(`title.${activeLangTab}`)}
                  placeholder={activeLangTab === 'zh' ? '输入房源标题' : 'Enter property title'}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.title?.[activeLangTab] ? 'border-red-500' : 'border-neutral-200'
                  }`}
                />
                {errors.title?.[activeLangTab] && (
                  <p className="mt-1 text-sm text-red-600">{errors.title[activeLangTab]?.message}</p>
                )}
              </div>

              {/* 描述 - 富文本占位 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Description ({activeLangTab === 'zh' ? '中文' : 'English'}) *
                </label>
                <textarea
                  {...register(`description.${activeLangTab}`)}
                  rows={6}
                  placeholder={activeLangTab === 'zh' ? '详细描述房源特色、位置、设施等...' : 'Describe the property features, location, amenities...'}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
                    errors.description?.[activeLangTab] ? 'border-red-500' : 'border-neutral-200'
                  }`}
                />
                {errors.description?.[activeLangTab] && (
                  <p className="mt-1 text-sm text-red-600">{errors.description[activeLangTab]?.message}</p>
                )}
                <p className="mt-1 text-xs text-neutral-500">
                  💡 Tip: You can switch between languages to edit both versions
                </p>
              </div>
            </div>
          </section>

          {/* 位置信息 */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Location
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  {...register('address')}
                  placeholder="123 Main Street"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.address ? 'border-red-500' : 'border-neutral-200'
                  }`}
                />
                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  {...register('city')}
                  placeholder="Toronto"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.city ? 'border-red-500' : 'border-neutral-200'
                  }`}
                />
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Province *
                </label>
                <input
                  type="text"
                  {...register('province')}
                  placeholder="Ontario"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.province ? 'border-red-500' : 'border-neutral-200'
                  }`}
                />
                {errors.province && <p className="mt-1 text-sm text-red-600">{errors.province.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  {...register('postalCode')}
                  placeholder="M5V 3A8"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.postalCode ? 'border-red-500' : 'border-neutral-200'
                  }`}
                />
                {errors.postalCode && <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  {...register('country')}
                  disabled
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-500"
                />
              </div>
            </div>
          </section>

          {/* 房间详情 */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Property Details
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  <Users className="w-4 h-4 inline mr-1" />
                  Max Guests *
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  {...register('maxGuests', { valueAsNumber: true })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.maxGuests ? 'border-red-500' : 'border-neutral-200'
                  }`}
                />
                {errors.maxGuests && <p className="mt-1 text-sm text-red-600">{errors.maxGuests.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  <Bed className="w-4 h-4 inline mr-1" />
                  Bedrooms
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  {...register('bedrooms', { valueAsNumber: true })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.bedrooms ? 'border-red-500' : 'border-neutral-200'
                  }`}
                />
                {errors.bedrooms && <p className="mt-1 text-sm text-red-600">{errors.bedrooms.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  <Bed className="w-4 h-4 inline mr-1" />
                  Beds
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  {...register('beds', { valueAsNumber: true })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.beds ? 'border-red-500' : 'border-neutral-200'
                  }`}
                />
                {errors.beds && <p className="mt-1 text-sm text-red-600">{errors.beds.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  <Bath className="w-4 h-4 inline mr-1" />
                  Bathrooms *
                </label>
                <input
                  type="number"
                  min={0.5}
                  max={10}
                  step={0.5}
                  {...register('bathrooms', { valueAsNumber: true })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.bathrooms ? 'border-red-500' : 'border-neutral-200'
                  }`}
                />
                {errors.bathrooms && <p className="mt-1 text-sm text-red-600">{errors.bathrooms.message}</p>}
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  <Maximize className="w-4 h-4 inline mr-1" />
                  Area (m²)
                </label>
                <input
                  type="number"
                  min={10}
                  max={1000}
                  {...register('area', { valueAsNumber: true })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.area ? 'border-red-500' : 'border-neutral-200'
                  }`}
                />
                {errors.area && <p className="mt-1 text-sm text-red-600">{errors.area.message}</p>}
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  <Home className="w-4 h-4 inline mr-1" />
                  Property Type
                </label>
                <select
                  {...register('propertyType')}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} ({type.labelZh})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* 设施选择 */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              Amenities
            </h2>
            
            <div className="flex flex-wrap gap-2">
              {COMMON_AMENITIES.map((amenity) => (
                <button
                  key={amenity.id}
                  type="button"
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                    watchedAmenities.includes(amenity.id)
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <span>{amenity.icon}</span>
                  <span>{amenity.label}</span>
                </button>
              ))}
            </div>
            
            <p className="mt-3 text-sm text-neutral-500">
              {watchedAmenities.length} amenities selected
            </p>
          </section>

          {/* 图片URL输入 */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Images
            </h2>
            
            <div className="space-y-4">
              {/* 添加图片URL */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Enter image URL (https://...)"
                  className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                />
                <button
                  type="button"
                  onClick={addImage}
                  disabled={!newImageUrl.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              
              {/* 图片预览 */}
              {watchedImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {watchedImages.map((url: string, index: number) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={url}
                        alt={`Property ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder-property.jpg';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-white text-xs rounded">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {watchedImages.length === 0 && (
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
                  <ImageIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600 mb-2">No images added yet</p>
                  <p className="text-sm text-neutral-400">Add image URLs above to showcase the property</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* 右侧：设置和Host */}
        <div className="space-y-6">
          {/* 房源状态 */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Status</h2>
            
            <select
              {...register('status')}
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            
            <p className={`mt-2 text-xs px-2 py-1 rounded inline-block ${
              STATUS_OPTIONS.find(s => s.value === watchedStatus)?.color
            }`}>
              {STATUS_OPTIONS.find(s => s.value === watchedStatus)?.labelZh}
            </p>
          </section>

          {/* Host选择 */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Host
            </h2>
            
            <select
              {...register('hostId')}
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value={systemHostId}>StayNeos System (Default)</option>
              {hosts.map((host) => (
                <option key={host.id} value={host.id}>
                  {host.displayName} ({host.totalProperties} properties)
                </option>
              ))}
            </select>
            
            <p className="mt-2 text-xs text-neutral-500">
              {watchedHostId === systemHostId 
                ? 'Using system default host. The property will show as "Hosted by StayNeos".'
                : `Property will show as hosted by ${hosts.find(h => h.id === watchedHostId)?.displayName || 'selected host'}.`
              }
            </p>
          </section>

          {/* 价格设置 */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Pricing (CAD)
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Price per Night *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="number"
                    min={1}
                    {...register('pricePerNight', { valueAsNumber: true })}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.pricePerNight ? 'border-red-500' : 'border-neutral-200'
                    }`}
                  />
                </div>
                {errors.pricePerNight && <p className="mt-1 text-sm text-red-600">{errors.pricePerNight.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Cleaning Fee
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="number"
                    min={0}
                    {...register('cleaningFee', { valueAsNumber: true })}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Service Fee
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="number"
                    min={0}
                    {...register('serviceFee', { valueAsNumber: true })}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 预订设置 */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Booking Settings</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Min Nights
                  </label>
                  <input
                    type="number"
                    min={1}
                    {...register('minNights', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Max Nights
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="∞"
                    {...register('maxNights', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('isInstantBook')}
                  className="w-5 h-5 text-primary border-neutral-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-neutral-700">Enable Instant Book</span>
              </label>
            </div>
          </section>

          {/* 价格预览 */}
          <section className="bg-primary/5 rounded-xl p-6 border border-primary/20">
            <h3 className="font-semibold text-neutral-900 mb-3">Price Preview</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Base price/night</span>
                <span className="font-medium">${watch('pricePerNight') || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Cleaning fee</span>
                <span className="font-medium">${watch('cleaningFee') || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Service fee</span>
                <span className="font-medium">${watch('serviceFee') || 0}</span>
              </div>
              <div className="border-t border-neutral-200 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total (per stay)*</span>
                  <span>
                    ${(watch('pricePerNight') || 0) + (watch('cleaningFee') || 0) + (watch('serviceFee') || 0)}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">*For a single night stay</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
