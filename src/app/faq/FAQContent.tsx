'use client';

import { useI18n } from '@/lib/i18n';
import { Container, Section } from '@/components/ui';

export default function FAQContent() {
  const { t } = useI18n();

  const faqs = [
    { category: t('faqPage.cat_booking'), questions: [
      { q: t('faqPage.bq1'), a: t('faqPage.ba1') }, { q: t('faqPage.bq2'), a: t('faqPage.ba2') },
      { q: t('faqPage.bq3'), a: t('faqPage.ba3') }, { q: t('faqPage.bq4'), a: t('faqPage.ba4') },
    ]},
    { category: t('faqPage.cat_payment'), questions: [
      { q: t('faqPage.pq1'), a: t('faqPage.pa1') }, { q: t('faqPage.pq2'), a: t('faqPage.pa2') },
      { q: t('faqPage.pq3'), a: t('faqPage.pa3') }, { q: t('faqPage.pq4'), a: t('faqPage.pa4') },
    ]},
    { category: t('faqPage.cat_cancellation'), questions: [
      { q: t('faqPage.cq1'), a: t('faqPage.ca1') }, { q: t('faqPage.cq2'), a: t('faqPage.ca2') },
      { q: t('faqPage.cq3'), a: t('faqPage.ca3') },
    ]},
    { category: t('faqPage.cat_checkin'), questions: [
      { q: t('faqPage.chq1'), a: t('faqPage.cha1') }, { q: t('faqPage.chq2'), a: t('faqPage.cha2') },
      { q: t('faqPage.chq3'), a: t('faqPage.cha3') },
    ]},
    { category: t('faqPage.cat_property'), questions: [
      { q: t('faqPage.prq1'), a: t('faqPage.pra1') }, { q: t('faqPage.prq2'), a: t('faqPage.pra2') },
      { q: t('faqPage.prq3'), a: t('faqPage.pra3') }, { q: t('faqPage.prq4'), a: t('faqPage.pra4') },
    ]},
    { category: t('faqPage.cat_support'), questions: [
      { q: t('faqPage.sq1'), a: t('faqPage.sa1') }, { q: t('faqPage.sq2'), a: t('faqPage.sa2') },
      { q: t('faqPage.sq3'), a: t('faqPage.sa3') },
    ]},
  ];

  return (
    <>
      <Section className="py-16 md:py-20 bg-neutral-50">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('faqPage.title')}</h1>
            <p className="text-lg text-neutral-600">{t('faqPage.subtitle')}</p>
          </div>
        </Container>
      </Section>
      <Section className="py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto space-y-16">
            {faqs.map((category, idx) => (
              <div key={idx}>
                <h2 className="text-2xl font-bold mb-6 pb-4 border-b border-neutral-200">{category.category}</h2>
                <div className="space-y-6">
                  {category.questions.map((item, qIdx) => (
                    <div key={qIdx} className="bg-white rounded-lg p-6 shadow-sm border border-neutral-100">
                      <h3 className="text-lg font-semibold mb-3 text-neutral-900">{item.q}</h3>
                      <p className="text-neutral-600 leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
      <Section className="py-16 bg-primary">
        <Container>
          <div className="max-w-2xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-4">{t('faqPage.stillHaveQuestions')}</h2>
            <p className="text-lg text-white/90 mb-8">{t('faqPage.teamHelp')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://wa.me/16478626518" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-primary font-semibold rounded-full hover:bg-neutral-100 transition-colors">
                {t('faqPage.whatsappUs')}
              </a>
              <a href="mailto:hello@stayneos.com" className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-colors">
                {t('faqPage.emailUs')}
              </a>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
