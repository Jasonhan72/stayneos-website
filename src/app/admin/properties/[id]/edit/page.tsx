'use client';

import useSWR from 'swr';
import AdminLayout from '@/components/admin/AdminLayout';
import PropertyEditor from '@/components/admin/PropertyEditor';

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((r) => r.json());

export default function EditPropertyPage({ params }: { params: { id: string } }) {
  const { data, isLoading } = useSWR(`/api/admin/properties/${params.id}`, fetcher);

  if (isLoading) return <AdminLayout title="编辑物业"><div>加载中...</div></AdminLayout>;

  const initial = data
    ? {
        ...data,
        includedAmenities: data.includedAmenities ? JSON.parse(data.includedAmenities) : [],
        buildingAmenities: data.buildingAmenities ? JSON.parse(data.buildingAmenities) : [],
        nearbyLandmarksText: data.nearbyLandmarks ? JSON.parse(data.nearbyLandmarks).join('\n') : '',
        imagesText: data.images ? JSON.parse(data.images).map((i: {url:string}) => i.url).join('\n') : '',
        idealForText: data.idealFor ? JSON.parse(data.idealFor).join(', ') : '',
      }
    : undefined;

  return (
    <AdminLayout title="编辑物业">
      <PropertyEditor initial={initial} id={params.id} />
    </AdminLayout>
  );
}
