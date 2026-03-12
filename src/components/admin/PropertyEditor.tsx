/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const INCLUDED = ['WiFi', 'Utilities included', 'Bi-weekly housekeeping', 'Smart lock self check-in'];
const BUILDING = ['Pool', 'Gym', '24h concierge', 'Visitor parking', 'Party room'];

export default function PropertyEditor({ initial, id }: { initial?: any; id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<any>(initial || {
    title: '', slug: '', status: 'DRAFT', address: '', neighborhood: '', city: 'Toronto',
    bedrooms: 1, bathrooms: 1, sqft: '', floor: '', facing: '',
    priceMonthly: '', priceQuarterly: '', priceAnnual: '',
    description: '', descriptionZh: '', descriptionFr: '',
    includedAmenities: [], buildingAmenities: [],
    nearestSubway: '', subwayWalkMinutes: '', nearbyLandmarksText: '',
    minStayDays: 30, checkInTime: '15:00', checkOutTime: '11:00', selfCheckIn: true,
    imagesText: '', heroImage: '', idealForText: '', metaTitle: '', metaDescription: '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  function set(k: string, v: any) { setForm((f: any) => ({ ...f, [k]: v })); }
  function toggle(k: string, v: string) {
    const arr = form[k] || [];
    set(k, arr.includes(v) ? arr.filter((x: string) => x !== v) : [...arr, v]);
  }

  async function submit() {
    if (!form.title || !form.address || !form.neighborhood) return setMsg('请填写必填字段');
    setSaving(true); setMsg('');
    const payload = {
      ...form,
      bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms), sqft: Number(form.sqft) || null, floor: Number(form.floor) || null,
      priceMonthly: Number(form.priceMonthly) || null, priceQuarterly: Number(form.priceQuarterly) || null, priceAnnual: Number(form.priceAnnual) || null,
      subwayWalkMinutes: Number(form.subwayWalkMinutes) || null,
      nearbyLandmarks: form.nearbyLandmarksText ? form.nearbyLandmarksText.split('\n').map((s: string) => s.trim()).filter(Boolean) : [],
      images: form.imagesText ? form.imagesText.split('\n').map((url: string, i: number) => ({ url: url.trim(), alt: '', order: i })).filter((x: any) => x.url) : [],
      idealFor: form.idealForText ? form.idealForText.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    };
    const res = await fetch(id ? `/api/admin/properties/${id}` : '/api/admin/properties', {
      method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) return setMsg('保存失败');
    setMsg('保存成功');
    router.push('/admin/properties');
  }

  return (
    <div className="space-y-4 bg-white border border-neutral-200 rounded-xl p-4">
      <div className="grid md:grid-cols-2 gap-3">
        <input className="border rounded px-3 py-2" placeholder="标题*" value={form.title} onChange={(e) => set('title', e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Slug" value={form.slug || ''} onChange={(e) => set('slug', e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="地址*" value={form.address} onChange={(e) => set('address', e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="社区*" value={form.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="城市" value={form.city} onChange={(e) => set('city', e.target.value)} />
        <select className="border rounded px-3 py-2" value={form.status} onChange={(e) => set('status', e.target.value)}><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <input className="border rounded px-3 py-2" type="number" placeholder="卧室" value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} />
        <input className="border rounded px-3 py-2" type="number" placeholder="浴室" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} />
        <input className="border rounded px-3 py-2" type="number" placeholder="面积 sqft" value={form.sqft} onChange={(e) => set('sqft', e.target.value)} />
        <input className="border rounded px-3 py-2" type="number" placeholder="楼层" value={form.floor} onChange={(e) => set('floor', e.target.value)} />
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <input className="border rounded px-3 py-2" type="number" placeholder="月租" value={form.priceMonthly} onChange={(e) => set('priceMonthly', e.target.value)} />
        <input className="border rounded px-3 py-2" type="number" placeholder="季租" value={form.priceQuarterly} onChange={(e) => set('priceQuarterly', e.target.value)} />
        <input className="border rounded px-3 py-2" type="number" placeholder="年租" value={form.priceAnnual} onChange={(e) => set('priceAnnual', e.target.value)} />
      </div>

      <textarea className="border rounded px-3 py-2 w-full" placeholder="描述 EN" value={form.description} onChange={(e) => set('description', e.target.value)} />
      <textarea className="border rounded px-3 py-2 w-full" placeholder="描述 ZH" value={form.descriptionZh} onChange={(e) => set('descriptionZh', e.target.value)} />
      <textarea className="border rounded px-3 py-2 w-full" placeholder="描述 FR" value={form.descriptionFr} onChange={(e) => set('descriptionFr', e.target.value)} />

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="font-medium mb-2">全包内容</p>
          <div className="space-y-1">{INCLUDED.map((v) => <label key={v} className="block"><input type="checkbox" checked={(form.includedAmenities || []).includes(v)} onChange={() => toggle('includedAmenities', v)} /> <span className="ml-2">{v}</span></label>)}</div>
        </div>
        <div>
          <p className="font-medium mb-2">楼宇 Amenities</p>
          <div className="space-y-1">{BUILDING.map((v) => <label key={v} className="block"><input type="checkbox" checked={(form.buildingAmenities || []).includes(v)} onChange={() => toggle('buildingAmenities', v)} /> <span className="ml-2">{v}</span></label>)}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <input className="border rounded px-3 py-2" placeholder="最近地铁" value={form.nearestSubway} onChange={(e) => set('nearestSubway', e.target.value)} />
        <input className="border rounded px-3 py-2" type="number" placeholder="步行分钟" value={form.subwayWalkMinutes} onChange={(e) => set('subwayWalkMinutes', e.target.value)} />
      </div>
      <textarea className="border rounded px-3 py-2 w-full" placeholder="附近地标（每行一个）" value={form.nearbyLandmarksText} onChange={(e) => set('nearbyLandmarksText', e.target.value)} />
      <textarea className="border rounded px-3 py-2 w-full" placeholder="图片 URL（每行一个）" value={form.imagesText} onChange={(e) => set('imagesText', e.target.value)} />
      <div className="grid md:grid-cols-2 gap-3">
        <input className="border rounded px-3 py-2" placeholder="Meta title" value={form.metaTitle} onChange={(e) => set('metaTitle', e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Meta description" value={form.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} />
      </div>

      {msg && <p className="text-sm text-neutral-600">{msg}</p>}
      <div className="flex gap-2">
        <button onClick={submit} disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg">{saving ? '保存中...' : '保存'}</button>
        <button onClick={() => window.open('/properties', '_blank')} className="px-4 py-2 border rounded-lg">预览</button>
      </div>
    </div>
  );
}
