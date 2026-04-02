"use client";

import { PropertyForm } from "@/components/property/PropertyForm";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function NewPropertyPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <PropertyForm mode="create" />
        </div>
      </main>
    </ProtectedRoute>
  );
}
