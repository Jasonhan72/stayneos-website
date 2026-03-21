'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import PropertyEditor from '@/components/admin/PropertyEditor';

export default function EditPropertyClient() {
  const params = useParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/properties/${propertyId}`, {
          credentials: 'include',
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Failed to load property (${res.status})`);
        }
        const data = await res.json();
        setProperty(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  if (loading) {
    return (
      <AdminLayout title="Edit Property">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !property) {
    return (
      <AdminLayout title="Edit Property">
        <div className="bg-white rounded-xl p-8 text-center border border-neutral-200">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Property Not Found</h2>
          <p className="text-neutral-500 mb-6">{error || 'The property you are looking for does not exist.'}</p>
          <a
            href="/admin/properties"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Back to Properties
          </a>
        </div>
      </AdminLayout>
    );
  }

  const title = (property.title as string) || (property.titleZh as string) || 'Untitled';

  return (
    <AdminLayout
      title={`Edit: ${title}`}
      breadcrumbs={[
        { label: 'Properties', href: '/admin/properties' },
        { label: 'Edit' },
      ]}
    >
      <PropertyEditor initial={property} id={propertyId} />
    </AdminLayout>
  );
}
