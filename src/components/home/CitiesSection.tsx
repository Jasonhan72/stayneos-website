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
  const neighborhoods = [
    t('cities.areaDowntown', 'Downtown Core'),
    t('cities.areaWaterfront', 'Waterfront'),
    t('cities.areaFinancial', 'Financial District'),
    t('cities.areaUniversity', 'University District'),
    t('cities.areaYorkville', 'Yorkville'),
    t('cities.areaMidtown', 'Midtown'),
  ];

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
    <section className="bg-neutral-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <Link href="/properties?city=toronto" className="group block">
            <div className="relative min-h-[28rem] overflow-hidden bg-neutral-900">
              <Image src="/images/cities/toronto.jpg" alt={cityName} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="inline-flex bg-white/90 px-3 py-1 text-xs font-semibold uppercase text-neutral-900">
                  {t('cities.availableNowBadge', 'Available Now')}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h2 className="mb-3 text-3xl font-semibold text-white md:text-5xl">{t('cities.titleCurrent', 'Toronto furnished apartments')}</h2>
                <p className="max-w-xl text-base text-white/85 md:text-lg">{t('cities.subtitleCurrent', "Move-in ready homes across Toronto's business, university, and waterfront neighborhoods.")}</p>
              </div>
              <div className="absolute top-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="bg-white p-2"><ArrowRight size={20} className="text-neutral-900" /></div>
              </div>
            </div>
          </Link>

          <div className="border border-neutral-200 bg-white p-6 md:p-8">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase text-primary">{t('cities.serviceAreaLabel', 'Service areas')}</p>
              <h3 className="text-2xl font-semibold text-neutral-900">{t('cities.serviceAreaTitle', 'Built around the places guests actually need to be')}</h3>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {neighborhoods.map((area) => (
                  <Link
                    key={area}
                    href={`/properties?city=toronto&area=${encodeURIComponent(area)}`}
                    className="border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-800 transition-colors hover:border-primary hover:text-primary"
                  >
                    {area}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t border-neutral-200 pt-6">
              <h4 className="text-base font-semibold text-neutral-900">{t('cities.yourCityNotify', 'Need another city?')}</h4>
              <p className="mt-2 text-sm text-neutral-600">{t('cities.yourCityDesc', 'Tell us where your team or family needs furnished housing next.')}</p>
              <form onSubmit={handleNotify} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t('cities.emailPlaceholder', 'Email address')}
                  className="min-h-11 flex-1 border border-neutral-300 px-4 py-3 text-sm text-neutral-900 outline-none focus:border-primary"
                  required
                />
                <button
                  type="submit"
                  disabled={notifyStatus === 'sending' || notifyStatus === 'done'}
                  className="min-h-11 bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
                >
                  {notifyStatus === 'sending' ? 'Sending...' : notifyStatus === 'done' ? t('cities.done', 'Done') : t('cities.notifyMe', 'Notify me')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
