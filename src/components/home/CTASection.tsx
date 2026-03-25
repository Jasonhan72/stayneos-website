'use client';

import Link from 'next/link';
import { Button, Container } from '@/components/ui';
import { useI18n } from '@/lib/i18n';

export function CTASection() {
  const { t } = useI18n();
  const trustItems = [
    '$2M Commercial Liability Insurance',
    'All properties in concierge buildings',
    'Licensed Ontario brokerage',
  ];

  return (
    <section className="py-24 bg-primary">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10 text-center text-sm text-white/70">
          {trustItems.map((item) => (
            <p key={item}>{`✓ ${item}`}</p>
          ))}
        </div>
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('cta.title', 'Ready for a better extended stay in Toronto?')}
          </h2>

          <p className="text-lg text-white/90 mb-10">
            {t('cta.subtitle', 'Browse available residences or contact NEOS for tailored relocation and business housing support.')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button variant="secondary" size="lg" className="bg-accent text-neutral-900 hover:bg-accent-600 font-semibold">
                {t('cta.explore', 'Explore properties')}
              </Button>
            </Link>

            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                {t('cta.contact', 'Contact NEOS')}
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
