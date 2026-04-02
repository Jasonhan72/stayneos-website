'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import AdminLayout from '@/components/admin/AdminLayout';

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((r) => r.json());

export default function AdminPropertiesPage() {
  const [status, setStatus] = useState('ALL');
  const [q, setQ] = useState('');
  const query = `/api/admin/properties?status=${status}&q=${encodeURIComponent(q)}`;
  const { data, mutate, isLoading } = useSWR(query, fetcher);

  const properties = useMemo(() => data?.properties || [], [data]);

  async function togglePublish(id: string, current: string) {
    await fetch(`/api/admin/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...(properties.find((p: {id:string;title:string;address:string;priceMonthly:number;status:string;createdAt:string}) => p.id === id) || {}), status: current === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' }),
    });
    mutate();
  }

  async function remove(id: string) {
    if (!confirm('确认删除该物业？')) return;
    await fetch(`/api/admin/properties/${id}`, { method: 'DELETE' });
    mutate();
  }

  async function seed() {
    if (!confirm('执行 seed 会导入默认两套房源，继续？')) return;
    const res = await fetch('/api/admin/seed', { method: 'POST' });
    if (!res.ok) {
      alert('Seed 失败');
      return;
    }
    const data = await res.json();
    alert(`Seed 完成: 导入 ${data.count ?? data.inserted ?? 0} 条`);
    mutate();
  }

  return (
    <AdminLayout title="Properties" actions={<div className="flex gap-2"><button onClick={seed} className="px-4 py-2 border border-neutral-300 rounded-lg bg-white">导入 Seed 数据</button><Link href="/admin/properties/new" className="px-4 py-2 bg-primary text-white rounded-lg">新建物业</Link></div>}>
      <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <input className="border rounded-lg px-3 py-2 w-full" placeholder="搜索标题/地址/社区" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="border rounded-lg px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">全部</option>
            <option value="PUBLISHED">已发布</option>
            <option value="DRAFT">草稿</option>
            <option value="ARCHIVED">已归档</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">标题</th><th>地址</th><th>月租</th><th>状态</th><th>创建时间</th><th>操作</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <tr><td className="py-4" colSpan={6}>加载中...</td></tr> : properties.map((p: {id:string;title:string;address:string;priceMonthly:number;status:string;createdAt:string}) => (
                <tr key={p.id} className="border-b">
                  <td className="py-3">{p.title}</td>
                  <td>{p.address}</td>
                  <td>${(p.priceMonthly || 0).toLocaleString()}</td>
                  <td>{p.status}</td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="space-x-2">
                    <Link className="text-primary" href={`/admin/properties/${p.id}/edit`}>编辑</Link>
                    <button className="text-emerald-600" onClick={() => togglePublish(p.id, p.status)}>{p.status === 'PUBLISHED' ? '取消发布' : '发布'}</button>
                    <button className="text-red-600" onClick={() => remove(p.id)}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
