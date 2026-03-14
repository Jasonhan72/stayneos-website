'use client';

import Link from 'next/link';
import Image from 'next/image';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useI18n } from '@/lib/i18n';

export default function RegisterContent() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[55%] xl:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center scale-105" style={{ backgroundImage: 'url("/images/cooper-55-e98a880d.jpg")' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/50" />
        <div className="relative z-10 flex flex-col justify-between h-full p-12 xl:p-16">
          <Link href="/" className="inline-block">
            <Image src="/logo.png" alt="NEOS" width={180} height={60} className="h-12 w-auto object-contain brightness-0 invert" priority />
          </Link>
          <div className="max-w-md">
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              {t('registerPage.heroTitle')}<br /><span className="text-accent">{t('registerPage.heroHighlight')}</span>
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">{t('registerPage.heroSubtitle')}</p>
            <div className="flex gap-8 mt-10">
              <div><div className="text-3xl font-bold text-accent">15K+</div><div className="text-sm text-white/70">{t('registerPage.apartments')}</div></div>
              <div><div className="text-3xl font-bold text-accent">50+</div><div className="text-sm text-white/70">{t('registerPage.cities')}</div></div>
              <div><div className="text-3xl font-bold text-accent">98%</div><div className="text-sm text-white/70">{t('registerPage.satisfaction')}</div></div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md">
            <p className="text-white/90 italic mb-4">&ldquo;NEOS made my relocation effortless. I moved into a beautiful, fully-furnished apartment within days.&rdquo;</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center text-white font-semibold">SM</div>
              <div><div className="text-white font-medium">Sarah Mitchell</div><div className="text-sm text-white/60">Product Manager, Google</div></div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-[45%] xl:w-1/2 flex flex-col bg-white">
        <div className="lg:hidden p-6 border-b border-neutral-100">
          <Link href="/" className="inline-block"><Image src="/logo.png" alt="NEOS" width={140} height={48} className="h-10 w-auto object-contain" priority /></Link>
        </div>
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-12 xl:px-16 py-8 lg:py-12 overflow-y-auto">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">{t('auth.registerTitle')}</h2>
              <p className="text-neutral-500">{t('auth.registerSubtitle')}</p>
            </div>
            <RegisterForm />
          </div>
        </div>
        <div className="px-6 sm:px-10 lg:px-12 xl:px-16 py-4 border-t border-neutral-100">
          <p className="text-xs text-neutral-400 text-center">&copy; {new Date().getFullYear()} NEOS. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
