'use client';

import { useEffect, useState } from 'react';
import { PropertyForm } from '@/components/admin/PropertyForm';
import AdminLayout from '@/components/admin/AdminLayout';
import { HostOption } from '@/types/host';

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

export default function NewPropertyPage() {
  const [hosts, setHosts] = useState<HostOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟API调用获取Host列表
    const fetchHosts = async () => {
      try {
        // const response = await fetch('/api/admin/hosts?limit=100');
        // const data = await response.json();
        // setHosts(data.hosts);
        
        // 使用模拟数据
        setTimeout(() => {
          setHosts(mockHosts);
          setLoading(false);
        }, 300);
      } catch (error) {
        console.error('Failed to fetch hosts:', error);
        setLoading(false);
      }
    };

    fetchHosts();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Add New Property">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Add New Property"
      breadcrumbs={[
        { label: 'Properties', href: '/admin/properties' },
        { label: 'New' },
      ]}
    >
      <PropertyForm mode="create" hosts={hosts} />
    </AdminLayout>
  );
}
