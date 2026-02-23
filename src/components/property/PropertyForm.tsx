"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { AIAssistant, generatePropertyDescription, suggestPrice, suggestAmenities, generatePropertyTitle } from "./AIAssistant";
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
  Sparkles,
  Loader2
} from "lucide-react";

// 房型选项
const PROPERTY_TYPES = [
  { value: "apartment", label: "房型.apartment" },
  { value: "condo", label: "房型.condo" },
  { value: "townhouse", label: "房型.townhouse" },
  { value: "house", label: "房型.house" },
  { value: "loft", label: "房型.loft" },
  { value: "studio", label: "房型.studio" },
  { value: "penthouse", label: "房型.penthouse" },
];

// 常见设施列表
const COMMON_AMENITIES = [
  "WiFi", "空调", "暖气", "洗衣机", "烘干机", "电视", "厨房", "冰箱",
  "微波炉", "洗碗机", "咖啡机", "高速网络", "健身房", "停车位", "电梯",
  "阳台", "24小时安保", "行李寄存", "熨斗", "吹风机", "浴缸", "淋浴",
  "暖气", "壁炉", "花园", "游泳池", "烧烤区"
];

interface PropertyFormProps {
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    address?: string;
    city?: string;
    basePrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    maxGuests?: number;
    area?: number;
    propertyType?: string;
    amenities?: string[];
    images?: string[];
  };
  mode?: "create" | "edit";
}

