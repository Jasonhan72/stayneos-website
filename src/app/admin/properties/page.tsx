'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  MapPin,
  Bed,
  Bath,
  Users,
  DollarSign,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Building2
} from 'lucide-react';
import { PropertyStatus } from '@prisma/client';
import AdminLayout from '@/components/admin/AdminLayout';

// 房源状态配置
const STATUS_CONFIG: Record<PropertyStatus, { label: string; labelZh: string; color: string }> = {
  DRAFT: { label: 'Draft', labelZh: '草稿', color: 'bg-gray-100 text-gray-700' },
  PENDING_REVIEW: { label: 'Pending', labelZh: '待审核', color: 'bg-yellow-100 text-yellow-700' },
  PUBLISHED: { label: 'Published', labelZh: '已发布', color: 'bg-green-100 text-green-700' },
  PAUSED: { label: 'Paused', labelZh: '已暂停', color: 'bg-orange-100 text-orange-700' },
  ARCHIVED: { label: 'Archived', labelZh: '已归档', color: 'bg-red-100 text-red-700' },
};

// 房源类型
interface Property {
  id: string;
  title: { zh: string; en: string };
  address: string;
  city: string;
  pricePerNight: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  status: PropertyStatus;
  images: string[];
  hostId: string;
  hostName?: string;
  createdAt: string;
  updatedAt: string;
}

// 模拟数据 - 后续替换为API调用
const mockProperties: Property[] = [
  {
    id: 'prop-1',
    title: { zh: '市中心豪华公寓', en: 'Luxury Downtown Apartment' },
    address: '123 Main Street',
    city: 'Toronto',
    pricePerNight: 180,
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    status: PropertyStatus.PUBLISHED,
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'],
    hostId: 'host-1',
    hostName: 'Nazli',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-02-20T00:00:00Z',
  },
  {
    id: 'prop-2',
    title: { zh: '北约克现代公寓', en: 'Modern North York Condo' },
    address: '456 Yonge Street',
    city: 'Toronto',
    pricePerNight: 150,
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    status: PropertyStatus.DRAFT,
    images: [],
    hostId: 'host-1',
    hostName: 'Nazli',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-18T00:00:00Z',
  },
  {
    id: 'prop-3',
    title: { zh: '湖滨景观公寓', en: 'Lakeside View Condo' },
    address: '789 Lakeshore Blvd',
    city: 'Toronto',
    pricePerNight: 220,
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    status: PropertyStatus.PUBLISHED,
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400'],
    hostId: 'host-2',
    hostName: 'StayNeos Team',
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z',
  },
];

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'all'>('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // 分页
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 加载房源数据
  useEffect(() => {
    // 模拟API调用
    const fetchProperties = async () => {
      try {
        // const response = await fetch('/api/admin/properties');
        // const data = await response.json();
        // setProperties(data.properties);
        
        // 使用模拟数据
        setTimeout(() => {
          setProperties(mockProperties);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Failed to fetch properties:', error);
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // 过滤房源
  const filteredProperties = properties.filter((prop) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      prop.title.zh.toLowerCase().includes(searchLower) ||
      prop.title.en.toLowerCase().includes(searchLower) ||
      prop.address.toLowerCase().includes(searchLower) ||
      prop.city.toLowerCase().includes(searchLower) ||
      prop.hostName?.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || prop.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // 分页数据
  const totalPages = Math.ceil(filteredProperties.length / pageSize);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 处理删除
  const handleDeleteClick = (property: Property) => {
    setPropertyToDelete(property);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;
    
    setDeleting(true);
    try {
      // await fetch(`/api/admin/properties/${propertyToDelete.id}`, { method: 'DELETE' });
      setProperties(properties.filter((p) => p.id !== propertyToDelete.id));
      setDeleteModalOpen(false);
      setPropertyToDelete(null);
    } catch (error) {
      console.error('Failed to delete property:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout 
      title="Properties Management"
      breadcrumbs={[{ label: 'Properties' }]}
      actions={
        <Link
          href="/admin/properties/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </Link>
      }
    >
      <div className="space-y-6">
        {/* 搜索和过滤栏 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search by title, address, city, host..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-80"
                />
              </div>
              
              {/* 状态过滤 */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as PropertyStatus | 'all');
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-8 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white cursor-pointer"
                >
                  <option value="all">All Status</option>
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <option key={status} value={status}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 统计信息 */}
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <span>Total: <strong className="text-neutral-900">{filteredProperties.length}</strong> properties</span>
            </div>
          </div>
        </div>

        {/* 房源列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-neutral-200">
            <Building2 className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No properties found</h3>
            <p className="text-neutral-500 mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first property'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link
                href="/admin/properties/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Property
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            {/* 桌面端表格 */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Price/Night
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Host
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {paginatedProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-lg bg-neutral-200 overflow-hidden flex-shrink-0">
                            {property.images[0] ? (
                              <img
                                src={property.images[0]}
                                alt={property.title.en}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-neutral-400" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-neutral-900 truncate">{property.title.en}</p>
                            <p className="text-sm text-neutral-500 truncate">{property.title.zh}</p>
                            <p className="text-xs text-neutral-400">ID: {property.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-neutral-600">
                          <MapPin className="w-4 h-4" />
                          <span>{property.city}</span>
                        </div>
                        <p className="text-sm text-neutral-500 truncate max-w-xs">{property.address}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 text-sm text-neutral-600">
                          <span className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            {property.bedrooms}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            {property.bathrooms}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {property.maxGuests}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 font-medium text-neutral-900">
                          <DollarSign className="w-4 h-4" />
                          {property.pricePerNight}
                          <span className="text-sm text-neutral-500 font-normal">/night</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-neutral-600">{property.hostName || 'Unknown'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[property.status].color}`}>
                          {STATUS_CONFIG[property.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/property/${property.id}`}
                            target="_blank"
                            className="p-2 text-neutral-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/properties/${property.id}/edit`}
                            className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(property)}
                            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 移动端卡片列表 */}
            <div className="lg:hidden divide-y divide-neutral-200">
              {paginatedProperties.map((property) => (
                <div key={property.id} className="p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg bg-neutral-200 overflow-hidden flex-shrink-0">
                      {property.images[0] ? (
                        <img
                          src={property.images[0]}
                          alt={property.title.en}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-neutral-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-neutral-900 truncate">{property.title.en}</h3>
                      <p className="text-sm text-neutral-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {property.city}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-sm text-neutral-600">
                        <span className="flex items-center gap-1">
                          <Bed className="w-3 h-3" />
                          {property.bedrooms}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath className="w-3 h-3" />
                          {property.bathrooms}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1 font-medium text-neutral-900">
                          <DollarSign className="w-4 h-4" />
                          {property.pricePerNight}
                          <span className="text-xs text-neutral-500 font-normal">/night</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[property.status].color}`}>
                          {STATUS_CONFIG[property.status].label}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Link
                      href={`/property/${property.id}`}
                      target="_blank"
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                    <Link
                      href={`/admin/properties/${property.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(property)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-primary text-white'
                              : 'text-neutral-700 hover:bg-neutral-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 删除确认弹窗 */}
        {deleteModalOpen && propertyToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">Delete Property</h3>
                  <p className="mt-2 text-neutral-600">
                    Are you sure you want to delete <strong>&quot;{propertyToDelete.title.en}&quot;</strong>? 
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setPropertyToDelete(null);
                  }}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
