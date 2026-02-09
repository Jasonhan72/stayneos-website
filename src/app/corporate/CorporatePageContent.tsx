"use client";

import { Container, Section } from "@/components/ui";
import { Building2, Users, Globe, Briefcase, Clock, Shield } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  housing: Building2,
  group: Users,
  mobility: Globe,
  executive: Briefcase,
  terms: Clock,
  inclusive: Shield,
  location: Building2,
  support: Users,
};

interface CorporatePageContentProps {
  solutions: { iconKey: string }[];
  benefits: { iconKey: string }[];
}

export default function CorporatePageContent({ solutions, benefits }: CorporatePageContentProps) {
  const { t } = useI18n();

  return (
    <>
      {/* Hero Section */}
      <Section className="bg-gradient-to-br from-primary via-primary-800 to-primary-900 text-white py-20 md:py-28">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("corporate.hero.title")}</h1>
            <p className="text-xl text-white/90 leading-relaxed mb-8">
              {t("corporate.hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary rounded-full font-semibold hover:bg-white/90 transition-colors"
              >
                {t("corporate.hero.ctaQuote")}
              </a>
              <a
                href="/properties"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-colors"
              >
                {t("corporate.hero.ctaBrowse")}
              </a>
            </div>
          </div>
        </Container>
      </Section>

      {/* Solutions Grid */}
      <Section className="py-16 md:py-24">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t("corporate.solutions.title")}</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              {t("corporate.solutions.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {solutions.map((solution) => {
              const IconComponent = iconMap[solution.iconKey];
              return (
                <div
                  key={solution.iconKey}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-neutral-100 hover:shadow-xl transition-shadow"
                >
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                    <IconComponent className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{t(`corporate.solutions.${solution.iconKey}.title`)}</h3>
                  <p className="text-neutral-600 leading-relaxed">{t(`corporate.solutions.${solution.iconKey}.desc`)}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Benefits Bar */}
      <Section className="bg-neutral-50 py-16">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {benefits.map((benefit) => {
              const IconComponent = iconMap[benefit.iconKey];
              return (
                <div key={benefit.iconKey} className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-1">{t(`corporate.benefits.${benefit.iconKey}.title`)}</h4>
                  <p className="text-sm text-neutral-600">{t(`corporate.benefits.${benefit.iconKey}.desc`)}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="py-16">
        <Container>
          <div className="bg-blue-600 rounded-3xl p-8 md:p-16 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">{t("corporate.cta.title")}</h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              {t("corporate.cta.subtitle")}
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-full font-semibold hover:bg-white/90 transition-colors"
            >
              {t("corporate.cta.button")}
            </a>
          </div>
        </Container>
      </Section>
    </>
  );
}
