import type { Metadata } from 'next';
import PropertiesPageClient from '@/components/pages/PropertiesPageClient';
import { resolveRequestLocale, getServerTranslation } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveRequestLocale();
  const title = getServerTranslation(locale, 'propertiesPageMeta.title', 'Premium Furnished Apartments in Toronto');
  const description = getServerTranslation(locale, 'propertiesPageMeta.description', 'Browse fully furnished premium rentals from NEOS.');

  return {
    title,
    description,
    alternates: { canonical: '/properties' },
    openGraph: { title: `${title} | NEOS`, description, url: '/properties' },
    twitter: { card: 'summary_large_image', title: `${title} | NEOS`, description },
  };
}

export const revalidate = 3600;

export default function PropertiesPage() {
  return <PropertiesPageClient />;
}
