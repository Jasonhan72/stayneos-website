'use client';

import useSWR from 'swr';
import AdminLayout from '@/components/admin/AdminLayout';

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((r) => r.json());

export default function UsersPage() {
  const { data, isLoading } = useSWR('/api/admin/users', fetcher);
  const users = data?.users || [];

  return (
    <AdminLayout title="用户管理">
      <div className="bg-white border border-neutral-200 rounded-xl p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left border-b"><th className="py-2">姓名</th><th>邮箱</th><th>角色</th><th>注册时间</th></tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan={4} className="py-4">加载中...</td></tr> : users.map((u: {id:string;name?:string;email:string;role:string;createdAt:string}) => (
              <tr key={u.id} className="border-b"><td className="py-2">{u.name || '-'}</td><td>{u.email}</td><td>{u.role}</td><td>{new Date(u.createdAt).toLocaleString()}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
