import { resolveRequestLocale, getServerTranslation } from "@/lib/i18n-server";
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PropertyDetailClient from './PropertyDetailClient';
import { getDb } from '@/lib/d1';
import { toPublicProperty } from '@/lib/property-db';
import { getPropertyById } from '@/lib/data';
import type { PropertyCardData } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
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
  const { id } = await params;
  const property = await getProperty(id);
  const locale = await resolveRequestLocale();
  if (!property) return { title: getServerTranslation(locale, 'property.notFound') };

  const title = (locale === 'zh' ? property.titleZh : locale === 'fr' ? property.titleFr : null) || property.title;
  const description = (locale === 'zh' ? property.descriptionZh : locale === 'fr' ? property.descriptionFr : null) || property.description;

  return {
    title,
    description: description?.slice(0, 160) || '',
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();
  return <PropertyDetailClient propertyId={id} initialProperty={property} />;
}
