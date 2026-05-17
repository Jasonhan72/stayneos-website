'use client';

import { Section } from '@/components/ui';
import { useI18n } from '@/lib/i18n';

export function HowItWorksSection() {
  const { t } = useI18n();

  const steps = [
    {
      number: '01',
      title: t('howItWorks.step1.title', 'Explore homes'),
      description: t('howItWorks.step1.description', 'Review furnished apartments, compare locations, and shortlist the right monthly stay.'),
    },
    {
      number: '02',
      title: t('howItWorks.step2.title', 'Confirm your dates'),
      description: t('howItWorks.step2.description', 'Choose the stay window that matches your project, move, or temporary housing timeline.'),
    },
    {
      number: '03',
      title: t('howItWorks.step3.title', 'Move in smoothly'),
      description: t('howItWorks.step3.description', 'Arrive to a fully set up home with utilities, furnishings, and support already in place.'),
    },
  ];

  return (
    <Section bg="white">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-4">
          {t('howItWorks.title', 'How NEOS works')}
        </h2>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          {t('howItWorks.subtitle', 'A simple path from discovery to check-in, designed for premium monthly furnished stays.')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div key={step.number} className="relative">
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-12 left-1/2 w-full h-px bg-neutral-200" />
            )}

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-primary text-white text-3xl font-bold mb-6">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-neutral-900">{step.title}</h3>
              <p className="text-neutral-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
