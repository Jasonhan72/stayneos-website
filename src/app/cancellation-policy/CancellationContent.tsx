'use client';

import { useI18n } from '@/lib/i18n';

export default function CancellationContent() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">{t('cancellationPage.title')}</h1>
        <div className="prose prose-neutral max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">{t('cancellationPage.flexible')}</h2>
            <p className="text-neutral-600">{t('cancellationPage.flexibleDesc')}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">{t('cancellationPage.moderate')}</h2>
            <p className="text-neutral-600">{t('cancellationPage.moderateDesc')}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">{t('cancellationPage.longTerm')}</h2>
            <p className="text-neutral-600">{t('cancellationPage.longTermDesc')}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">{t('cancellationPage.refund')}</h2>
            <p className="text-neutral-600">{t('cancellationPage.refundDesc')}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">{t('cancellationPage.extenuating')}</h2>
            <p className="text-neutral-600">{t('cancellationPage.extenuatingDesc')}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">{t('cancellationPage.contact')}</h2>
            <p className="text-neutral-600">
              {t('cancellationPage.contactDesc', { email: 'hello@stayneos.com', phone: '+1 (647) 862-6518' })}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
