'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DEFAULT_PROPERTY_FORM,
  PROPERTY_TYPE_OPTIONS,
  PropertyFormState,
  normalizePropertyInput,
  slugify,
  toPropertyFormState,
} from '@/lib/admin/property';

interface PropertyEditorProps {
  initial?: unknown;
  id?: string;
  apiBase?: string; // defaults to '/api/admin/properties'
}

type AiAssistType = 'parse' | 'translate' | 'seo';

type AiAssistResponse = Partial<{
  title: string;
  titleZh: string;
  titleFr: string;
  address: string;
  neighborhood: string;
  city: string;
  latitude: number;
  longitude: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  floor: number;
  facing: string;
  balconySqft: number;
  buildingYear: number;
  developer: string;
  description: string;
  descriptionZh: string;
  descriptionFr: string;
  priceMonthly: number;
  priceQuarterly: number;
  priceAnnual: number;
  currency: string;
  includedAmenities: string[];
  buildingAmenities: string[];
  nearestSubway: string;
  subwayWalkMinutes: number;
  nearbyLandmarks: string[];
  minStayDays: number;
  checkInTime: string;
  checkOutTime: string;
  selfCheckIn: boolean;
  images: string[];
  heroImage: string;
  idealFor: string[];
  metaTitle: string;
  metaDescription: string;
}>;

const sectionClassName = 'rounded-xl border border-neutral-200 bg-white p-4 md:p-5';
const inputClassName = 'w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';
const labelClassName = 'mb-1 block text-sm font-medium text-neutral-700';

function applyAiResult(current: PropertyFormState, result: AiAssistResponse): PropertyFormState {
  const next = { ...current };

  const assign = <K extends keyof PropertyFormState>(key: K, value: PropertyFormState[K] | undefined) => {
    if (value !== undefined) next[key] = value;
  };

  assign('title', result.title);
  assign('titleZh', result.titleZh);
  assign('titleFr', result.titleFr);
  assign('address', result.address);
  assign('neighborhood', result.neighborhood);
  assign('city', result.city);
  assign('latitude', result.latitude === undefined ? undefined : `${result.latitude}`);
  assign('longitude', result.longitude === undefined ? undefined : `${result.longitude}`);
  assign(
    'propertyType',
    result.propertyType && PROPERTY_TYPE_OPTIONS.includes(result.propertyType as (typeof PROPERTY_TYPE_OPTIONS)[number])
      ? (result.propertyType as PropertyFormState['propertyType'])
      : undefined,
  );
  assign('bedrooms', result.bedrooms === undefined ? undefined : `${result.bedrooms}`);
  assign('bathrooms', result.bathrooms === undefined ? undefined : `${result.bathrooms}`);
  assign('sqft', result.sqft === undefined ? undefined : `${result.sqft}`);
  assign('floor', result.floor === undefined ? undefined : `${result.floor}`);
  assign('facing', result.facing);
  assign('balconySqft', result.balconySqft === undefined ? undefined : `${result.balconySqft}`);
  assign('buildingYear', result.buildingYear === undefined ? undefined : `${result.buildingYear}`);
  assign('developer', result.developer);
  assign('description', result.description);
  assign('descriptionZh', result.descriptionZh);
  assign('descriptionFr', result.descriptionFr);
  assign('priceMonthly', result.priceMonthly === undefined ? undefined : `${result.priceMonthly}`);
  assign('priceQuarterly', result.priceQuarterly === undefined ? undefined : `${result.priceQuarterly}`);
  assign('priceAnnual', result.priceAnnual === undefined ? undefined : `${result.priceAnnual}`);
  assign('currency', result.currency);
  assign('includedAmenitiesText', result.includedAmenities?.join(', '));
  assign('buildingAmenitiesText', result.buildingAmenities?.join(', '));
  assign('nearestSubway', result.nearestSubway);
  assign('subwayWalkMinutes', result.subwayWalkMinutes === undefined ? undefined : `${result.subwayWalkMinutes}`);
  assign('nearbyLandmarksText', result.nearbyLandmarks?.join(', '));
  assign('minStayDays', result.minStayDays === undefined ? undefined : `${result.minStayDays}`);
  assign('checkInTime', result.checkInTime);
  assign('checkOutTime', result.checkOutTime);
  if (typeof result.selfCheckIn === 'boolean') next.selfCheckIn = result.selfCheckIn;
  assign('imagesText', result.images?.join(', '));
  assign('heroImage', result.heroImage);
  assign('idealForText', result.idealFor?.join(', '));
  assign('metaTitle', result.metaTitle);
  assign('metaDescription', result.metaDescription);

  if (!next.slug && next.title) {
    next.slug = slugify(next.title);
  }

  return next;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClassName}>{label}</span>
      {children}
    </label>
  );
}

