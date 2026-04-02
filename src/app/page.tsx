import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n.config';

// 根页面重定向到默认语言
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}