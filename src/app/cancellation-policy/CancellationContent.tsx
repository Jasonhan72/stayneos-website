'use client';

import { useI18n } from '@/lib/i18n';

export default function CancellationContent() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 mb-6 md:mb-8">{t('cancellationPage.title')}</h1>
        <div className="prose prose-neutral max-w-none space-y-6 md:space-y-8">
          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-neutral-900 mb-3">{t('cancellationPage.flexible')}</h2>
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed">{t('cancellationPage.flexibleDesc')}</p>
          </section>
          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-neutral-900 mb-3">{t('cancellationPage.moderate')}</h2>
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed">{t('cancellationPage.moderateDesc')}</p>
          </section>
          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-neutral-900 mb-3">{t('cancellationPage.longTerm')}</h2>
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed">{t('cancellationPage.longTermDesc')}</p>
          </section>
          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-neutral-900 mb-3">{t('cancellationPage.refund')}</h2>
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed">{t('cancellationPage.refundDesc')}</p>
          </section>
          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-neutral-900 mb-3">{t('cancellationPage.extenuating')}</h2>
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed">{t('cancellationPage.extenuatingDesc')}</p>
          </section>
          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-neutral-900 mb-3">{t('cancellationPage.contact')}</h2>
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed">
              {t('cancellationPage.contactDesc', { email: 'hello@neos.rentals', phone: '+1 (647) 862-6518' })}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
