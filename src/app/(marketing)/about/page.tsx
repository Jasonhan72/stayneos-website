import { Metadata } from 'next';
import AboutContent from './AboutContent';
import { getOgLocale, getServerTranslation, resolveRequestLocale } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveRequestLocale();
  const title = getServerTranslation(locale, 'aboutPage.title', 'About NEOS');
  const description = getServerTranslation(
    locale,
    'aboutPage.heroSubtitle',
    "We know what it's like to need a home in a city that isn't yours yet. That's why we built NEOS."
  );

  return {
    title,
    description,
    keywords: ['About NEOS', 'Company', 'Mission', 'Premium Apartments'],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: getOgLocale(locale),
    },
  };
}

export const revalidate = 3600;

export default function AboutPage() {
  return <AboutContent />;
}
