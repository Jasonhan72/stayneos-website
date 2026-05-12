import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ propertyId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Legacy /booking/[id] route — kept as a redirect to /checkout/[id] so
 * outbound links from old emails / saved tabs continue to land in the
 * right place. The active booking flow is checkout → payment → success.
 */
export default async function BookingPage({ params, searchParams }: PageProps) {
  const { propertyId } = await params;
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === 'string') qs.set(k, v);
    else if (Array.isArray(v) && v[0]) qs.set(k, v[0]);
  }
  const query = qs.toString();
  redirect(`/checkout/${propertyId}${query ? `?${query}` : ''}`);
}
