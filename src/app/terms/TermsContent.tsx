'use client';

import { useI18n } from '@/lib/i18n';
import { Container, Section } from '@/components/ui';

export default function TermsContent() {
  const { t } = useI18n();

  return (
    <Section className="py-16 md:py-24">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">{t('termsPage.title')}</h1>
          <p className="text-neutral-600 mb-8">{t('termsPage.lastUpdated')}</p>
          <div className="prose prose-neutral max-w-none">
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('termsPage.s1Title')}</h2>
            <p className="mb-4">{t('termsPage.s1Text')}</p>
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('termsPage.s2Title')}</h2>
            <p className="mb-4">{t('termsPage.s2Text')}</p>
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('termsPage.s3Title')}</h2>
            <p className="mb-4"><strong>{t('termsPage.s3_1')}</strong></p>
            <p className="mb-4"><strong>{t('termsPage.s3_2')}</strong></p>
            <p className="mb-4"><strong>{t('termsPage.s3_3')}</strong></p>
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('termsPage.s4Title')}</h2>
            <p className="mb-4"><strong>{t('termsPage.s4_1')}</strong></p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>{t('termsPage.s4_1a')}</li>
              <li>{t('termsPage.s4_1b')}</li>
              <li>{t('termsPage.s4_1c')}</li>
            </ul>
            <p className="mb-4"><strong>{t('termsPage.s4_2')}</strong></p>
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('termsPage.s5Title')}</h2>
            <p className="mb-4">{t('termsPage.s5Text')}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {[...Array(parseInt(t('termsPage.s5Items_count')) || 0)].map((_, i) => <li key={i}>{t(`termsPage.s5Items_${i}`)}</li>)}
            </ul>
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('termsPage.s6Title')}</h2>
            <p className="mb-4"><strong>{t('termsPage.s6_1')}</strong></p>
            <p className="mb-4"><strong>{t('termsPage.s6_2')}</strong></p>
            <p className="mb-4"><strong>{t('termsPage.s6_3')}</strong></p>
            <p className="mb-4"><strong>{t('termsPage.s6_4')}</strong></p>
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('termsPage.s7Title')}</h2>
            <p className="mb-4">{t('termsPage.s7Text')}</p>
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('termsPage.s8Title')}</h2>
            <p className="mb-4">{t('termsPage.s8Text')}</p>
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('termsPage.s9Title')}</h2>
            <p className="mb-4">{t('termsPage.s9Text')}</p>
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('termsPage.s10Title')}</h2>
            <p className="mb-4">{t('termsPage.s10Text')}</p>
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('termsPage.s11Title')}</h2>
            <p className="mb-4">{t('termsPage.s11Text')}</p>
            <p className="mb-4 whitespace-pre-line">{t('termsPage.contactInfo')}</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
