"use client";

import { Container, Section } from "@/components/ui";
import { Building2, Home, Briefcase, Shield, Clock, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const iconMap = {
  Building2,
  Home,
  Briefcase,
  Shield,
  Clock,
  Globe,
};

export default function ServicesPage() {
  const { t } = useI18n();

  const services = [
    {
      iconKey: "Building2",
      titleKey: "services.corporateHousing.title",
      descKey: "services.corporateHousing.desc",
      features: [
        t('services.features.utilities'),
        t('services.features.wifi'),
        t('services.features.housekeeping'),
        t('services.features.support'),
      ],
    },
    {
      iconKey: "Home",
      titleKey: "services.shortTerm.title",
      descKey: "services.shortTerm.desc",
      features: [
        t('services.features.minNights'),
        t('services.features.kitchen'),
        t('services.features.locations'),
        t('services.features.instant'),
      ],
    },
    {
      iconKey: "Briefcase",
      titleKey: "services.propertyManagement.title",
      descKey: "services.propertyManagement.desc",
      features: [
        t('services.features.photography'),
        t('services.features.screening'),
        t('services.features.collection'),
        t('services.features.maintenance'),
      ],
    },
    {
      iconKey: "Shield",
      titleKey: "services.concierge.title",
      descKey: "services.concierge.desc",
      features: [
        t('services.features.airport'),
        t('services.features.grocery'),
        t('services.features.restaurant'),
        t('services.features.recommendations'),
      ],
    },
    {
      iconKey: "Clock",
      titleKey: "services.flexibleLeasing.title",
      descKey: "services.flexibleLeasing.desc",
      features: [
        t('services.features.monthToMonth'),
        t('services.features.noHidden'),
        t('services.features.renewal'),
        t('services.features.termination'),
      ],
    },
    {
      iconKey: "Globe",
      titleKey: "services.globalNetwork.title",
      descKey: "services.globalNetwork.desc",
      features: ["Toronto", "Vancouver", "Montreal", "New York", "San Francisco"],
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <Section className="bg-gradient-to-br from-primary via-primary-800 to-primary-900 text-white py-20 md:py-28">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('services.title')}</h1>
            <p className="text-xl text-white/90 leading-relaxed">
              {t('services.subtitle')}
            </p>
          </div>
        </Container>
      </Section>

      {/* Services Grid */}
      <Section className="py-16 md:py-24">
        <Container>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const IconComponent = iconMap[service.iconKey as keyof typeof iconMap];
              return (
                <div
                  key={service.titleKey}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-neutral-100 hover:shadow-xl transition-shadow"
                >
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                    <IconComponent className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{t(service.titleKey)}</h3>
                  <p className="text-neutral-600 mb-6 leading-relaxed">{t(service.descKey)}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-neutral-600">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="bg-neutral-50 py-16">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">{t('services.cta.title')}</h2>
            <p className="text-neutral-600 mb-8">
              {t('services.cta.desc')}
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
            >
              {t('services.cta.button')}
            </a>
          </div>
        </Container>
      </Section>
    </>
  );
}
