import { useTranslations } from 'next-intl';
import HomePageContent from '@/components/pages/HomePageContent';

export default function HomePage() {
  const _t = useTranslations('home');
  
  return <HomePageContent />;
}