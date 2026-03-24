'use client';

import { useI18n } from '@/lib/i18n';

export default function ServiceAnimalsContent() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">{t('serviceAnimalsPage.title')}</h1>
        <div className="prose prose-neutral max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">{t('serviceAnimalsPage.welcome')}</h2>
            <p className="text-neutral-600">{t('serviceAnimalsPage.welcomeDesc')}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">{t('serviceAnimalsPage.noFees')}</h2>
            <p className="text-neutral-600">{t('serviceAnimalsPage.noFeesDesc')}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">{t('serviceAnimalsPage.responsibilities')}</h2>
            <ul className="list-disc pl-6 text-neutral-600 space-y-2">
              {[...Array(parseInt(t('serviceAnimalsPage.responsibilityItems_count')) || 0)].map((_, i) => <li key={i}>{t(`serviceAnimalsPage.responsibilityItems_${i}`)}</li>)}
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">{t('serviceAnimalsPage.emotional')}</h2>
            <p className="text-neutral-600">{t('serviceAnimalsPage.emotionalDesc')}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">{t('serviceAnimalsPage.contact')}</h2>
            <p className="text-neutral-600">{t('serviceAnimalsPage.contactDesc', { email: 'hello@neos.rentals' })}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
