"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import PropertyEditor from "@/components/host/editor/PropertyEditor";
import { useEffect, useState } from "react";

export function HostPropertyFormClient({ propertyId }: { propertyId: string }) {
  const [property, setProperty] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/host/properties/${propertyId}`, { credentials: 'include', cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `Failed to load property (${r.status})`);
        return r.json();
      })
      .then(setProperty)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [propertyId]);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-neutral-50 pb-12">
        <div className="mx-auto max-w-6xl px-4">
          {loading ? <div className="py-20 text-center text-neutral-500">Loading…</div> : error || !property ? <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-neutral-500">{error || 'Property not found'}</div> : <PropertyEditor initial={property} id={propertyId} apiBase="/api/host/properties" />}
        </div>
      </main>
    </ProtectedRoute>
  );
}
