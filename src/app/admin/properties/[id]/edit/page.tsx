'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PropertyForm } from '@/components/admin/PropertyForm';
import AdminLayout from '@/components/admin/AdminLayout';
import { HostOption } from '@/types/host';
import { PropertyStatus, PropertyType } from '@prisma/client';

// 模拟Host数据
const mockHosts: HostOption[] = [
  {
    id: 'host-1',
    displayName: 'Nazli',
    avatarUrl: '/images/host-avatar.jpg',
    totalProperties: 5,
    status: 'active',
  },
  {
    id: 'host-2',
    displayName: 'StayNeos Team',
    avatarUrl: undefined,
    totalProperties: 12,
    status: 'active',
  },
];

// 模拟房源数据
const mockPropertyData = {
  id: 'prop-1',
  title: { 
    zh: '市中心豪华公寓', 
    en: 'Luxury Downtown Apartment' 
  },
  description: { 
    zh: '这套精致的行政公寓位于多伦多市中心，专为追求品质生活的商务人士打造。步行可达金融区、购物中心和顶级餐厅。', 
    en: 'This exquisite executive apartment is located in the heart of downtown Toronto, designed for business professionals seeking quality living. Walking distance to the Financial District, shopping centers, and top restaurants.' 
  },
  address: '123 Main Street',
  city: 'Toronto',
  province: 'Ontario',
  postalCode: 'M5V 3A8',
  country: 'Canada',
  propertyType: PropertyType.APARTMENT,
  pricePerNight: 180,
  cleaningFee: 80,
  serviceFee: 40,
  maxGuests: 4,
  bedrooms: 2,
  beds: 2,
  bathrooms: 2,
  area: 85,
  amenities: ['wifi', 'ac', 'kitchen', 'washer', 'gym', 'parking'],
  images: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
  ],
  hostId: 'host-1',
  minNights: 28,
  maxNights: 365,
  isInstantBook: false,
  status: PropertyStatus.PUBLISHED,
};

export default function EditPropertyPage() {
  const params = useParams();
  const propertyId = params.id as string;
  
  const [property, setProperty] = useState<typeof mockPropertyData | null>(null);
  const [hosts, setHosts] = useState<HostOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 模拟API调用获取房源详情
        // const [propertyRes, hostsRes] = await Promise.all([
        //   fetch(`/api/admin/properties/${propertyId}`),
        //   fetch('/api/admin/hosts?limit=100'),
        // ]);
        // 
        // if (!propertyRes.ok) throw new Error('Property not found');
        // 
        // const propertyData = await propertyRes.json();
        // const hostsData = await hostsRes.json();
        
        // setProperty(propertyData);
        // setHosts(hostsData.hosts);
        
        // 使用模拟数据
        setTimeout(() => {
          setProperty(mockPropertyData);
          setHosts(mockHosts);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load property');
        setLoading(false);
      }
    };

    fetchData();
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

  return (
    <AdminLayout 
      title={`Edit: ${property.title.en}`}
      breadcrumbs={[
        { label: 'Properties', href: '/admin/properties' },
        { label: 'Edit' },
      ]}
    >
      <PropertyForm 
        mode="edit" 
        initialData={property}
        hosts={hosts}
      />
    </AdminLayout>
  );
}
