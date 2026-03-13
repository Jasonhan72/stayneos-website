import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PropertyDetailClient from './PropertyDetailClient';
import { getDb } from '@/lib/d1';
import { toPublicProperty } from '@/lib/property-db';
import { getPropertyById } from '@/lib/data';
import type { PropertyCardData } from '@/types';

interface PageProps {
  params: { id: string };
}

async function getProperty(idOrSlug: string): Promise<PropertyCardData | null> {
  // Try D1 database first
  try {
    const db = getDb();
    const row = await db
      .prepare("SELECT * FROM Property WHERE status='PUBLISHED' AND (slug = ? OR id = ?) LIMIT 1")
      .bind(idOrSlug, idOrSlug)
      .first();
    if (row) {
      // toPublicProperty returns a PropertyCardData-compatible shape
      return toPublicProperty(row as never) as unknown as PropertyCardData;
    }
  } catch {
    // D1 not available, fall through to mock data
  }
  
  // Fallback to mock/static data
  const mock = getPropertyById(idOrSlug);
  return mock ? (mock as unknown as PropertyCardData) : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const property = await getProperty(params.id);
  if (!property) return { title: 'Property Not Found | NEOS' };

  return {
    title: `${property.title} | NEOS`,
    description: property.description?.slice(0, 160) || '',
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const property = await getProperty(params.id);
  if (!property) notFound();
  return <PropertyDetailClient propertyId={params.id} initialProperty={property} />;
}