export function PropertyForm({ initialData, mode = "create" }: PropertyFormProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  // 表单状态
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    basePrice: initialData?.basePrice || 0,
    bedrooms: initialData?.bedrooms || 1,
    bathrooms: initialData?.bathrooms || 1,
    maxGuests: initialData?.maxGuests || 2,
    area: initialData?.area || 50,
    propertyType: initialData?.propertyType || "apartment",
    amenities: initialData?.amenities || [],
    images: initialData?.images || [],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // 处理输入变化
  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 验证表单
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = t("validation.titleRequired");
    }
    if (!formData.description.trim()) {
      newErrors.description = t("validation.descriptionRequired");
    }
    if (!formData.address.trim()) {
      newErrors.address = t("validation.addressRequired");
    }
    if (!formData.city.trim()) {
      newErrors.city = t("validation.cityRequired");
    }
    if (formData.basePrice <= 0) {
      newErrors.basePrice = t("validation.priceRequired");
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // 这里调用 API 保存房源
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // 保存成功后跳转到房源列表
      router.push("/dashboard/properties");
      router.refresh();
    } catch (error) {
      console.error("Failed to save property:", error);
      setErrors({ submit: t("property.saveError") });
    } finally {
      setLoading(false);
    }
  };

  // AI 辅助功能
  const handleAIGenerateTitle = async () => {
    if (!formData.city) {
      setErrors({ city: t("validation.cityRequiredForAI") });
      return;
    }
    
    setAiLoading(true);
    try {
      const title = generatePropertyTitle(formData.city, formData.propertyType, formData.bedrooms);
      handleChange("title", title);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIGenerateDescription = async (input: string) => {
    return await generatePropertyDescription(input || formData.city);
  };

  const handleAISetDescription = async () => {
    if (!formData.city) {
      setErrors({ city: t("validation.cityRequiredForAI") });
      return;
    }
    
    setAiLoading(true);
    try {
      const description = await generatePropertyDescription(formData.city);
      handleChange("description", description);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAISuggestPrice = async () => {
    if (!formData.city) {
      setErrors({ city: t("validation.cityRequiredForAI") });
      return;
    }
    
    setAiLoading(true);
    try {
      const price = await suggestPrice({
        city: formData.city,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        area: formData.area,
      });
      handleChange("basePrice", price.suggested);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAISuggestAmenities = async () => {
    setAiLoading(true);
    try {
      const amenities = await suggestAmenities(formData.description);
      setFormData((prev) => ({ ...prev, amenities }));
    } finally {
      setAiLoading(false);
    }
  };

  // 处理设施选择
  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => {
      const current = prev.amenities;
      if (current.includes(amenity)) {
        return { ...prev, amenities: current.filter((a) => a !== amenity) };
      }
      return { ...prev, amenities: [...current, amenity] };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard/properties")}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === "create" ? t("property.createTitle") : t("property.editTitle")}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showAIAssistant 
                ? "bg-purple-100 text-purple-700" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {t("ai.assistant.toggle")}
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("common.saving")}
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {t("common.save")}
              </>
            )}
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：表单 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本信息 */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              {t("property.section.basic")}
            </h2>
            
            <div className="space-y-4">
              {/* 标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("property.title")} *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder={t("property.titlePlaceholder")}
                    className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.title ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAIGenerateTitle}
                    disabled={aiLoading || !formData.city}
                    className="px-3 py-2 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* 房型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("property.type")} *
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => handleChange("propertyType", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {t(type.label)}
                    </option>
                  ))}
                </select>
              </div>

              {/* 描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("property.description")} *
                </label>
                <div className="relative">
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder={t("property.descriptionPlaceholder")}
                    rows={5}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
                      errors.description ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAISetDescription}
                    disabled={aiLoading || !formData.city}
                    className="absolute bottom-3 right-3 p-2 text-purple-600 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 disabled:opacity-50 shadow-sm"
                    title={t("ai.generateDescription")}
                  >
                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  </button>
                </div>
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>
            </div>
          </section>

          {/* 位置信息 */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              {t("property.section.location")}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("property.address")} *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder={t("property.addressPlaceholder")}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.address ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("property.city")} *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder={t("property.cityPlaceholder")}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.city ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
              </div>
            </div>
          </section>

          {/* 房间信息 */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Maximize className="w-5 h-5 text-primary" />
              {t("property.section.details")}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Bed className="w-4 h-4 inline mr-1" />
                  {t("property.bedrooms")}
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={formData.bedrooms}
                  onChange={(e) => handleChange("bedrooms", parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Bath className="w-4 h-4 inline mr-1" />
                  {t("property.bathrooms")}
                </label>
                <input
                  type="number"
                  min={0.5}
                  max={10}
                  step={0.5}
                  value={formData.bathrooms}
                  onChange={(e) => handleChange("bathrooms", parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Users className="w-4 h-4 inline mr-1" />
                  {t("property.maxGuests")}
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={formData.maxGuests}
                  onChange={(e) => handleChange("maxGuests", parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("property.area")} (m²)
                </label>
                <input
                  type="number"
                  min={10}
                  value={formData.area}
                  onChange={(e) => handleChange("area", parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* 价格信息 */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              {t("property.section.pricing")}
            </h2>
            
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("property.basePrice")} (CAD/{t("common.night")}) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min={0}
                    value={formData.basePrice}
                    onChange={(e) => handleChange("basePrice", parseFloat(e.target.value))}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.basePrice ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                </div>
                {errors.basePrice && <p className="mt-1 text-sm text-red-600">{errors.basePrice}</p>}
              </div>
              
              <button
                type="button"
                onClick={handleAISuggestPrice}
                disabled={aiLoading || !formData.city}
                className="mt-6 px-4 py-2 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 disabled:opacity-50 flex items-center gap-2"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {t("ai.suggestPrice")}
              </button>
            </div>
          </section>

          {/* 设施 */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                {t("property.section.amenities")}
              </h2>
              <button
                type="button"
                onClick={handleAISuggestAmenities}
                disabled={aiLoading}
                className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {t("ai.suggestAmenities")}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {COMMON_AMENITIES.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    formData.amenities.includes(amenity)
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {formData.amenities.includes(amenity) && <Check className="w-3 h-3 inline mr-1" />}
                  {amenity}
                </button>
              ))}
            </div>
          </section>

          {/* 图片上传占位 */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              {t("property.section.images")}
            </h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">{t("property.images.dragDrop")}</p>
              <p className="text-sm text-gray-400">{t("property.images.supportedFormats")}</p>
            </div>
          </section>
        </div>

        {/* 右侧：AI 助手 */}
        {showAIAssistant && (
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <AIAssistant
                onGenerateDescription={handleAIGenerateDescription}
                onSuggestPrice={suggestPrice}
                onSuggestAmenities={suggestAmenities}
              />
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
