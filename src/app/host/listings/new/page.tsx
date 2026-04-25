"use client";

import { PropertyForm } from "@/components/property/PropertyForm";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function NewHostPropertyPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-neutral-50 pb-12">
        <div className="mx-auto max-w-6xl px-4">
          <PropertyForm mode="create" />
        </div>
      </main>
    </ProtectedRoute>
  );
}
