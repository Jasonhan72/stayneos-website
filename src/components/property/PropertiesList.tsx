"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { ensureCsrfToken } from "@/lib/security/csrf-client";
import Image from "next/image";
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
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  RefreshCw
} from "lucide-react";

// Toggle Switch 组件
function ListingToggle({ 
  isListed, 
  isLoading, 
  onToggle,
  listedLabel,
  unlistedLabel,
}: { 
  isListed: boolean; 
  isLoading: boolean; 
  onToggle: () => void;
  listedLabel: string;
  unlistedLabel: string;
}) {
  const label = isListed ? listedLabel : unlistedLabel;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggle}
        disabled={isLoading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${isListed ? 'bg-green-500' : 'bg-gray-300'}`}
        role="switch"
        aria-checked={isListed}
        aria-label={label}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm ${
            isListed ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-3 h-3 animate-spin text-white" />
          </span>
        )}
      </button>
      <span className={`text-xs font-medium ${isListed ? 'text-green-700' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );
}

// 房源状态类型
type PropertyStatus = "draft" | "pending_review" | "published" | "paused" | "archived";

interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  basePrice: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  status: PropertyStatus;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export function PropertiesList() {
  const { t } = useI18n();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "listed" | "unlisted">("all");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const listedLabel = t("property.status.listed", "Listed");
  const unlistedLabel = t("property.status.unlisted", "Unlisted");

  // 从 API 加载房源数据
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/host/properties', { credentials: 'include', cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`Failed to load properties (${res.status})`);
      }
      const data = await res.json();
      setProperties(data.properties || []);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // 切换房源 Listed/Unlisted 状态
  const handleToggleListing = useCallback(async (property: Property) => {
    const newStatus = property.status === "published" ? "paused" : "published";
    
    setTogglingIds(prev => new Set(prev).add(property.id));
    
    try {
      const res = await fetch(`/api/properties/${property.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': ensureCsrfToken() },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus === "published" ? "PUBLISHED" : "PAUSED" }),
      });

      if (res.ok) {
        // Re-fetch to ensure consistency with server state
        fetchProperties();
      } else {
        console.error('Failed to toggle listing status');
      }
    } catch (error) {
      console.error('Error toggling listing status:', error);
    } finally {
      setTogglingIds(prev => {
        const next = new Set(prev);
        next.delete(property.id);
        return next;
      });
    }
  }, [fetchProperties]);

  // 过滤房源
  const filteredProperties = properties.filter((prop) => {
    const matchesSearch = 
      prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" 
      || (statusFilter === "listed" && prop.status === "published")
      || (statusFilter === "unlisted" && prop.status !== "published");
    
    return matchesSearch && matchesStatus;
  });

  // 处理删除
  const handleDeleteClick = (property: Property) => {
    setPropertyToDelete(property);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;
    try {
      const res = await fetch(`/api/host/properties/${propertyToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setProperties(prev => prev.filter((p) => p.id !== propertyToDelete.id));
      }
    } catch {
      // silent
    }
    setDeleteModalOpen(false);
    setPropertyToDelete(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-xl">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t("property.loadFailed", "Failed to load properties")}</h3>
        <p className="text-gray-500 mb-6">{fetchError}</p>
        <button
          onClick={fetchProperties}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {t("common.retry", "Retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 搜索和过滤栏 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("property.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-64"
            />
          </div>
          
          {/* 状态过滤 */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "listed" | "unlisted")}
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white cursor-pointer"
            >
              <option value="all">{t("property.filter.all", "All")}</option>
              <option value="listed">{listedLabel}</option>
              <option value="unlisted">{unlistedLabel}</option>
            </select>
          </div>
        </div>

        {/* 新增房源按钮 */}
        <Link
          href="/host/listings/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          {t("property.addNew")}
        </Link>
      </div>

      {/* 房源列表 */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("property.empty.title")}
          </h3>
          <p className="text-gray-500 mb-6">{t("property.empty.description")}</p>
          <Link
            href="/host/listings/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("property.addFirst")}
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* 桌面端表格 */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1040px] table-fixed">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-[34%] px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("property.table.property")}
                  </th>
                  <th className="w-[15%] px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("property.table.location")}
                  </th>
                  <th className="w-[15%] px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("property.table.details")}
                  </th>
                  <th className="w-[12%] px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("property.table.price")}
                  </th>
                  <th className="w-[12%] px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("property.table.listing", "Listing")}
                  </th>
                  <th className="w-40 px-3 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("common.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                          {property.imageUrl ? (
                            <Image
                              src={property.imageUrl}
                              alt={property.title}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">{property.title}</p>
                          <p className="text-sm text-gray-500">ID: {property.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{property.city}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
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
                      <div className="flex items-center gap-1 font-medium text-gray-900">
                        <DollarSign className="w-4 h-4" />
                        {property.basePrice}
                        <span className="text-sm text-gray-500 font-normal">/{t("common.month")}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ListingToggle
                        isListed={property.status === "published"}
                        isLoading={togglingIds.has(property.id)}
                        onToggle={() => handleToggleListing(property)}
                        listedLabel={listedLabel}
                        unlistedLabel={unlistedLabel}
                      />
                    </td>
                    <td className="w-40 px-3 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/properties/${property.id}`}
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-primary/10 hover:text-primary"
                          title={t("common.view")}
                          aria-label={t("common.view")}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/host/listings/${property.id}/edit`}
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                          title={t("common.edit")}
                          aria-label={t("common.edit")}
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(property)}
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          title={t("common.delete")}
                          aria-label={t("common.delete")}
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
          <div className="md:hidden divide-y divide-gray-200">
            {filteredProperties.map((property) => (
              <div key={property.id} className="p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                    {property.imageUrl ? (
                      <Image
                        src={property.imageUrl}
                        alt={property.title}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{property.title}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {property.city}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
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
                      <div className="flex items-center gap-1 font-medium text-gray-900">
                        <DollarSign className="w-4 h-4" />
                        {property.basePrice}
                        <span className="text-xs text-gray-500 font-normal">/{t("common.month")}</span>
                      </div>
                      <ListingToggle
                        isListed={property.status === "published"}
                        isLoading={togglingIds.has(property.id)}
                        onToggle={() => handleToggleListing(property)}
                        listedLabel={listedLabel}
                        unlistedLabel={unlistedLabel}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/properties/${property.id}`}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    {t("common.view")}
                  </Link>
                  <Link
                    href={`/host/listings/${property.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    {t("common.edit")}
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(property)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t("common.delete")}
                  </button>
                </div>
              </div>
            ))}
          </div>
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
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("property.delete.title")}
                </h3>
                <p className="mt-2 text-gray-600">
                  {t("property.delete.confirm", { title: propertyToDelete.title })}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
