import { PropertiesList } from "@/components/property/PropertiesList";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function PropertiesPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">房源管理</h1>
            <p className="text-gray-600 mt-2">管理您的所有房源，添加新房源或编辑现有房源</p>
          </div>
          
          <PropertiesList />
        </div>
      </main>
    </ProtectedRoute>
  );
}
