import { Metadata } from 'next';
import FAQContent from './FAQContent';
import { getServerTranslation, resolveRequestLocale } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveRequestLocale();
  return {
    title: getServerTranslation(locale, 'faqPage.title', 'Frequently Asked Questions'),
    description: getServerTranslation(
      locale,
      'faqPage.subtitle',
      'Frequently asked questions about NEOS booking, payments, cancellations, and more.'
    ),
  };
}

export const revalidate = 3600;

export default function FAQPage() {
  return <FAQContent />;
}
