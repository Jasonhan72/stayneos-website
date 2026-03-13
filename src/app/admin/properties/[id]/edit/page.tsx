'use client';

import useSWR from 'swr';
import AdminLayout from '@/components/admin/AdminLayout';
import PropertyEditor from '@/components/admin/PropertyEditor';
import { toPropertyFormState } from '@/lib/admin/property';

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((r) => r.json());

export default function EditPropertyPage({ params }: { params: { id: string } }) {
  const { data, isLoading } = useSWR(`/api/admin/properties/${params.id}`, fetcher);

  if (isLoading) return <AdminLayout title="编辑物业"><div>加载中...</div></AdminLayout>;
  const initial = data ? toPropertyFormState(data) : undefined;

  return (
    <AdminLayout title="编辑物业">
      <PropertyEditor initial={initial} id={params.id} />
    </AdminLayout>
  );
}
