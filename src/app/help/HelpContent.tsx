'use client';

import { useI18n } from '@/lib/i18n';
import { Container, Section } from '@/components/ui';
import { Search, HelpCircle, Phone, Mail } from 'lucide-react';

export default function HelpContent() {
  const { t } = useI18n();

  const faqs = [
    { category: t('helpPage.cat_booking'), questions: [
      { q: t('helpPage.bkq1'), a: t('helpPage.bka1') }, { q: t('helpPage.bkq2'), a: t('helpPage.bka2') }, { q: t('helpPage.bkq3'), a: t('helpPage.bka3') },
    ]},
    { category: t('helpPage.cat_payment'), questions: [
      { q: t('helpPage.pmq1'), a: t('helpPage.pma1') }, { q: t('helpPage.pmq2'), a: t('helpPage.pma2') }, { q: t('helpPage.pmq3'), a: t('helpPage.pma3') },
    ]},
    { category: t('helpPage.cat_checkin'), questions: [
      { q: t('helpPage.ciq1'), a: t('helpPage.cia1') }, { q: t('helpPage.ciq2'), a: t('helpPage.cia2') }, { q: t('helpPage.ciq3'), a: t('helpPage.cia3') },
    ]},
    { category: t('helpPage.cat_during'), questions: [
      { q: t('helpPage.duq1'), a: t('helpPage.dua1') }, { q: t('helpPage.duq2'), a: t('helpPage.dua2') }, { q: t('helpPage.duq3'), a: t('helpPage.dua3') },
    ]},
  ];

  return (
    <>
      <Section className="bg-gradient-to-br from-primary via-primary-800 to-primary-900 text-white py-16 md:py-24">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">{t('helpPage.title')}</h1>
            <p className="text-lg text-white/90 mb-8">{t('helpPage.subtitle')}</p>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input type="text" placeholder={t('helpPage.searchPlaceholder')} className="w-full pl-12 pr-4 py-4 rounded-full text-neutral-800 focus:outline-none focus:ring-2 focus:ring-white/50" />
            </div>
          </div>
        </Container>
      </Section>
      <Section className="py-16">
        <Container>
          <div className="max-w-3xl mx-auto space-y-12">
            {faqs.map((section) => (
              <div key={section.category}>
                <h2 className="text-2xl font-semibold mb-6">{section.category}</h2>
                <div className="space-y-4">
                  {section.questions.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
                      <h3 className="font-semibold mb-2 flex items-start gap-3">
                        <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />{item.q}
                      </h3>
                      <p className="text-neutral-600 pl-8">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
      <Section className="bg-neutral-50 py-16">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-4">{t('helpPage.stillNeedHelp')}</h2>
            <p className="text-neutral-600 mb-8">{t('helpPage.supportAvailable')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+16478626518" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
                <Phone className="w-5 h-5 text-blue-600" /><span>+1 (647) 862-6518</span>
              </a>
              <a href="mailto:hello@neos.rentals" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
                <Mail className="w-5 h-5 text-blue-600" /><span>hello@neos.rentals</span>
              </a>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
