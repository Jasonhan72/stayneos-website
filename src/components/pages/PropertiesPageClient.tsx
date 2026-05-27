// Property Listing Page - 使用真实 API
'use client';
import { PropertyCardData } from '@/types';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Calendar,
  ShieldCheck,
  Home,
  Train,
  GraduationCap,
  Briefcase,
  Sofa,
  Sparkles
} from 'lucide-react';
import { Button, Container, Card, Badge, Input } from '@/components/ui';
import { Skeleton } from '@/components/ui/Skeleton';
import { ApiErrorAlert } from '@/components/error';
import { useProperties } from '@/hooks/useProperties';
import { useI18n } from '@/lib/i18n';
import { useWishlist } from '@/lib/context/WishlistContext';
import { useCurrency } from '@/hooks/useCurrency';
import { getPropertyLocation, resolvePropertyPricingTiers } from '@/lib/utils/property-transform';
import { getTierDiscountPercent, type PricingTier } from '@/lib/property-pricing-discounts';
import FilterChips, { type FilterChip } from '@/components/property/FilterChips';
import FilterModal, { PROPERTY_TYPES } from '@/components/property/FilterModal';
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

const AirbnbCalendar = dynamic(() => import('@/components/booking').then((mod) => mod.AirbnbCalendar), {
  ssr: false,
  loading: () => null,
});

// 每页数量 (暂时未使用)
// const ITEMS_PER_PAGE = 6;


