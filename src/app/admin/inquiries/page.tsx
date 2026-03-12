'use client';

import useSWR from 'swr';
import AdminLayout from '@/components/admin/AdminLayout';

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((r) => r.json());

export default function InquiriesPage() {
  const { data, isLoading } = useSWR('/api/admin/inquiries', fetcher);
  const inquiries = data?.inquiries || [];

  return (
    <AdminLayout title="询盘管理">
      <div className="bg-white border border-neutral-200 rounded-xl p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left border-b"><th className="py-2">姓名</th><th>邮箱</th><th>类型</th><th>状态</th><th>时间</th></tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan={5} className="py-4">加载中...</td></tr> : inquiries.map((i: {id:string;name?:string;email:string;type:string;status:string;createdAt:string}) => (
              <tr key={i.id} className="border-b"><td className="py-2">{i.name || '-'}</td><td>{i.email}</td><td>{i.type}</td><td>{i.status}</td><td>{new Date(i.createdAt).toLocaleString()}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
