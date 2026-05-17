'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useI18n } from '@/lib/i18n';

export function CitiesSection() {
  const { t, locale } = useI18n();
  const cityName = locale === 'zh' ? '多伦多' : locale === 'fr' ? 'Toronto' : 'Toronto';
  const [email, setEmail] = useState('');

  const [notifyStatus, setNotifyStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const handleNotify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotifyStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'City Waitlist Subscriber',
          email,
          subject: 'City expansion waitlist',
          message: `Interested in seeing NEOS rentals in my city. Email: ${email}`,
        }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setNotifyStatus('done');
      setEmail('');
      setTimeout(() => setNotifyStatus('idle'), 3000);
    } catch {
      setNotifyStatus('error');
      setTimeout(() => setNotifyStatus('idle'), 4000);
    }
  };

  return (
    <section className="py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-4">{t('cities.title')}</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">{t('cities.subtitleCurrent', "Starting in Toronto — Canada's business capital")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/properties?city=toronto">
            <div className="group relative overflow-hidden rounded-xl aspect-[4/5] bg-neutral-900">
              <Image src="/images/cities/toronto.jpg" alt={cityName} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-900">
                  {t('cities.availableNowBadge', 'Available Now')}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white tracking-tight mb-1">{cityName}</h3>
                <p className="text-white/80 text-sm">{t('cities.availableNow', 'Available now')}</p>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white rounded-full p-2"><ArrowRight size={20} className="text-neutral-900" /></div>
              </div>
            </div>
          </Link>

          <div className="group relative overflow-hidden rounded-xl aspect-[4/5] bg-neutral-900">
            <Image src="/images/cities/niagara.jpg" alt={t('cities.niagaraFalls', 'Niagara Falls')} fill className="object-cover grayscale opacity-50 transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20">
                {t('cities.comingSoon', 'Coming Soon')}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-2xl font-bold text-white tracking-tight mb-1">{t('cities.niagaraFalls', 'Niagara Falls')}</h3>
              <p className="text-white/75 text-sm">{t('cities.niagaraDesc', 'A new market in development.')}</p>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 flex flex-col justify-between min-h-[24rem]">
            <div>
              <div className="mb-6 flex h-28 items-center justify-center rounded-lg bg-[radial-gradient(circle_at_center,_rgba(23,37,84,0.12),_transparent_60%),linear-gradient(135deg,rgba(15,23,42,0.04),rgba(15,23,42,0.08))]">
                <span className="text-6xl font-bold text-neutral-400">?</span>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 tracking-tight mb-2">{t('cities.yourCity', 'Your City?')}</h3>
              <p className="text-neutral-600 mb-2">{t('cities.yourCityNotify', 'Get notified when we expand')}</p>
              <p className="text-sm text-neutral-500">{t('cities.yourCityDesc', 'Tell us where you need premium furnished stays next.')}</p>
            </div>

            <form onSubmit={handleNotify} className="mt-6 space-y-3">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t('cities.emailPlaceholder', 'Email address')}
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm text-neutral-900 outline-none focus:border-primary"
                required
              />
              <button
                type="submit"
                disabled={notifyStatus === 'sending' || notifyStatus === 'done'}
                className={`w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition-colors ${
                  notifyStatus === 'done'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-primary hover:bg-primary-700'
                } disabled:opacity-60`}
              >
                {notifyStatus === 'sending' ? 'Sending...' : notifyStatus === 'done' ? 'Done ✓' : t('cities.notifyMe', 'Notify Me')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
