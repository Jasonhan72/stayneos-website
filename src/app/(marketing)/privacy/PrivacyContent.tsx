'use client';

import { useI18n } from '@/lib/i18n';
import { Container, Section } from '@/components/ui';

export default function PrivacyContent() {
  const { t } = useI18n();

  return (
    <Section className="py-16 md:py-24">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">{t('privacyPage.title')}</h1>
          <p className="text-neutral-600 mb-8">{t('privacyPage.lastUpdated')}</p>
          <div className="prose prose-neutral max-w-none">
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('privacyPage.s1Title')}</h2>
            <p className="mb-4">{t('privacyPage.s1Text')}</p>
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('privacyPage.s2Title')}</h2>
            <p className="mb-4">{t('privacyPage.s2Text')}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {[...Array(parseInt(t('privacyPage.s2Items_count')) || 0)].map((_, i) => <li key={i}>{t(`privacyPage.s2Items_${i}`)}</li>)}
            </ul>
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('privacyPage.s3Title')}</h2>
            <p className="mb-4">{t('privacyPage.s3Text')}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {[...Array(parseInt(t('privacyPage.s3Items_count')) || 0)].map((_, i) => <li key={i}>{t(`privacyPage.s3Items_${i}`)}</li>)}
            </ul>
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('privacyPage.s4Title')}</h2>
            <p className="mb-4">{t('privacyPage.s4Text')}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {[...Array(parseInt(t('privacyPage.s4Items_count')) || 0)].map((_, i) => <li key={i}>{t(`privacyPage.s4Items_${i}`)}</li>)}
            </ul>
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('privacyPage.s5Title')}</h2>
            <p className="mb-4">{t('privacyPage.s5Text')}</p>
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('privacyPage.s6Title')}</h2>
            <p className="mb-4">{t('privacyPage.s6Text')}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {[...Array(parseInt(t('privacyPage.s6Items_count')) || 0)].map((_, i) => <li key={i}>{t(`privacyPage.s6Items_${i}`)}</li>)}
            </ul>
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('privacyPage.s7Title')}</h2>
            <p className="mb-4">{t('privacyPage.s7Text')}</p>
            <p className="mb-4 whitespace-pre-line">{t('privacyPage.contactInfo')}</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
