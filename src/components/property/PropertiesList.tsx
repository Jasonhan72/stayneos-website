"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
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
  AlertCircle
} from "lucide-react";

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

// 模拟房源数据
const mockProperties: Property[] = [
  {
    id: "prop-1",
    title: "市中心豪华公寓",
    address: "123 Main Street",
    city: "多伦多",
    basePrice: 180,
    currency: "CAD",
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    status: "published",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80",
    createdAt: "2024-01-15",
    updatedAt: "2024-02-20",
  },
  {
    id: "prop-2",
    title: "北约克现代公寓",
    address: "456 Yonge Street",
    city: "多伦多",
    basePrice: 150,
    currency: "CAD",
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    status: "draft",
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80",
    createdAt: "2024-02-01",
    updatedAt: "2024-02-18",
  },
  {
    id: "prop-3",
    title: "湖滨景观公寓",
    address: "789 Lakeshore Blvd",
    city: "多伦多",
    basePrice: 220,
    currency: "CAD",
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    status: "published",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80",
    createdAt: "2024-01-20",
    updatedAt: "2024-02-15",
  },
];

export function PropertiesList() {
  const { t } = useI18n();
  // router 保留供将来导航使用
  // const router = useRouter();
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | "all">("all");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  // 过滤房源
  const filteredProperties = properties.filter((prop) => {
    const matchesSearch = 
      prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || prop.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // 获取状态显示
  const getStatusBadge = (status: PropertyStatus) => {
    const statusConfig = {
      draft: { label: t("property.status.draft"), className: "bg-gray-100 text-gray-700" },
      pending_review: { label: t("property.status.pending"), className: "bg-yellow-100 text-yellow-700" },
      published: { label: t("property.status.published"), className: "bg-green-100 text-green-700" },
      paused: { label: t("property.status.paused"), className: "bg-orange-100 text-orange-700" },
      archived: { label: t("property.status.archived"), className: "bg-red-100 text-red-700" },
    };
    
    const config = statusConfig[status];
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // 处理删除
  const handleDeleteClick = (property: Property) => {
    setPropertyToDelete(property);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (propertyToDelete) {
      setProperties(properties.filter((p) => p.id !== propertyToDelete.id));
      setDeleteModalOpen(false);
      setPropertyToDelete(null);
    }
  };

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
              onChange={(e) => setStatusFilter(e.target.value as PropertyStatus | "all")}
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white cursor-pointer"
            >
              <option value="all">{t("property.filter.all")}</option>
              <option value="published">{t("property.status.published")}</option>
              <option value="draft">{t("property.status.draft")}</option>
              <option value="pending_review">{t("property.status.pending")}</option>
              <option value="paused">{t("property.status.paused")}</option>
              <option value="archived">{t("property.status.archived")}</option>
            </select>
          </div>
        </div>

        {/* 新增房源按钮 */}
        <Link
          href="/dashboard/properties/new"
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
            href="/dashboard/properties/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("property.addFirst")}
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* 桌面端表格 */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("property.table.property")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("property.table.location")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("property.table.details")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("property.table.price")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("property.table.status")}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        <div>
                          <p className="font-medium text-gray-900">{property.title}</p>
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
                        <span className="text-sm text-gray-500 font-normal">/{t("common.night")}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(property.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/property/${property.id}`}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title={t("common.view")}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/dashboard/properties/${property.id}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t("common.edit")}
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(property)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={t("common.delete")}
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
                        <span className="text-xs text-gray-500 font-normal">/{t("common.night")}</span>
                      </div>
                      {getStatusBadge(property.status)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/property/${property.id}`}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    {t("common.view")}
                  </Link>
                  <Link
                    href={`/dashboard/properties/${property.id}/edit`}
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
