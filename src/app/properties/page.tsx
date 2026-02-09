// Property Listing Page - Blueground Style + Square UI + Mapbox
'use client';

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
  Users
} from 'lucide-react';
import { Button, Container, Card, Badge, Input } from '@/components/ui';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { mockProperties } from '@/lib/data';
import dynamic from 'next/dynamic';
import BackToHomeButton from '@/components/navigation/BackToHomeButton';

// Dynamically import Google Maps component to avoid SSR issues
const GooglePropertyMap = dynamic(() => import('@/components/property/GooglePropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
      <div className="text-neutral-400">地图加载中...⏳</div>
    </div>
  ),
});

// Filter options
const priceRanges = [
  { label: '全部价格', min: 0, max: Infinity },
  { label: '$400-500', min: 400, max: 500 },
  { label: '$500-600', min: 500, max: 600 },
  { label: '$600-700', min: 600, max: 700 },
  { label: '$700+', min: 700, max: Infinity },
];

const bedroomOptions = [
  { label: '全部', value: 'any' },
  { label: '1室', value: '1' },
  { label: '2室', value: '2' },
  { label: '3室+', value: '3' },
];

const amenitiesList = [
  'WiFi', '厨房', '洗衣机', '空调', '健身房', '游泳池', '停车位', '管家服务'
];

const sortOptions = [
  { value: 'recommended', label: '推荐' },
  { value: 'price-low', label: '价格从低到高' },
  { value: 'price-high', label: '价格从高到低' },
  { value: 'rating', label: '评分最高' },
];

// Pagination settings
const ITEMS_PER_PAGE = 6;

export default function PropertiesPage() {
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
  
  // Filter logic
  const filteredProperties = useMemo(() => {
    let filtered = [...mockProperties];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query)
      );
    }
    
    // Price filter
    filtered = filtered.filter(p => 
      p.price >= selectedPriceRange.min && p.price <= selectedPriceRange.max
    );
    
    // Bedroom filter
    if (selectedBedrooms !== 'any') {
      const minBedrooms = parseInt(selectedBedrooms);
      filtered = filtered.filter(p => p.bedrooms >= minBedrooms);
    }
    
    // Amenities filter
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(p => 
        selectedAmenities.every(amenity => p.amenities.includes(amenity))
      );
    }
    
    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }
    
    return filtered;
  }, [searchQuery, selectedPriceRange, selectedBedrooms, selectedAmenities, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProperties.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProperties, currentPage]);

  // Reset page when filters change
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
    (selectedPriceRange.label !== '全部价格' ? 1 : 0) +
    (selectedBedrooms !== 'any' ? 1 : 0) +
    selectedAmenities.length;

  // Pagination controls
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
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
                全部房源
              </h1>
              <p className="text-neutral-600">
                共 {filteredProperties.length} 套精选行政公寓
              </p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500 hidden sm:inline">视图模式:</span>
              <div className="flex items-center border border-neutral-300">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary text-white'
                      : 'bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                  title="网格视图"
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
                  title="列表视图"
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
                  title="地图视图"
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
                  placeholder="搜索位置、房源名称..."
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

              {/* Date Range Picker - Airbnb Style */}
              <DateRangePicker
                checkIn={checkIn}
                checkOut={checkOut}
                onCheckInChange={setCheckIn}
                onCheckOutChange={setCheckOut}
                minNights={28}
                className="w-full md:w-auto md:min-w-[280px]"
              />

              {/* Filter Button */}
              <Button
                variant={isFilterOpen ? 'primary' : 'outline'}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="relative"
              >
                <SlidersHorizontal size={18} className="mr-2" />
                筛选
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
                    价格范围 (CAD/晚)
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
                    卧室数量
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
                    配套设施
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {amenitiesList.map((amenity) => (
                      <button
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`px-3 py-2 border text-sm transition-colors ${
                          selectedAmenities.includes(amenity)
                            ? 'border-primary bg-primary text-white'
                            : 'border-neutral-300 bg-white hover:border-primary'
                        }`}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-neutral-200">
                <Button variant="ghost" onClick={clearFilters}>
                  重置筛选
                </Button>
                <Button onClick={() => setIsFilterOpen(false)}>
                  应用筛选
                </Button>
              </div>
            </div>
          </Container>
        </div>
      )}

      {/* Main Content Area */}
      <Container className="py-6">
        {/* Results Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-neutral-600">
            显示 <span className="font-medium text-neutral-900">{paginatedProperties.length}</span> 套房源
            {filteredProperties.length > 0 && (
              <>  
                ，共 <span className="font-medium text-neutral-900">{filteredProperties.length}</span> 套
              </>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600 hidden sm:inline">排序:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-neutral-300 pr-8 pl-3 py-2 text-sm font-medium text-neutral-700 focus:outline-none focus:border-primary cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
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
        {viewMode === 'map' ? (
          /* Map View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
              {paginatedProperties.map((property) => (
                <PropertyListCard 
                  key={property.id} 
                  property={property}
                  isSelected={selectedPropertyId === property.id}
                  onClick={() => setSelectedPropertyId(property.id)}
                />
              ))}
            </div>
            <div className="lg:col-span-2 h-[calc(100vh-300px)] min-h-[500px]">
              <GooglePropertyMap 
                properties={filteredProperties}
                selectedPropertyId={selectedPropertyId}
                onPropertySelect={setSelectedPropertyId}
              />
            </div>
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="space-y-4">
            {paginatedProperties.map((property) => (
              <PropertyListCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProperties.map((property) => (
              <PropertyGridCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 flex items-center justify-center">
              <Search size={32} className="text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              没有找到符合条件的房源
            </h3>
            <p className="text-neutral-600 mb-4">
              尝试调整筛选条件或搜索关键词
            </p>
            <Button variant="outline" onClick={clearFilters}>
              清除筛选
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
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
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-neutral-300 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </Container>

      {/* Back to Home Button */}
      <BackToHomeButton />
    </main>
  );
}

