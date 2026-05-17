'use client';

import Image from 'next/image';
import { Section } from '@/components/ui';
import { useI18n } from '@/lib/i18n';

export function ValuePropositionSection() {
  const { t } = useI18n();

  const valueProps = [
    {
      image: '/images/cooper-55-c5e8357d.jpg',
      title: t('valueProposition.curated.title', 'Curated homes'),
      description: t('valueProposition.curated.description', 'Thoughtfully furnished apartments with premium finishes, natural light, and design-led interiors.'),
    },
    {
      image: '/images/cooper-55-c38824ec.jpg',
      title: t('valueProposition.flexible.title', 'Flexible terms'),
      description: t('valueProposition.flexible.description', 'Stay 30 days or longer with lease structures built for relocation, projects, and extended travel.'),
    },
    {
      image: '/images/cooper-55-a12c07ee.jpg',
      title: t('valueProposition.owner.title', 'Owner-Operated'),
      description: t('valueProposition.owner.description', "We don't just list properties — we own and manage every home in our collection. No middlemen, no surprises."),
    },
    {
      image: '/images/cooper-55-e62f3e96.jpg',
      title: t('valueProposition.support.title', 'Responsive support'),
      description: t('valueProposition.support.description', 'Our team stays available before arrival, during the stay, and whenever plans need to change.'),
    },
  ];

  return (
    <Section bg="neutral">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-4">
          {t('valueProposition.title', 'Why guests choose NEOS')}
        </h2>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          {t('valueProposition.subtitle', 'Premium Toronto residences with the operational reliability required for extended stays.')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {valueProps.map((prop) => (
          <div key={prop.title} className="text-center p-8 bg-white border border-neutral-200">
            <div className="w-full h-32 mx-auto mb-6 overflow-hidden rounded-lg">
              <Image
                src={prop.image}
                alt={prop.title}
                width={200}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-neutral-900">{prop.title}</h3>
            <p className="text-neutral-600">{prop.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
