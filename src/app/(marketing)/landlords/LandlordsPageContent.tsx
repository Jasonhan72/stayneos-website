"use client";

import { Container, Section } from "@/components/ui";
import { DollarSign, Shield, Clock, Headphones, TrendingUp, Building2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  income: DollarSign,
  protection: Shield,
  management: Clock,
  support: Headphones,
  marketing: TrendingUp,
  guests: Building2,
};

interface LandlordsPageContentProps {
  benefits: { iconKey: string }[];
}

export default function LandlordsPageContent({ benefits }: LandlordsPageContentProps) {
  const { t } = useI18n();

  const steps = [
    { step: "01", title: t("landlords.steps.step1.title"), desc: t("landlords.steps.step1.desc") },
    { step: "02", title: t("landlords.steps.step2.title"), desc: t("landlords.steps.step2.desc") },
    { step: "03", title: t("landlords.steps.step3.title"), desc: t("landlords.steps.step3.desc") },
  ];

  return (
    <>
      {/* Hero Section */}
      <Section className="bg-gradient-to-br from-primary via-primary-800 to-primary-900 text-white py-20 md:py-28">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("landlords.hero.title")}</h1>
            <p className="text-xl text-white/90 leading-relaxed mb-8">
              {t("landlords.hero.subtitle")}
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-full font-semibold hover:bg-white/90 transition-colors"
            >
              {t("landlords.hero.cta")}
            </a>
          </div>
        </Container>
      </Section>

      {/* Benefits Grid */}
      <Section className="py-16 md:py-24">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t("landlords.benefits.title")}</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              {t("landlords.benefits.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit) => {
              const IconComponent = iconMap[benefit.iconKey];
              return (
                <div
                  key={benefit.iconKey}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-neutral-100 hover:shadow-xl transition-shadow"
                >
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                    <IconComponent className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{t(`landlords.benefits.${benefit.iconKey}.title`)}</h3>
                  <p className="text-neutral-600 leading-relaxed">{t(`landlords.benefits.${benefit.iconKey}.desc`)}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* How It Works */}
      <Section className="bg-neutral-50 py-16 md:py-24">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t("landlords.howItWorks.title")}</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              {t("landlords.howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-neutral-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="py-16">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">{t("landlords.cta.title")}</h2>
            <p className="text-neutral-600 mb-8">
              {t("landlords.cta.subtitle")}
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
            >
              {t("landlords.cta.button")}
            </a>
          </div>
        </Container>
      </Section>
    </>
  );
}
