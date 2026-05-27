import { Metadata } from 'next';
import Link from 'next/link';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { LoginForm } from '@/components/auth/LoginForm';

import { resolveRequestLocale, getServerTranslation, getOgLocale } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveRequestLocale();
  return {
    title: getServerTranslation(locale, 'pagesAuth.loginPage.title', 'Log In - NEOS'),
    description: getServerTranslation(locale, 'pagesAuth.loginPage.description', 'Log in to your NEOS account to manage bookings and access premium furnished apartments.'),
    openGraph: { locale: getOgLocale(locale) },
  };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ callbackUrl?: string; callback?: string; redirect?: string; next?: string }>;
}) {
    const locale = await resolveRequestLocale();
  const loginHeroTitle = getServerTranslation(locale, 'loginPage.heroTitle', 'Welcome Back to Your Home Away From Home');
  const loginHeroSubtitle = getServerTranslation(locale, 'loginPage.heroSubtitle', 'Access your account and manage your luxury living experience');
  const loginTitle = getServerTranslation(locale, 'loginPage.loginTitle', 'Welcome Back');
  const loginSubtitle = getServerTranslation(locale, 'loginPage.loginSubtitle', 'Sign in to access your account');

  const resolvedSearchParams = await searchParams;
  const callbackUrl = resolvedSearchParams?.redirect || resolvedSearchParams?.callbackUrl || resolvedSearchParams?.callback || resolvedSearchParams?.next || '/';

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[55%] relative min-h-screen bg-neutral-900">
        <ResponsiveImage src="/images/cooper-55-e98a880d.jpg" alt="Toronto skyline view from a NEOS property" fill className="object-cover" priority={true} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-12">
          <div>
            <Link href="/" className="inline-block">
              <ResponsiveImage src="/logo.png" alt="NEOS" width={180} height={60} className="h-14 w-auto object-contain brightness-0 invert" priority={true} />
            </Link>
          </div>
          <div className="max-w-lg">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">{loginHeroTitle}</h1>
            <p className="text-lg text-white/90 leading-relaxed">{loginHeroSubtitle}</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-6 sm:p-8 lg:p-16 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/">
              <ResponsiveImage src="/logo.png" alt="NEOS" width={150} height={50} className="h-12 w-auto object-contain" priority={true} />
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">{loginTitle}</h1>
            <p className="text-neutral-600">{loginSubtitle}</p>
          </div>

          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </div>
    </div>
  );
}
