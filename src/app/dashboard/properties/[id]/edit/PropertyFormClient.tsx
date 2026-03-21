"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import PropertyEditor from "@/components/admin/PropertyEditor";

interface PropertyFormClientProps {
  propertyId: string;
}

export function PropertyFormClient({ propertyId }: PropertyFormClientProps) {
  const [property, setProperty] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/properties/${propertyId}`, {
          credentials: "include",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            data.error || `Failed to load property (${res.status})`
          );
        }
        const data = await res.json();
        setProperty(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load property"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  if (loading) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-gray-50 pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-6xl flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  if (error || !property) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-gray-50 pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="bg-white rounded-xl p-8 text-center border border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                Property Not Found
              </h2>
              <p className="text-neutral-500 mb-6">
                {error || "The property you are looking for does not exist."}
              </p>
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  const title =
    (property.title as string) ||
    (property.titleZh as string) ||
    "Untitled";

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-2xl font-bold text-neutral-900 mb-6">
            Edit: {title}
          </h1>
          <PropertyEditor initial={property} id={propertyId} />
        </div>
      </main>
    </ProtectedRoute>
  );
}
