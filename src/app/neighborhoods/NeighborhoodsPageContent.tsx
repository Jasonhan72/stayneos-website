"use client";

import { Container, Section } from "@/components/ui";
import { Building2, MapPin, Train, HeartPulse, Landmark, Briefcase, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const cards = [
  {
    id: "waterfront",
    icon: Building2,
    titleKey: "neighborhoods.data.waterfront.name",
    taglineKey: "neighborhoods.data.waterfront.tagline",
    bulletsKeys: [
      "neighborhoods.data.waterfront.features.1",
      "neighborhoods.data.waterfront.features.2",
      "neighborhoods.data.waterfront.features.3",
      "neighborhoods.data.waterfront.features.4",
      "neighborhoods.data.waterfront.features.5",
    ],
    audienceIcon: Briefcase,
  },
  {
    id: "downtown",
    icon: Landmark,
    titleKey: "neighborhoods.data.downtown.name",
    taglineKey: "neighborhoods.data.downtown.tagline",
    bulletsKeys: [
      "neighborhoods.data.downtown.features.1",
      "neighborhoods.data.downtown.features.2",
      "neighborhoods.data.downtown.features.3",
      "neighborhoods.data.downtown.features.4",
      "neighborhoods.data.downtown.features.5",
    ],
    audienceIcon: HeartPulse,
  },
  {
    id: "north-york",
    icon: Train,
    titleKey: "neighborhoods.data.north-york.name",
    taglineKey: "neighborhoods.data.north-york.tagline",
    bulletsKeys: [
      "neighborhoods.data.north-york.features.1",
      "neighborhoods.data.north-york.features.2",
      "neighborhoods.data.north-york.features.3",
      "neighborhoods.data.north-york.features.4",
      "neighborhoods.data.north-york.features.5",
    ],
    audienceIcon: Users,
  },
];

export default function NeighborhoodsPageContent() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen">
      <Section className="relative py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">{t("neighborhoods.hero.title")}</h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">{t("neighborhoods.hero.subtitle")}</p>
          </div>
        </Container>
      </Section>

      <Section className="py-20 bg-gray-50">
        <Container>
          <div className="grid lg:grid-cols-3 gap-8">
            {cards.map((card) => (
              <div key={card.id} className="bg-white p-8 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <card.icon className="text-blue-600" size={32} />
                  <MapPin className="text-gray-400" size={18} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t(card.titleKey)}</h2>
                <p className="text-blue-700 font-medium mb-6">{t(card.taglineKey)}</p>
                <ul className="space-y-2 text-gray-700">
                  {card.bulletsKeys.map((key) => (
                    <li key={key} className="text-sm leading-relaxed">• {t(key)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}
