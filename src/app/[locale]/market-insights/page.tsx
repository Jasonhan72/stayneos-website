import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import MarketInsightsHub from './MarketInsightsHub';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'marketInsights' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function MarketInsightsPage() {
  const _t = useTranslations('marketInsights');
  
  return <MarketInsightsHub />;
}