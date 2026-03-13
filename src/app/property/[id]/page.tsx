import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PropertyDetailClient from './PropertyDetailClient';
import { getDb } from '@/lib/d1';
import { toPublicProperty } from '@/lib/property-db';

interface PageProps {
  params: { id: string };
}

async function getProperty(idOrSlug: string) {
  const db = getDb();
  const row = await db
    .prepare("SELECT * FROM Property WHERE status='PUBLISHED' AND (slug = ? OR id = ?) LIMIT 1")
    .bind(idOrSlug, idOrSlug)
    .first();
  return row ? toPublicProperty(row as never) : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const property = await getProperty(params.id);
  if (!property) return { title: 'Property Not Found | NEOS' };

  return {
    title: `${property.title} | NEOS`,
    description: property.metaDescription || property.description?.slice(0, 160) || '',
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const property = await getProperty(params.id);
  if (!property) notFound();
  return <PropertyDetailClient propertyId={params.id} initialProperty={property} />;
}