export default function PropertyEditor({ initial, id, apiBase = '/api/admin/properties' }: PropertyEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState<PropertyFormState>(toPropertyFormState((initial ?? null) as Record<string, unknown> | null));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [aiOpen, setAiOpen] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState<AiAssistType | null>(null);
  const [aiError, setAiError] = useState('');
  const [uploading, setUploading] = useState(false);

  const isEditMode = Boolean(id);
  const imagePreviewUrls = useMemo(
    () =>
      form.imagesText
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean),
    [form.imagesText],
  );

  const updateField = <K extends keyof PropertyFormState>(key: K, value: PropertyFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  async function handleAiAssist(type: AiAssistType) {
    const trimmedPrompt = aiPrompt.trim();
    if (!trimmedPrompt) {
      setAiError('请先粘贴房源描述文本');
      return;
    }

    setAiLoading(type);
    setAiError('');

    try {
      const enrichedPrompt =
        type === 'translate'
          ? `当前标题：${form.title || '无'}\n当前英文描述：${form.description || '无'}\n\n待处理内容：\n${trimmedPrompt}`
          : type === 'seo'
            ? `标题：${form.title || '无'}\n地址：${form.address || '无'}\n描述：${form.description || trimmedPrompt}\n\n原始资料：\n${trimmedPrompt}`
            : trimmedPrompt;

      const response = await fetch('/api/admin/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: enrichedPrompt, type }),
      });

      const data = (await response.json()) as { data?: AiAssistResponse; error?: string };
      if (!response.ok || !data.data) {
        throw new Error(data.error || 'AI 处理失败');
      }

      setForm((current) => applyAiResult(current, data.data || {}));
      setMessage(type === 'parse' ? 'AI 解析完成，已填充表单' : type === 'translate' ? 'AI 翻译完成' : 'AI SEO 已生成');
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI 处理失败');
    } finally {
      setAiLoading(null);
    }
  }



  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');

    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        const response = await fetch('/api/admin/upload-image', { method: 'POST', body: fd });
        const data = (await response.json()) as { url?: string; error?: string };
        if (!response.ok || !data.url) throw new Error(data.error || '上传失败');
        uploaded.push(data.url);
      }

      const merged = [...imagePreviewUrls, ...uploaded];
      updateField('imagesText', merged.join('\n'));
      if (!form.heroImage && merged[0]) updateField('heroImage', merged[0]);
      setMessage(`图片上传成功：${uploaded.length} 张`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    setError('');
    setMessage('');

    const payload = normalizePropertyInput({
      ...form,
      slug: form.slug || slugify(form.title),
    });

    if (!payload.title || !payload.address || !payload.neighborhood) {
      setError('请至少填写标题、地址和社区');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(id ? `${apiBase}/${id}` : apiBase, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || '保存失败');
      }

      router.push('/admin/properties');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className={sectionClassName}>
        <button
          type="button"
          onClick={() => setAiOpen((current) => !current)}
          className="flex w-full items-center justify-between text-left"
        >
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">AI 助手</h2>
            <p className="text-sm text-neutral-500">粘贴 listing 文案后，可自动解析字段、生成三语描述和 SEO。</p>
          </div>
          <span className="text-sm text-primary">{aiOpen ? '收起' : '展开'}</span>
        </button>

        {aiOpen && (
          <div className="mt-4 space-y-3">
            <textarea
              className={`${inputClassName} min-h-40 resize-y`}
              placeholder="在这里粘贴房源描述、listing 文案或经纪备注"
              value={aiPrompt}
              onChange={(event) => setAiPrompt(event.target.value)}
            />

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleAiAssist('parse')}
                disabled={aiLoading !== null}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {aiLoading === 'parse' ? 'AI 解析中...' : 'AI 解析'}
              </button>
              <button
                type="button"
                onClick={() => handleAiAssist('translate')}
                disabled={aiLoading !== null}
                className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 disabled:opacity-50"
              >
                {aiLoading === 'translate' ? 'AI 翻译中...' : 'AI 翻译'}
              </button>
              <button
                type="button"
                onClick={() => handleAiAssist('seo')}
                disabled={aiLoading !== null}
                className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 disabled:opacity-50"
              >
                {aiLoading === 'seo' ? 'AI 生成中...' : 'AI SEO'}
              </button>
            </div>

            {aiError ? <p className="text-sm text-red-600">{aiError}</p> : null}
          </div>
        )}
      </section>

      <section className={sectionClassName}>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">{isEditMode ? '编辑房源' : '新建房源'}</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="英文标题*">
            <input className={inputClassName} value={form.title} onChange={(event) => updateField('title', event.target.value)} />
          </Field>
          <Field label="Slug">
            <input
              className={inputClassName}
              value={form.slug}
              onChange={(event) => updateField('slug', event.target.value)}
              onBlur={() => {
                if (!form.slug.trim() && form.title.trim()) updateField('slug', slugify(form.title));
              }}
            />
          </Field>
          <Field label="中文标题">
            <input className={inputClassName} value={form.titleZh} onChange={(event) => updateField('titleZh', event.target.value)} />
          </Field>
          <Field label="法文标题">
            <input className={inputClassName} value={form.titleFr} onChange={(event) => updateField('titleFr', event.target.value)} />
          </Field>
          <div className="block">
            <span className={labelClassName}>房源状态</span>
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => updateField('status', form.status === 'PUBLISHED' ? 'PAUSED' : 'PUBLISHED')}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer ${
                  form.status === 'PUBLISHED' ? 'bg-green-500' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={form.status === 'PUBLISHED'}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm ${
                    form.status === 'PUBLISHED' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${form.status === 'PUBLISHED' ? 'text-green-700' : 'text-gray-500'}`}>
                {form.status === 'PUBLISHED' ? 'Listed（已发布，对租客可见）' : 'Unlisted（已下架，对租客不可见）'}
              </span>
            </div>
          </div>
          <Field label="房源类型">
            <select
              className={inputClassName}
              value={form.propertyType}
              onChange={(event) => updateField('propertyType', event.target.value as PropertyFormState['propertyType'])}
            >
              {PROPERTY_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className={sectionClassName}>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">位置与基础信息</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="地址*">
            <input className={inputClassName} value={form.address} onChange={(event) => updateField('address', event.target.value)} />
          </Field>
          <Field label="社区*">
            <input className={inputClassName} value={form.neighborhood} onChange={(event) => updateField('neighborhood', event.target.value)} />
          </Field>
          <Field label="城市">
            <input className={inputClassName} value={form.city} onChange={(event) => updateField('city', event.target.value)} />
          </Field>
          <Field label="朝向">
            <input className={inputClassName} value={form.facing} onChange={(event) => updateField('facing', event.target.value)} />
          </Field>
          <Field label="纬度">
            <input className={inputClassName} value={form.latitude} onChange={(event) => updateField('latitude', event.target.value)} />
          </Field>
          <Field label="经度">
            <input className={inputClassName} value={form.longitude} onChange={(event) => updateField('longitude', event.target.value)} />
          </Field>
          <Field label="开发商">
            <input className={inputClassName} value={form.developer} onChange={(event) => updateField('developer', event.target.value)} />
          </Field>
          <Field label="建成年份">
            <input className={inputClassName} type="number" value={form.buildingYear} onChange={(event) => updateField('buildingYear', event.target.value)} />
          </Field>
        </div>
      </section>

      <section className={sectionClassName}>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">户型与价格</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="卧室">
            <input className={inputClassName} type="number" value={form.bedrooms} onChange={(event) => updateField('bedrooms', event.target.value)} />
          </Field>
          <Field label="浴室">
            <input className={inputClassName} type="number" step="0.5" value={form.bathrooms} onChange={(event) => updateField('bathrooms', event.target.value)} />
          </Field>
          <Field label="面积 sqft">
            <input className={inputClassName} type="number" value={form.sqft} onChange={(event) => updateField('sqft', event.target.value)} />
          </Field>
          <Field label="楼层">
            <input className={inputClassName} type="number" value={form.floor} onChange={(event) => updateField('floor', event.target.value)} />
          </Field>
          <Field label="阳台面积 sqft">
            <input className={inputClassName} type="number" value={form.balconySqft} onChange={(event) => updateField('balconySqft', event.target.value)} />
          </Field>
          <Field label="月租">
            <input className={inputClassName} type="number" value={form.priceMonthly} onChange={(event) => updateField('priceMonthly', event.target.value)} />
          </Field>
          <Field label="季租">
            <input className={inputClassName} type="number" value={form.priceQuarterly} onChange={(event) => updateField('priceQuarterly', event.target.value)} />
          </Field>
          <Field label="年租">
            <input className={inputClassName} type="number" value={form.priceAnnual} onChange={(event) => updateField('priceAnnual', event.target.value)} />
          </Field>
          <Field label="货币">
            <input className={inputClassName} value={form.currency} onChange={(event) => updateField('currency', event.target.value)} />
          </Field>
          <Field label="最短入住天数">
            <input className={inputClassName} type="number" value={form.minStayDays} onChange={(event) => updateField('minStayDays', event.target.value)} />
          </Field>
          <Field label="入住时间">
            <input className={inputClassName} type="time" value={form.checkInTime} onChange={(event) => updateField('checkInTime', event.target.value)} />
          </Field>
          <Field label="退房时间">
            <input className={inputClassName} type="time" value={form.checkOutTime} onChange={(event) => updateField('checkOutTime', event.target.value)} />
          </Field>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" checked={form.selfCheckIn} onChange={(event) => updateField('selfCheckIn', event.target.checked)} />
          支持自助入住
        </label>
      </section>

      <section className={sectionClassName}>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">描述与配套</h2>
        <div className="space-y-4">
          <Field label="英文描述">
            <textarea className={`${inputClassName} min-h-28`} value={form.description} onChange={(event) => updateField('description', event.target.value)} />
          </Field>
          <Field label="中文描述">
            <textarea className={`${inputClassName} min-h-28`} value={form.descriptionZh} onChange={(event) => updateField('descriptionZh', event.target.value)} />
          </Field>
          <Field label="法文描述">
            <textarea className={`${inputClassName} min-h-28`} value={form.descriptionFr} onChange={(event) => updateField('descriptionFr', event.target.value)} />
          </Field>
          <Field label="全包内容（逗号或换行分隔）">
            <textarea className={`${inputClassName} min-h-24`} value={form.includedAmenitiesText} onChange={(event) => updateField('includedAmenitiesText', event.target.value)} />
          </Field>
          <Field label="楼宇配套（逗号或换行分隔）">
            <textarea className={`${inputClassName} min-h-24`} value={form.buildingAmenitiesText} onChange={(event) => updateField('buildingAmenitiesText', event.target.value)} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="最近地铁">
              <input className={inputClassName} value={form.nearestSubway} onChange={(event) => updateField('nearestSubway', event.target.value)} />
            </Field>
            <Field label="步行分钟">
              <input className={inputClassName} type="number" value={form.subwayWalkMinutes} onChange={(event) => updateField('subwayWalkMinutes', event.target.value)} />
            </Field>
          </div>
          <Field label="附近地标（逗号或换行分隔）">
            <textarea className={`${inputClassName} min-h-24`} value={form.nearbyLandmarksText} onChange={(event) => updateField('nearbyLandmarksText', event.target.value)} />
          </Field>
          <Field label="适合人群（逗号或换行分隔）">
            <textarea className={`${inputClassName} min-h-24`} value={form.idealForText} onChange={(event) => updateField('idealForText', event.target.value)} />
          </Field>
        </div>
      </section>

      <section className={sectionClassName}>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">图片与 SEO</h2>
        <div className="space-y-4">
          <div className="rounded-lg border border-dashed border-neutral-300 p-4">
            <p className="text-sm font-medium text-neutral-800">拖拽上传图片（Cloudflare Images）</p>
            <p className="mt-1 text-xs text-neutral-500">支持多图上传；上传后会自动写入下方图片 URL 列表。</p>
            <input
              type="file"
              accept="image/*"
              multiple
              className="mt-3 block text-sm"
              onChange={(event) => void handleUpload(event.target.files)}
              disabled={uploading}
            />
            {uploading ? <p className="mt-2 text-xs text-neutral-500">上传中...</p> : null}
          </div>

          <Field label="图片 URL（支持逗号或换行分隔）">
            <textarea
              className={`${inputClassName} min-h-24`}
              value={form.imagesText}
              onChange={(event) => updateField('imagesText', event.target.value)}
            />
          </Field>
          <Field label="主图 URL">
            <input className={inputClassName} value={form.heroImage} onChange={(event) => updateField('heroImage', event.target.value)} />
          </Field>
          {imagePreviewUrls.length > 0 ? (
            <div className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-600">
              已识别图片 {imagePreviewUrls.length} 张。主图将优先使用“主图 URL”，否则取第一张图片。
            </div>
          ) : null}
          <Field label="Meta Title">
            <input className={inputClassName} value={form.metaTitle} onChange={(event) => updateField('metaTitle', event.target.value)} />
          </Field>
          <Field label="Meta Description">
            <textarea className={`${inputClassName} min-h-24`} value={form.metaDescription} onChange={(event) => updateField('metaDescription', event.target.value)} />
          </Field>
        </div>
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-neutral-600">{message}</p> : null}

      <div className="flex flex-wrap gap-2">
        <button onClick={submit} disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50">
          {saving ? '保存中...' : '保存'}
        </button>
        <button
          type="button"
          onClick={() => setForm({ ...DEFAULT_PROPERTY_FORM })}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-neutral-700"
        >
          清空表单
        </button>
      </div>
    </div>
  );
}
