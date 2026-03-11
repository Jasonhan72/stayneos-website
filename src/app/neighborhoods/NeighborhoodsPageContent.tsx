"use client";

import React, { useState } from "react";
import { Container, Section } from "@/components/ui";
import {
  MapPin,
  Train,
  Coffee,
  Building2,
  Star,
  DollarSign,
  Clock,
  Users,
  Plane,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface Neighborhood {
  id: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  transportation: string[];
  averagePrice: { studio: number; oneBed: number; twoBed: number };
  highlights: { icon: LucideIcon; text: string }[];
  popularWith: string[];
}

export default function NeighborhoodsPageContent() {
  const { t } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const neighborhoods: Neighborhood[] = ["downtown", "yorkville", "liberty-village", "midtown", "north-york", "waterfront"].map((id) => ({
    id,
    name: t(`neighborhoods.data.${id}.name`),
    tagline: t(`neighborhoods.data.${id}.tagline`),
    description: t(`neighborhoods.data.${id}.description`),
    features: [1, 2, 3, 4, 5].map((n) => t(`neighborhoods.data.${id}.features.${n}`)),
    transportation: [1, 2, 3, 4].map((n) => t(`neighborhoods.data.${id}.transportation.${n}`)),
    averagePrice: {
      studio: Number(t(`neighborhoods.data.${id}.pricing.studio`)),
      oneBed: Number(t(`neighborhoods.data.${id}.pricing.oneBed`)),
      twoBed: Number(t(`neighborhoods.data.${id}.pricing.twoBed`)),
    },
    highlights: [
      { icon: Building2, text: t(`neighborhoods.data.${id}.highlights.1`) },
      { icon: Train, text: t(`neighborhoods.data.${id}.highlights.2`) },
      { icon: Coffee, text: t(`neighborhoods.data.${id}.highlights.3`) },
      { icon: Users, text: t(`neighborhoods.data.${id}.highlights.4`) },
    ],
    popularWith: [1, 2, 3].map((n) => t(`neighborhoods.data.${id}.popularWith.${n}`)),
  }));

  const categories = [
    { id: "all", name: t("neighborhoods.categories.all"), icon: MapPin },
    { id: "business", name: t("neighborhoods.categories.business"), icon: Building2 },
    { id: "luxury", name: t("neighborhoods.categories.luxury"), icon: Star },
    { id: "value", name: t("neighborhoods.categories.value"), icon: DollarSign },
  ];

  const getFilteredNeighborhoods = () => {
    if (selectedCategory === "all") return neighborhoods;
    if (selectedCategory === "business") return neighborhoods.filter((n) => ["downtown", "north-york"].includes(n.id));
    if (selectedCategory === "luxury") return neighborhoods.filter((n) => ["yorkville", "waterfront"].includes(n.id));
    if (selectedCategory === "value") return neighborhoods.filter((n) => ["midtown", "north-york", "liberty-village"].includes(n.id));
    return neighborhoods;
  };

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

      <Section className="py-12 bg-white border-b border-gray-200">
        <Container>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button key={category.id} onClick={() => setSelectedCategory(category.id)} className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-200 ${selectedCategory === category.id ? "bg-blue-600 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                <category.icon size={18} />
                {category.name}
              </button>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="py-20 bg-gray-50">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12">
            {getFilteredNeighborhoods().map((neighborhood) => (
              <div key={neighborhood.id} className="bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                <div className="h-64 bg-gradient-to-br from-blue-400 to-blue-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold mb-1">{neighborhood.name}</h3>
                    <p className="text-blue-100">{neighborhood.tagline}</p>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                    <MapPin size={16} className="inline mr-1" />
                    {t("neighborhoods.city")}
                  </div>
                </div>

                <div className="p-8">
                  <p className="text-gray-600 mb-6 leading-relaxed">{neighborhood.description}</p>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">{t("neighborhoods.labels.popularWith")}</h4>
                    <div className="flex flex-wrap gap-2">
                      {neighborhood.popularWith.map((group, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 text-sm font-medium">{group}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">{t("neighborhoods.labels.highlights")}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {neighborhood.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-center gap-2 text-gray-600">
                          <highlight.icon size={16} className="text-blue-600" />
                          <span className="text-sm">{highlight.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">{t("neighborhoods.labels.keyFeatures")}</h4>
                    <ul className="space-y-2">
                      {neighborhood.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-600"><div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" /><span className="text-sm">{feature}</span></li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Train size={16} className="text-blue-600" />{t("neighborhoods.labels.transportation")}</h4>
                    <ul className="space-y-1">
                      {neighborhood.transportation.slice(0, 2).map((transport, index) => (<li key={index} className="text-sm text-gray-600">• {transport}</li>))}
                    </ul>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><DollarSign size={16} className="text-green-600" />{t("neighborhoods.labels.averageMonthlyPricing")}</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div><div className="text-2xl font-bold text-gray-900">${neighborhood.averagePrice.studio.toLocaleString()}</div><div className="text-sm text-gray-600">{t("neighborhoods.labels.studio")}</div></div>
                      <div><div className="text-2xl font-bold text-gray-900">${neighborhood.averagePrice.oneBed.toLocaleString()}</div><div className="text-sm text-gray-600">{t("neighborhoods.labels.oneBedroom")}</div></div>
                      <div><div className="text-2xl font-bold text-gray-900">${neighborhood.averagePrice.twoBed.toLocaleString()}</div><div className="text-sm text-gray-600">{t("neighborhoods.labels.twoBedroom")}</div></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t("neighborhoods.facts.title")}</h2>
            <p className="text-xl text-gray-600">{t("neighborhoods.facts.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center"><div className="w-16 h-16 bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4"><Clock size={32} /></div><h3 className="text-xl font-bold text-gray-900 mb-2">{t("neighborhoods.facts.businessHours.title")}</h3><p className="text-gray-600">{t("neighborhoods.facts.businessHours.desc")}</p></div>
            <div className="text-center"><div className="w-16 h-16 bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4"><Plane size={32} /></div><h3 className="text-xl font-bold text-gray-900 mb-2">{t("neighborhoods.facts.airport.title")}</h3><p className="text-gray-600">{t("neighborhoods.facts.airport.desc")}</p></div>
            <div className="text-center"><div className="w-16 h-16 bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4"><Train size={32} /></div><h3 className="text-xl font-bold text-gray-900 mb-2">{t("neighborhoods.facts.transit.title")}</h3><p className="text-gray-600">{t("neighborhoods.facts.transit.desc")}</p></div>
            <div className="text-center"><div className="w-16 h-16 bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4"><Coffee size={32} /></div><h3 className="text-xl font-bold text-gray-900 mb-2">{t("neighborhoods.facts.culture.title")}</h3><p className="text-gray-600">{t("neighborhoods.facts.culture.desc")}</p></div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