export default function PropertiesPage() {
  const { t, locale } = useI18n();
  const urlParams = useSearchParams();
  const priceRanges = useMemo(() => ([
    { label: t('properties.filters.price.all', 'All Prices'), min: 0, max: Infinity },
    { label: '$3,000-5,000', min: 3000, max: 5000 },
    { label: '$5,000-7,000', min: 5000, max: 7000 },
    { label: '$7,000-9,000', min: 7000, max: 9000 },
    { label: '$9,000+', min: 9000, max: Infinity },
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

  const trustCategories = useMemo(() => ([
    { id: 'all', label: t('properties.categories.all', 'All stays'), icon: Home },
    { id: 'downtown', label: t('properties.categories.downtown', 'Downtown'), icon: Briefcase },
    { id: 'subway', label: t('properties.categories.subway', 'Near subway'), icon: Train },
    { id: 'university', label: t('properties.categories.university', 'Near UofT'), icon: GraduationCap },
    { id: 'furnished', label: t('properties.categories.furnished', 'Furnished'), icon: Sofa },
    { id: 'luxury', label: t('properties.categories.luxury', 'Luxury condo'), icon: Sparkles },
    { id: 'verified', label: t('properties.categories.verified', 'NEOS verified'), icon: ShieldCheck },
  ]), [t]);

  const sortOptions = [
    { value: 'recommended', label: 'sort.recommended' },
    { value: 'price-low', label: 'sort.priceLow' },
    { value: 'price-high', label: 'sort.priceHigh' },
    { value: 'rating', label: 'sort.rating' },
  ];


  
  // Hydrate initial state from search params (coming from SearchBar navigation)
  const initSearchQuery = urlParams?.get('city') ?? '';
  const initCheckIn = urlParams?.get('checkIn') ?? '';
  const initCheckOut = urlParams?.get('checkOut') ?? '';
  const _initGuests = Number(urlParams?.get('guests')) || 1;

  // State
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [sortBy, setSortBy] = useState('recommended');
  const [searchQuery, setSearchQuery] = useState(initSearchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Filters
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);
  const [selectedBedrooms, setSelectedBedrooms] = useState('any');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [checkIn, setCheckIn] = useState(initCheckIn);
  const [checkOut, setCheckOut] = useState(initCheckOut);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  
  // 构建 API 查询参数
  // 暂时禁用过滤参数
  // const queryParams = useMemo(() => {
  //   return {};
  // }, []);
  
  // 使用 API 获取房源
  const { properties, pagination, isLoading, error } = useProperties();
  
  // 转换 API 数据
  const propertyList = useMemo(() => properties, [properties]);
  
  // 本地筛选（价格、卧室数量、amenities）
  const filteredProperties = useMemo(() => {
    let filtered = propertyList;
    
    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((p) => {
        const pMeta = p as PropertyCardData & { city?: string; neighborhood?: string };
        return [p.title, p.description, p.location, pMeta.city, pMeta.neighborhood, ...(p.amenities || [])]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query);
      });
    }

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
    
    // Airbnb-style category browsing for long-term stays
    if (activeCategory !== 'all') {
      filtered = filtered.filter((p) => {
        const pMeta = p as PropertyCardData & { city?: string; neighborhood?: string };
        const haystack = [p.title, p.description, p.location, pMeta.city, pMeta.neighborhood, ...(p.amenities || [])]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        switch (activeCategory) {
          case 'downtown':
            return haystack.includes('downtown') || haystack.includes('financial') || haystack.includes('waterfront') || haystack.includes('grange') || haystack.includes('yonge');
          case 'subway':
            return haystack.includes('subway') || haystack.includes('station') || haystack.includes('transit') || haystack.includes('union') || haystack.includes('wellesley') || haystack.includes('osgoode') || haystack.includes('st. patrick');
          case 'university':
            return haystack.includes('uoft') || haystack.includes('university') || haystack.includes('campus') || haystack.includes('student') || haystack.includes('hospital');
          case 'furnished':
            return haystack.includes('furnished') || haystack.includes('kitchen') || haystack.includes('wifi') || haystack.includes('linens');
          case 'luxury':
            return haystack.includes('luxury') || haystack.includes('concierge') || haystack.includes('pool') || haystack.includes('gym') || haystack.includes('waterfront');
          case 'verified':
            return true;
          default:
            return true;
        }
      });
    }

    // Amenities 筛选
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(p => 
        selectedAmenities.every(amenity => p.amenities.includes(amenity))
      );
    }
    
    // 房源类型筛选
    if (selectedPropertyTypes.length > 0) {
      filtered = filtered.filter(p =>
        selectedPropertyTypes.some(type =>
          (p.title + (p.slug || '')).toLowerCase().includes(type.toLowerCase())
        )
      );
    }

    return filtered;
  }, [propertyList, searchQuery, selectedPriceRange, selectedBedrooms, selectedAmenities, selectedPropertyTypes, activeCategory]);

  // 当筛选条件变化时重置页码
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPriceRange, selectedBedrooms, selectedAmenities, selectedPropertyTypes, sortBy, activeCategory]);

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
    setSelectedPropertyTypes([]);
    setSearchQuery('');
    setActiveCategory('all');
    setCurrentPage(1);
  };

  const activeFiltersCount = 
    (selectedPriceRange.min > 0 || selectedPriceRange.max !== Infinity ? 1 : 0) +
    (selectedPropertyTypes.length > 0 ? 1 : 0) +
    (selectedBedrooms !== 'any' ? 1 : 0) +
    selectedAmenities.length;
  // Build filter chips for display
  const filterChips = useMemo((): FilterChip[] => {
    const chips: FilterChip[] = [];
    if (selectedPriceRange.min > 0 || selectedPriceRange.max !== Infinity) {
      chips.push({ key: 'price', label: selectedPriceRange.label, onRemove: () => setSelectedPriceRange(priceRanges[0]) });
    }
    if (selectedBedrooms !== 'any') {
      const opt = bedroomOptions.find(o => o.value === selectedBedrooms);
      chips.push({ key: 'bedrooms', label: opt?.label || selectedBedrooms, onRemove: () => setSelectedBedrooms('any') });
    }
    selectedPropertyTypes.forEach(type => {
      const pt = PROPERTY_TYPES.find(t => t.value === type);
      chips.push({ key: `type-${type}`, label: pt?.label || type, onRemove: () => setSelectedPropertyTypes(prev => prev.filter(t => t !== type)) });
    });
    selectedAmenities.forEach(amenity => {
      const am = amenitiesList.find(a => a.value === amenity);
      chips.push({ key: `amenity-${amenity}`, label: am?.label || amenity, onRemove: () => setSelectedAmenities(prev => prev.filter(a => a !== amenity)) });
    });
    return chips;
  }, [selectedPriceRange, selectedBedrooms, selectedPropertyTypes, selectedAmenities, bedroomOptions, amenitiesList, priceRanges]);



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
    <main id="main-content" className="min-h-screen bg-white">
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
              <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`min-h-11 min-w-11 p-2 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary text-white'
                      : 'bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                  aria-label={t('properties.gridView')}
                  title={t('properties.gridView')}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`min-h-11 min-w-11 p-2 transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary text-white'
                      : 'bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                  aria-label={t('properties.listView')}
                  title={t('properties.listView')}
                >
                  <List size={18} />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`min-h-11 min-w-11 p-2 transition-colors ${
                    viewMode === 'map'
                      ? 'bg-primary text-white'
                      : 'bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                  aria-label={t('properties.mapView')}
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
                    rating={0}
                    currency="CAD"
                  />
                )}
              </div>

              {/* Filter Button */}
              <Button
                variant="outline"
                onClick={() => setShowFilterModal(true)}
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

      {/* Airbnb-inspired category browsing */}
      <div className="bg-white border-b border-neutral-200">
        <Container>
          <div className="flex gap-8 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Stay categories">
            {trustCategories.map((category) => {
              const Icon = category.icon;
              const active = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex min-h-11 min-w-11 shrink-0 flex-col items-center gap-1.5 border-b-2 px-1 pb-2 text-xs font-semibold transition-colors ${active ? 'border-neutral-950 text-neutral-950' : 'border-transparent text-neutral-500 hover:text-neutral-950'}`}
                >
                  <Icon size={23} strokeWidth={active ? 2.4 : 1.8} />
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </Container>
      </div>

      {/* Filter Panel */}
      {/* Filter Modal */}
      <FilterModal
        open={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        priceRanges={priceRanges}
        selectedPriceRange={selectedPriceRange}
        onPriceRangeChange={setSelectedPriceRange}
        bedroomOptions={bedroomOptions}
        selectedBedrooms={selectedBedrooms}
        onBedroomsChange={setSelectedBedrooms}
        amenitiesList={amenitiesList}
        selectedAmenities={selectedAmenities}
        onAmenityToggle={toggleAmenity}
        selectedPropertyTypes={selectedPropertyTypes}
        onPropertyTypeToggle={(value) => setSelectedPropertyTypes(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])}
        onClearAll={clearFilters}
        onApply={() => setShowFilterModal(false)}
        activeFilterCount={activeFiltersCount}
      />
      
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
      <div className="flex flex-col lg:flex-row">
        {/* Left Panel - Property List */}
        <div className="w-full lg:w-[60%] lg:overflow-y-auto lg:h-[calc(100vh-80px)] bg-white">
          <Container className="pt-2 pb-0">
            <FilterChips
              chips={filterChips}
              activeCount={activeFiltersCount}
              onOpenModal={() => setShowFilterModal(true)}
              onClearAll={clearFilters}
              className="mb-2"
            />
          </Container>
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
                      className="min-h-11 appearance-none bg-white border border-neutral-300 pr-8 pl-3 py-2 text-sm font-medium text-neutral-700 focus:outline-none focus:border-primary cursor-pointer"
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
                      <PropertyListCard key={property.id} property={property} onHover={setHoveredPropertyId} cardRef={(el) => { cardRefs.current[property.id] = el; }} />
                    ))}
                  </div>
                ) : (
                  /* Grid View */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredProperties.map((property) => (
                      <PropertyGridCard key={property.id} property={property} onHover={setHoveredPropertyId} cardRef={(el) => { cardRefs.current[property.id] = el; }} />
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
                    hoveredPropertyId={hoveredPropertyId}
                    onPropertySelect={(id) => {
                      setSelectedPropertyId(id);
                      cardRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
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
        <div className="hidden lg:block lg:w-[40%] lg:sticky lg:top-[80px] lg:h-[calc(100vh-80px)]">
          <GooglePropertyMap 
            properties={filteredProperties}
            selectedPropertyId={selectedPropertyId}
            hoveredPropertyId={hoveredPropertyId}
            onPropertySelect={(id) => {
              setSelectedPropertyId(id);
              cardRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
          />
        </div>
      </div>

    </main>
  );
}

// Property Grid Card Component
function PropertyGridCard({
  property,
  onHover,
  cardRef,
}: {
  property: PropertyCardData;
  onHover?: (id: string | null) => void;
  cardRef?: (el: HTMLDivElement | null) => void;
}) {
  const { t } = useI18n();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const liked = isWishlisted(property.id);
  const location = getPropertyLocation(property);
  
  return (
    <Card className="group overflow-hidden rounded-2xl" hover>
      <div
        ref={cardRef}
        onMouseEnter={() => onHover?.(property.id)}
        onMouseLeave={() => onHover?.(null)}
      >
      <Link href={`/property/${property.slug || property.id}`}>
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={property.images[0] || '/images/cooper-55-c5e8357d.jpg'}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 30vw, 24vw"
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-neutral-950 shadow-sm">
              <ShieldCheck size={13} className="text-emerald-600" /> {t('properties.categories.verified', 'NEOS verified')}
            </span>
            {property.featured && (
              <Badge variant="primary">{t('property.featured')}</Badge>
            )}
          </div>
          
          <button 
            className="absolute top-3 right-3 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/90 p-2 transition-colors hover:bg-white"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(property.id); }}
          >
            <Heart size={18} className={liked ? 'fill-rose-500 text-rose-500' : 'text-neutral-400 hover:text-rose-500'} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-neutral-900 line-clamp-1 group-hover:text-primary transition-colors">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              {property.reviewCount > 0 ? (
                <>
                  <Star size={14} className="text-accent fill-accent" />
                  <span className="text-sm font-medium">{property.rating}</span>
                </>
              ) : (
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">{t('property.newVerified', 'New verified')}</span>
              )}
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
            <span>{property.area} sqft</span>
            <span>·</span>
            <span>{t('property.max')} {property.maxGuests} {t('property.guests')}</span>
          </div>
          
          <div className="mb-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600">
            <div className="flex items-center justify-between"><span>{t('property.available30Days', 'Available for 30+ days')}</span><span className="font-semibold text-neutral-900">{t('property.noHiddenFees', 'No hidden fees')}</span></div>
          </div>
          <PropertyPricingTiers property={property} compact />
          {/* Hotel Comparison */}
          <div className="hotel-comparison mt-1">
            <span className="text-xs text-neutral-500">
              {t('property.hotelEquivalent', 'Hotel equivalent:')}{' '}
              <span className="text-neutral-400 line-through">
                {property.id === '1' ? '~$18,000/mo' : property.id === '2' ? '~$10,500/mo' : property.id === '3' ? '~$7,500/mo' : ''}
              </span>
            </span>
          </div>
          {property.reviewCount > 0 && (
            <p className="text-xs text-neutral-400 mt-2">{property.reviewCount} {t('property.reviews')}</p>
          )}
        </div>
      </Link>
      </div>
    </Card>
  );
}

// Property List Card Component
interface PropertyListCardProps {
  property: PropertyCardData;
  isSelected?: boolean;
  onClick?: () => void;
  onHover?: (id: string | null) => void;
  cardRef?: (el: HTMLDivElement | null) => void;
}

function PropertyListCard({ property, isSelected, onClick, onHover, cardRef }: PropertyListCardProps) {
  const { t } = useI18n();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const liked = isWishlisted(property.id);
  const location = getPropertyLocation(property);
  
  return (
    <Card 
      className={`group rounded-2xl ${isSelected ? 'ring-2 ring-primary' : ''}`} 
      hover={!onClick}
      onClick={onClick}
    >
      <div
        ref={cardRef}
        onMouseEnter={() => onHover?.(property.id)}
        onMouseLeave={() => onHover?.(null)}
      >
      <Link 
        href={`/property/${property.slug || property.id}`} 
        className="flex flex-col md:flex-row"
        onClick={(e) => onClick && e.preventDefault()}
      >
        {/* Image */}
        <div className="relative w-full md:w-72 h-48 md:h-auto md:min-h-[200px] flex-shrink-0 overflow-hidden">
          <Image
            src={property.images[0] || '/images/cooper-55-c5e8357d.jpg'}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, 288px"
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-neutral-950 shadow-sm">
              <ShieldCheck size={13} className="text-emerald-600" /> {t('properties.categories.verified', 'NEOS verified')}
            </span>
            {property.featured && (
              <Badge variant="primary">{t('property.featured')}</Badge>
            )}
          </div>
          <button 
            className="absolute top-3 right-3 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/90 p-2 transition-colors hover:bg-white"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(property.id); }}
          >
            <Heart size={18} className={liked ? 'fill-rose-500 text-rose-500' : 'text-neutral-400 hover:text-rose-500'} />
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
                {property.reviewCount > 0 ? (
                  <>
                    <Star size={14} className="text-accent fill-accent" />
                    <span className="text-sm font-medium">{property.rating}</span>
                  </>
                ) : (
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">{t('property.newVerified', 'New verified')}</span>
                )}
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
                <span>{property.area} sqft</span>
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
          
          <div className="mt-4">
            <div className="mb-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-600">
              <div className="flex items-center justify-between"><span>Minimum 30 days</span><span className="font-semibold text-neutral-900">All-inclusive estimate</span></div>
            </div>
            <PropertyPricingTiers property={property} />
            {/* Hotel Comparison */}
            <div className="hotel-comparison mt-2">
              <span className="text-sm text-neutral-500">
                {t('property.hotelEquivalent', 'Hotel equivalent:')}{' '}
                <span className="text-neutral-400 line-through">
                  {property.id === '1' ? '~$18,000/mo' : property.id === '2' ? '~$10,500/mo' : property.id === '3' ? '~$7,500/mo' : ''}
                </span>
              </span>
            </div>
          </div>
          {property.reviewCount > 0 && (
            <p className="text-sm text-neutral-400 mt-2">{property.reviewCount} {t('property.reviews')}</p>
          )}
        </div>
      </Link>
      </div>
    </Card>
  );
}


