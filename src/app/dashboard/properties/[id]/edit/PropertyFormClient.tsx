"use client";

import { PropertyForm } from "@/components/property/PropertyForm";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// 模拟获取房源数据
const mockPropertyData = {
  id: "prop-1",
  title: "市中心豪华公寓",
  description: "这套精致的行政公寓位于多伦多市中心，专为追求品质生活的商务人士打造。",
  address: "123 Main Street",
  city: "多伦多",
  basePrice: 180,
  bedrooms: 2,
  bathrooms: 2,
  maxGuests: 4,
  area: 85,
  propertyType: "apartment",
  amenities: ["WiFi", "空调", "厨房", "洗衣机", "健身房"],
  images: [],
};

interface PropertyFormClientProps {
  propertyId: string;
}

export function PropertyFormClient({ propertyId }: PropertyFormClientProps) {
  // 实际项目中应该根据 propertyId 从 API 获取数据
  // const { data: property, isLoading } = useProperty(propertyId);
  void propertyId;

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <PropertyForm 
            mode="edit" 
            initialData={mockPropertyData}
          />
        </div>
      </main>
    </ProtectedRoute>
  );
}
