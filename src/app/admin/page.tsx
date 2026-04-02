'use client';

import useSWR from 'swr';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((r) => r.json());

export default function AdminPage() {
  const { data, isLoading } = useSWR('/api/admin/stats', fetcher);

  const cards = [
    { label: '物业总数', value: data?.totalProperties ?? 0 },
    { label: '已发布', value: data?.publishedProperties ?? 0 },
    { label: '草稿', value: data?.draftProperties ?? 0 },
    { label: '本月询盘', value: data?.monthlyInquiries ?? 0 },
    { label: '用户总数', value: data?.totalUsers ?? 0 },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="bg-white border border-neutral-200 rounded-xl p-4">
              <p className="text-sm text-neutral-500">{card.label}</p>
              <p className="text-2xl font-bold text-neutral-900 mt-2">{isLoading ? '...' : card.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <h2 className="font-semibold text-neutral-900 mb-3">最近询盘</h2>
          <div className="space-y-3">
            {(data?.recentInquiries || []).map((inq: {id:string;name?:string;email:string;type:string;status:string;createdAt:string}) => (
              <div key={inq.id} className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <div>
                  <p className="font-medium">{inq.name || inq.email}</p>
                  <p className="text-xs text-neutral-500">{inq.type} · {inq.status}</p>
                </div>
                <p className="text-xs text-neutral-500">{new Date(inq.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link className="px-4 py-2 bg-primary text-white rounded-lg" href="/admin/properties/new">新建物业</Link>
          <Link className="px-4 py-2 bg-white border border-neutral-200 rounded-lg" href="/admin/properties">管理物业</Link>
          <Link className="px-4 py-2 bg-white border border-neutral-200 rounded-lg" href="/admin/inquiries">查看询盘</Link>
          <Link className="px-4 py-2 bg-white border border-neutral-200 rounded-lg" href="/admin/users">查看用户</Link>
        </div>
      </div>
    </AdminLayout>
  );
}