// Property Grid Card Component
function PropertyGridCard({ 
  property 
}: { 
  property: typeof mockProperties[0]; 
}) {
  return (
    <Card className="group overflow-hidden" hover>
      <Link href={`/property/${property.id}`}>
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={property.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {property.featured && (
            <Badge className="absolute top-3 left-3" variant="primary">精选</Badge>
          )}
          
          <button 
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white transition-colors"
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
            <span className="text-sm truncate">{property.location}</span>
          </div>
          
          <div className="flex items-center gap-3 text-neutral-500 text-sm mb-4">
            <span>{property.bedrooms}室</span>
            <span>·</span>
            <span>{property.area}m²</span>
            <span>·</span>
            <span>最多{property.maxGuests}人</span>
          </div>
          
          <div className="flex items-baseline justify-between pt-3 border-t border-neutral-200">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-neutral-900">
                ${property.price.toLocaleString()}
              </span>
              <span className="text-sm text-neutral-500">/{property.priceUnit}</span>
            </div>
            <span className="text-xs text-neutral-400">{property.reviewCount} 条评价</span>
          </div>
        </div>
      </Link>
    </Card>
  );
}

// Property List Card Component
interface PropertyListCardProps {
  property: typeof mockProperties[0];
  isSelected?: boolean;
  onClick?: () => void;
}

function PropertyListCard({ property, isSelected, onClick }: PropertyListCardProps) {
  return (
    <Card 
      className={`group ${isSelected ? 'ring-2 ring-primary' : ''}`} 
      hover={!onClick}
      onClick={onClick}
    >
      <Link 
        href={`/property/${property.id}`} 
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
            <Badge className="absolute top-3 left-3" variant="primary">精选</Badge>
          )}
          <button 
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white transition-colors"
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
              <span className="text-sm">{property.location}</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-neutral-600 mb-4">
              <div className="flex items-center gap-1">
                <Bed size={14} />
                <span>{property.bedrooms}室</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath size={14} />
                <span>{property.bathrooms}卫</span>
              </div>
              <div className="flex items-center gap-1">
                <Maximize size={14} />
                <span>{property.area}m²</span>
              </div>
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>最多{property.maxGuests}人</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {property.amenities.slice(0, 4).map((amenity) => (
                <span key={amenity} className="px-2 py-1 bg-neutral-100 text-xs text-neutral-600">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex items-baseline justify-between mt-4 pt-4 border-t border-neutral-200">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-neutral-900">
                ${property.price.toLocaleString()}
              </span>
              <span className="text-neutral-500">CAD/{property.priceUnit}</span>
            </div>
            <span className="text-sm text-neutral-400">{property.reviewCount} 条评价</span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
