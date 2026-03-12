'use client';

import { Shield, Clock, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export function TrustBadgesSection() {
  const { t } = useI18n();

  const badges = [
    { icon: Sparkles, label: t('trust.selection') || 'Premium Selection' },
    { icon: Shield, label: t('trust.verified') || 'Verified Homes' },
    { icon: Clock, label: t('trust.support') || '24/7 Support' },
  ];

  return (
    <section className="py-8 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {badges.map((badge) => (
            <div key={badge.label} className="flex items-center gap-2 text-neutral-600">
              <badge.icon size={20} className="text-primary" />
              <span className="font-medium">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