function PropertyPricingTiers({ property, compact = false }: { property: PropertyCardData; compact?: boolean }) {
  const { locale, t } = useI18n();
  const { formatPrice } = useCurrency();
  const tiers = resolvePropertyPricingTiers(property);
  const labels = locale === 'zh'
    ? { monthly: '月价', quarterly: '季价', annual: '年价', perMonth: '/月' }
    : locale === 'fr'
      ? { monthly: 'Mensuel', quarterly: 'Trimestriel', annual: 'Annuel', perMonth: '/mois' }
      : { monthly: 'Monthly', quarterly: 'Quarterly', annual: 'Annual', perMonth: '/Mo' };

  const rowClass = compact ? 'text-sm' : 'text-base';
  const rows: Array<{ key: PricingTier; label: string; value: number }> = [
    { key: 'monthly', label: labels.monthly, value: tiers.monthly },
    { key: 'quarterly', label: labels.quarterly, value: tiers.quarterly },
    { key: 'annual', label: labels.annual, value: tiers.annual },
  ];

  return (
    <div className={`space-y-2 ${compact ? 'pt-3 border-t border-neutral-200' : 'pt-4 border-t border-neutral-200'}`}>
      {rows.map((row) => {
        const discountPercent = getTierDiscountPercent(tiers, row.key);

        return (
          <div key={row.key} className="flex items-center justify-between gap-3">
            <span className="text-neutral-600 text-sm">{row.label}</span>
            <span className="flex shrink-0 items-center gap-2">
              {discountPercent > 0 && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {t('property.savePercent', 'Save {percent}%', { percent: discountPercent })}
                </span>
              )}
              <span className={`${rowClass} font-semibold text-neutral-900`}>
                {formatPrice(row.value)}
                <span className="text-xs font-normal text-neutral-500 ml-1">{labels.perMonth}</span>
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
