import { PropertiesList } from "@/components/property/PropertiesList";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function PropertiesPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
            <p className="text-gray-600 mt-2">Manage all your properties, add new listings or edit existing ones</p>
          </div>
          
          <PropertiesList />
        </div>
      </main>
    </ProtectedRoute>
  );
}
