'use client';

import { Building2, FileCheck2, ShieldCheck } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export function TrustBadgesSection() {
  const { t } = useI18n();

  const badges = [
    { icon: FileCheck2, label: t('trust.licensed', 'Licensed Ontario brokerage') },
    { icon: Building2, label: t('trust.concierge', 'Concierge buildings') },
    { icon: ShieldCheck, label: t('trust.insurance', '$2M liability coverage') },
  ];

  return (
    <section className="bg-white py-7 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 text-left sm:grid-cols-3">
          {badges.map((badge) => (
            <div key={badge.label} className="flex items-center gap-3 border-l border-neutral-200 pl-4 text-neutral-700">
              <badge.icon size={20} className="shrink-0 text-primary" />
              <span className="text-sm font-semibold">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
