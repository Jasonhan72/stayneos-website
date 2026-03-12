// Property Listing Page - 使用真实 API
'use client';
import { PropertyCardData } from '@/types';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  SlidersHorizontal,
  Grid3X3,
  List,
  ChevronDown,
  Star,
  Heart,
  Map as MapIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Bed,
  Bath,
  Maximize,
  Users,
  Calendar
} from 'lucide-react';
import { Button, Container, Card, Badge, Input } from '@/components/ui';
import { Skeleton } from '@/components/ui/Skeleton';
import { ApiErrorAlert } from '@/components/error';
import { AirbnbCalendar } from '@/components/booking';
import { useProperties } from '@/hooks/useProperties';
import { useI18n } from '@/lib/i18n';
import { getPropertyLocation } from '@/lib/utils/property-transform';
import dynamic from 'next/dynamic';

// 动态导入地图组件
const GooglePropertyMap = dynamic(() => import('@/components/property/GooglePropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
      <div className="text-neutral-400">Loading map...</div>
    </div>
  ),
});

// 每页数量
const ITEMS_PER_PAGE = 6;


export default function PropertiesPage() {
  const { t, locale } = useI18n();
  const priceRanges = useMemo(() => ([
    { label: t('properties.filters.price.all', 'All Prices'), min: 0, max: Infinity },
    { label: '$400-500', min: 400, max: 500 },
    { label: '$500-600', min: 500, max: 600 },
    { label: '$600-700', min: 600, max: 700 },
    { label: '$700+', min: 700, max: Infinity },
  ]), [t]);

  const bedroomOptions = useMemo(() => ([
    { label: t('properties.filters.bedrooms.all', 'All'), value: 'any' },
    { label: t('properties.filters.bedrooms.one', '1 BR'), value: '1' },
    { label: t('properties.filters.bedrooms.two', '2 BR'), value: '2' },
    { label: t('properties.filters.bedrooms.threePlus', '3+ BR'), value: '3' },
  ]), [t]);

  const amenitiesList = useMemo(() => ([
    { value: 'WiFi', label: t('properties.amenity.wifi', 'WiFi') },
    { value: 'Kitchen', label: t('properties.amenity.kitchen', 'Kitchen') },
    { value: 'Washer', label: t('properties.amenity.washer', 'Washer') },
    { value: 'Air Conditioning', label: t('properties.amenity.airConditioning', 'Air Conditioning') },
    { value: 'Gym', label: t('properties.amenity.gym', 'Gym') },
    { value: 'Pool', label: t('properties.amenity.pool', 'Pool') },
    { value: 'Parking', label: t('properties.amenity.parking', 'Parking') },
    { value: 'Concierge', label: t('properties.amenity.concierge', 'Concierge') },
  ]), [t]);

  const sortOptions = [
    { value: 'recommended', label: 'sort.recommended' },
    { value: 'price-low', label: 'sort.priceLow' },
    { value: 'price-high', label: 'sort.priceHigh' },
    { value: 'rating', label: 'sort.rating' },
  ];

  const pricingTiers = useMemo<Record<string, string>>(() => {
    if (locale === 'zh') {
      return {
        'prop-55-cooper': '月租 $8,000-10,000 · 季租 $7,500-9,000 · 年租 $6,500-8,000',
        '55-cooper-st-sugar-wharf': '月租 $8,000-10,000 · 季租 $7,500-9,000 · 年租 $6,500-8,000',
        'prop-238-simcoe': '月租 $6,500-8,000 · 季租 $6,000-7,000 · 年租 $5,500-6,500',
        '238-simcoe-st-grange-park': '月租 $6,500-8,000 · 季租 $6,000-7,000 · 年租 $5,500-6,500',
      };
    }
    if (locale === 'fr') {
      return {
        'prop-55-cooper': 'Mensuel 8 000-10 000 $ · Trimestriel 7 500-9 000 $ · Annuel 6 500-8 000 $',
        '55-cooper-st-sugar-wharf': 'Mensuel 8 000-10 000 $ · Trimestriel 7 500-9 000 $ · Annuel 6 500-8 000 $',
        'prop-238-simcoe': 'Mensuel 6 500-8 000 $ · Trimestriel 6 000-7 000 $ · Annuel 5 500-6 500 $',
        '238-simcoe-st-grange-park': 'Mensuel 6 500-8 000 $ · Trimestriel 6 000-7 000 $ · Annuel 5 500-6 500 $',
      };
    }
    return {
      'prop-55-cooper': 'Monthly $8,000-10,000 · Quarterly $7,500-9,000 · Annual $6,500-8,000',
      '55-cooper-st-sugar-wharf': 'Monthly $8,000-10,000 · Quarterly $7,500-9,000 · Annual $6,500-8,000',
      'prop-238-simcoe': 'Monthly $6,500-8,000 · Quarterly $6,000-7,000 · Annual $5,500-6,500',
      '238-simcoe-st-grange-park': 'Monthly $6,500-8,000 · Quarterly $6,000-7,000 · Annual $5,500-6,500',
    };
  }, [locale]);

  
  // State
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [sortBy, setSortBy] = useState('recommended');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  
  // Filters
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);
  const [selectedBedrooms, setSelectedBedrooms] = useState('any');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // 构建 API 查询参数
  const queryParams = useMemo(() => {
    // 处理 sortBy 以符合 PropertyQueryParams 类型
    let sortByValue: 'price' | 'createdAt' | 'rating' | undefined;
    let sortOrderValue: 'asc' | 'desc' = 'asc';
    
    if (sortBy === 'price-low') {
      sortByValue = 'price';
      sortOrderValue = 'asc';
    } else if (sortBy === 'price-high') {
      sortByValue = 'price';
      sortOrderValue = 'desc';
    } else if (sortBy === 'rating') {
      sortByValue = 'rating';
      sortOrderValue = 'desc';
    }
    
    return {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      city: searchQuery || undefined,
      minPrice: selectedPriceRange.min > 0 ? selectedPriceRange.min : undefined,
      maxPrice: selectedPriceRange.max !== Infinity ? selectedPriceRange.max : undefined,
      bedrooms: selectedBedrooms !== 'any' ? parseInt(selectedBedrooms) : undefined,
      sortBy: sortByValue,
      sortOrder: sortOrderValue,
    };
  }, [currentPage, searchQuery, selectedPriceRange, selectedBedrooms, sortBy]);
  
  // 使用 API 获取房源
  const { properties, pagination, isLoading, error } = useProperties(queryParams);
  
  // 转换 API 数据
  const propertyList = useMemo(() => properties, [properties]);
  
  // 本地筛选（价格、卧室数量、amenities）
  const filteredProperties = useMemo(() => {
    let filtered = propertyList;
    
    // 价格筛选
    if (selectedPriceRange.min > 0 || selectedPriceRange.max !== Infinity) {
      filtered = filtered.filter(p => 
        p.price >= selectedPriceRange.min && 
        (selectedPriceRange.max === Infinity || p.price <= selectedPriceRange.max)
      );
    }
    
    // 卧室数量筛选
    if (selectedBedrooms !== 'any') {
      const minBedrooms = parseInt(selectedBedrooms);
      if (selectedBedrooms === '3') {
        filtered = filtered.filter(p => p.bedrooms >= 3);
      } else {
        filtered = filtered.filter(p => p.bedrooms === minBedrooms);
      }
    }
    
    // Amenities 筛选
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(p => 
        selectedAmenities.every(amenity => p.amenities.includes(amenity))
      );
    }
    
    return filtered;
  }, [propertyList, selectedPriceRange, selectedBedrooms, selectedAmenities]);

  // 当筛选条件变化时重置页码
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPriceRange, selectedBedrooms, selectedAmenities, sortBy]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setSelectedPriceRange(priceRanges[0]);
    setSelectedBedrooms('any');
    setSelectedAmenities([]);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const activeFiltersCount = 
    (selectedPriceRange.min > 0 || selectedPriceRange.max !== Infinity ? 1 : 0) +
    (selectedBedrooms !== 'any' ? 1 : 0) +
    selectedAmenities.length;

  // 分页控件
  const getPageNumbers = () => {
    if (!pagination) return [];
    
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    const totalPages = pagination.totalPages;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="pt-24 pb-6 bg-white border-b border-neutral-200">
        <Container>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-neutral-900">
                {t('properties.title')}
              </h1>
              <p className="text-neutral-600">
                {isLoading ? t('common.loading') : t('properties.count', { count: pagination?.total || 0 })}
              </p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500 hidden sm:inline">{t('properties.view')}:</span>
              <div className="flex items-center border border-neutral-300">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary text-white'
                      : 'bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                  title={t('properties.gridView')}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary text-white'
                      : 'bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                  title={t('properties.listView')}
                >
                  <List size={18} />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 transition-colors ${
                    viewMode === 'map'
                      ? 'bg-primary text-white'
                      : 'bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                  title={t('properties.mapView')}
                >
                  <MapIcon size={18} />
                </button>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Search & Filters Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-neutral-200 shadow-sm">
        <Container>
          <div className="py-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                  <Search size={20} />
                </div>
                <Input
                  placeholder={t('properties.searchPlaceholder', 'Search location, property name...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Date Range Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(true)}
                  className="w-full md:w-auto md:min-w-[280px] flex items-center gap-3 px-4 py-3 border-2 border-neutral-200 rounded-xl hover:border-neutral-300 transition-colors bg-white"
                >
                  <Calendar size={20} className="text-neutral-400" />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-neutral-900 uppercase">{t('booking.dates') || 'Dates'}</p>
                    <p className="text-sm text-neutral-600">
                      {checkIn && checkOut 
                        ? `${new Date(checkIn).toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' })} - ${new Date(checkOut).toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' })}`
                        : t('booking.selectDates', 'Select dates')
                      }
                    </p>
                  </div>
                </button>

                {/* Date Picker Modal */}
                {showDatePicker && (
                  <AirbnbCalendar 
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onSelectCheckIn={setCheckIn}
                    onSelectCheckOut={setCheckOut}
                    onClose={() => setShowDatePicker(false)}
                    onClearDates={() => {
                      setCheckIn('');
                      setCheckOut('');
                    }}
                    minNights={28}
                    rating={4.9}
                    currency="CAD"
                  />
                )}
              </div>

              {/* Filter Button */}
              <Button
                variant={isFilterOpen ? 'primary' : 'outline'}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="relative"
              >
                <SlidersHorizontal size={18} className="mr-2" />
                {t('properties.filter')}
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-white text-xs flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="bg-neutral-50 border-b border-neutral-200">
          <Container>
            <div className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    {t('properties.priceRange')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {priceRanges.map((range) => (
                      <button
                        key={range.label}
                        onClick={() => setSelectedPriceRange(range)}
                        className={`px-4 py-2 border text-sm transition-colors ${
                          selectedPriceRange.label === range.label
                            ? 'border-primary bg-primary text-white'
                            : 'border-neutral-300 bg-white hover:border-primary'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    {t('properties.bedrooms')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {bedroomOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSelectedBedrooms(option.value)}
                        className={`px-4 py-2 border text-sm transition-colors ${
                          selectedBedrooms === option.value
                            ? 'border-primary bg-primary text-white'
                            : 'border-neutral-300 bg-white hover:border-primary'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    {t('properties.amenities')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {amenitiesList.map((amenity) => (
                      <button
                        key={amenity.value}
                        onClick={() => toggleAmenity(amenity.value)}
                        className={`px-3 py-2 border text-sm transition-colors ${
                          selectedAmenities.includes(amenity.value)
                            ? 'border-primary bg-primary text-white'
                            : 'border-neutral-300 bg-white hover:border-primary'
                        }`}
                      >
                        {amenity.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-neutral-200">
                <Button variant="ghost" onClick={clearFilters}>
                  {t('properties.resetFilters')}
                </Button>
                <Button onClick={() => setIsFilterOpen(false)}>
                  {t('properties.applyFilters')}
                </Button>
              </div>
            </div>
          </Container>
        </div>
      )}
      
      {/* Error Alert */}
      {error && (
        <Container>
          <div className="py-4">
            <ApiErrorAlert 
              error={error as Error} 
              onRetry={() => window.location.reload()}
            />
          </div>
        </Container>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-200px)]">
        {/* Left Panel - Property List */}
        <div className="w-full lg:w-[60%] lg:overflow-y-auto bg-white">
          <Container className="py-6">
            {/* Results Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-neutral-600">
                {isLoading ? (
                  t('common.loading')
                ) : (
                  <>
                    {t('properties.showing')} <span className="font-medium text-neutral-900">{filteredProperties.length}</span> {' '}
                    {filteredProperties.length === 1 ? t('unit.property') : t('unit.properties')}
                    {pagination && pagination.total > 0 && (
                      <>
                        {' '}{t('properties.of')} <span className="font-medium text-neutral-900">{pagination.total}</span> {' '}
                        {t('unit.properties')}
                      </>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-500 hidden sm:inline">{t('properties.sort')}:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border border-neutral-300 pr-8 pl-3 py-2 text-sm font-medium text-neutral-700 focus:outline-none focus:border-primary cursor-pointer"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {t(option.label)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content based on view mode */}
            <div className="lg:block">
              <div className={`${viewMode === 'map' ? 'hidden lg:block' : 'block'}`}>
                {isLoading ? (
                  viewMode === 'list' ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-neutral-200 p-4 animate-pulse">
                          <div className="flex gap-4">
                            <div className="w-72 h-48 bg-neutral-200 rounded-lg" />
                            <div className="flex-1 space-y-3">
                              <div className="h-5 bg-neutral-200 rounded w-1/3" />
                              <div className="h-4 bg-neutral-200 rounded w-1/2" />
                              <div className="h-4 bg-neutral-200 rounded w-1/4" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Skeleton.PropertyCardList count={6} />
                  )
                ) : viewMode === 'list' ? (
                  /* List View */
                  <div className="space-y-4">
                    {filteredProperties.map((property) => (
                      <PropertyListCard key={property.id} property={property} pricingTier={pricingTiers[property.id]} />
                    ))}
                  </div>
                ) : (
                  /* Grid View */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredProperties.map((property) => (
                      <PropertyGridCard key={property.id} property={property} pricingTier={pricingTiers[property.id]} />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Mobile Map View */}
              {viewMode === 'map' && (
                <div className="lg:hidden h-[calc(100vh-300px)] min-h-[400px]">
                  <GooglePropertyMap 
                    properties={filteredProperties}
                    selectedPropertyId={selectedPropertyId}
                    onPropertySelect={setSelectedPropertyId}
                  />
                </div>
              )}
            </div>

            {/* Empty State */}
            {!isLoading && filteredProperties.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 flex items-center justify-center">
                  <Search size={32} className="text-neutral-400" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  {t('properties.noResults')}
                </h3>
                <p className="text-neutral-600 mb-4">
                  {t('properties.adjustFilters')}
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  {t('properties.clearFilters')}
                </Button>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-neutral-300 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && setCurrentPage(page)}
                    disabled={page === '...'}
                    className={`min-w-[40px] h-10 px-3 border text-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'border-primary bg-primary text-white'
                        : page === '...'
                        ? 'border-transparent cursor-default'
                        : 'border-neutral-300 hover:border-primary'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="p-2 border border-neutral-300 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </Container>
        </div>

        {/* Right Panel - Map (~40% on desktop) */}
        <div className="hidden lg:block lg:w-[40%] lg:sticky lg:top-0 lg:h-full">
          <GooglePropertyMap 
            properties={filteredProperties}
            selectedPropertyId={selectedPropertyId}
            onPropertySelect={setSelectedPropertyId}
          />
        </div>
      </div>

    </main>
  );
}

// Property Grid Card Component
function PropertyGridCard({
  property,
  pricingTier,
}: {
  property: PropertyCardData;
  pricingTier?: string;
}) {
  const { t } = useI18n();
  const location = getPropertyLocation(property);
  
  return (
    <Card className="group overflow-hidden" hover>
      <Link href={`/property/${property.slug || property.id}`}>
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={property.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {property.featured && (
            <Badge className="absolute top-3 left-3" variant="primary">{t('property.featured')}</Badge>
          )}
          
          <button 
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white transition-colors rounded-full"
            onClick={(e) => e.preventDefault()}
          >
            <Heart size={18} className="text-neutral-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-neutral-900 line-clamp-1 group-hover:text-primary transition-colors">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <Star size={14} className="text-accent fill-accent" />
              <span className="text-sm font-medium">{property.rating}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-neutral-500 mb-3">
            <MapPin size={14} />
            <span className="text-sm truncate">{location}</span>
          </div>
          
          <div className="flex items-center gap-3 text-neutral-500 text-sm mb-4">
            <span>{property.bedrooms} {t('property.bedroomsShort')}</span>
            <span>·</span>
            <span>{property.bathrooms} {t('property.bathroomsShort')}</span>
            <span>·</span>
            <span>{property.area} {t('property.areaUnit')}</span>
            <span>·</span>
            <span>{t('property.max')} {property.maxGuests} {t('property.guests')}</span>
          </div>
          
          {pricingTier && (
            <p className="text-xs text-neutral-600 mb-3">{pricingTier}</p>
          )}

          <div className="flex items-baseline justify-between pt-3 border-t border-neutral-200">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-neutral-900">
                ${property.price.toLocaleString()}
              </span>
              <span className="text-sm text-neutral-500">/month</span>
            </div>
            <span className="text-xs text-neutral-400">{property.reviewCount} {t('property.reviews')}</span>
          </div>
        </div>
      </Link>
    </Card>
  );
}

// Property List Card Component
interface PropertyListCardProps {
  property: PropertyCardData;
  pricingTier?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

function PropertyListCard({ property, pricingTier, isSelected, onClick }: PropertyListCardProps) {
  const { t } = useI18n();
  const location = getPropertyLocation(property);
  
  return (
    <Card 
      className={`group ${isSelected ? 'ring-2 ring-primary' : ''}`} 
      hover={!onClick}
      onClick={onClick}
    >
      <Link 
        href={`/property/${property.slug || property.id}`} 
        className="flex flex-col md:flex-row"
        onClick={(e) => onClick && e.preventDefault()}
      >
        {/* Image */}
        <div className="relative w-full md:w-72 h-48 md:h-auto md:min-h-[200px] flex-shrink-0 overflow-hidden">
          <Image
            src={property.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {property.featured && (
            <Badge className="absolute top-3 left-3" variant="primary">{t('property.featured')}</Badge>
          )}
          <button 
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white transition-colors rounded-full"
            onClick={(e) => e.preventDefault()}
          >
            <Heart size={18} className="text-neutral-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary transition-colors">
                {property.title}
              </h3>
              <div className="flex items-center gap-1">
                <Star size={14} className="text-accent fill-accent" />
                <span className="text-sm font-medium">{property.rating}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-neutral-500 mb-3">
              <MapPin size={14} />
              <span className="text-sm">{location}</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-neutral-600 mb-4">
              <div className="flex items-center gap-1">
                <Bed size={14} />
                <span>{property.bedrooms} {t('property.bedroomsShort')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath size={14} />
                <span>{property.bathrooms} {t('property.bathroomsShort')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Maximize size={14} />
                <span>{property.area} {t('property.areaUnit')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>{t('property.max')} {property.maxGuests} {t('property.guests')}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {property.amenities.slice(0, 4).map((amenity) => (
                <span key={amenity} className="px-2 py-1 bg-neutral-100 text-xs text-neutral-600">
                  {t(`properties.amenity.${amenity.toLowerCase().replace(/\s+/g, '')}`, amenity)}
                </span>
              ))}
            </div>
          </div>
          
          {pricingTier && (
            <p className="text-xs text-neutral-600 mt-4">{pricingTier}</p>
          )}

          <div className="flex items-baseline justify-between mt-4 pt-4 border-t border-neutral-200">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-neutral-900">
                ${property.price.toLocaleString()}
              </span>
              <span className="text-neutral-500">/month</span>
            </div>
            <span className="text-sm text-neutral-400">{property.reviewCount} {t('property.reviews')}</span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
