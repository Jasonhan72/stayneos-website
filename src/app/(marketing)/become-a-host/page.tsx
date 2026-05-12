"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import {
  Building2,
  TrendingUp,
  ShieldCheck,
  Clock,
  Smartphone,
  DollarSign,
  Check,
} from "lucide-react";

const BENEFITS = [
  {
    icon: TrendingUp,
    titleEn: "Maximize your income",
    titleZh: "最大化租金收入",
    titleFr: "Maximisez vos revenus",
    descEn: "Average 30% higher revenue compared to traditional long-term rentals.",
    descZh: "相比传统长租，平均收入提升 30%。",
    descFr: "En moyenne 30 % de revenus en plus par rapport à la location longue durée.",
  },
  {
    icon: ShieldCheck,
    titleEn: "Property protection",
    titleZh: "物业保障",
    titleFr: "Protection du bien",
    descEn: "Comprehensive insurance coverage and guest screening included.",
    descZh: "包含全面保险和房客筛选。",
    descFr: "Assurance complète et sélection des voyageurs incluse.",
  },
  {
    icon: Clock,
    titleEn: "Hassle-free management",
    titleZh: "省心管理",
    titleFr: "Gestion sans tracas",
    descEn: "Professional cleaning, maintenance, and guest communication handled.",
    descZh: "专业清洁、维护和房客沟通全部由我们处理。",
    descFr: "Nettoyage professionnel, entretien et communication gérés.",
  },
  {
    icon: Building2,
    titleEn: "Professional photography",
    titleZh: "专业摄影",
    titleFr: "Photographie professionnelle",
    descEn: "Complimentary photo shoot and staging consultation for your listing.",
    descZh: "免费拍摄和摆盘咨询。",
    descFr: "Séance photo et conseils en home staging offerts.",
  },
  {
    icon: DollarSign,
    titleEn: "Transparent pricing",
    titleZh: "透明定价",
    titleFr: "Tarification transparente",
    descEn: "Clear fee structure with no hidden charges. Know exactly what you earn.",
    descZh: "清晰的费用结构，无隐藏费用。",
    descFr: "Structure tarifaire claire, sans frais cachés.",
  },
  {
    icon: Smartphone,
    titleEn: "Real-time dashboard",
    titleZh: "实时数据面板",
    titleFr: "Tableau de bord en temps réel",
    descEn: "Track bookings, earnings, and occupancy from anywhere.",
    descZh: "随时查看预订、收入和入住率。",
    descFr: "Suivez les réservations, revenus et taux d'occupation.",
  },
];

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  city: string;
  bedrooms: string;
  message: string;
};

const INITIAL: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  propertyAddress: "",
  city: "Toronto",
  bedrooms: "",
  message: "",
};

export default function BecomeAHostPage() {
  const { locale } = useI18n();
  const L = (z: string, e: string, f: string) =>
    locale === "zh" ? z : locale === "fr" ? f : e;

  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "hosts",
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone,
          subject: `Host application — ${form.propertyAddress || "No address"} (${form.bedrooms || "?"} BR)`,
          message: form.message || `New host application for property at ${form.propertyAddress || "unknown address"} in ${form.city}. Bedrooms: ${form.bedrooms || "?"}`,
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <main className="min-h-[70vh] bg-neutral-50 px-4 py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-emerald-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <Check className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            {L("申请已提交！", "Application submitted!", "Candidature envoyée !")}
          </h1>
          <p className="mt-3 text-neutral-600">
            {L("我们的团队会在 1-2 个工作日内与您联系。", "Our team will follow up within 1–2 business days.", "Notre équipe vous contactera sous 1 à 2 jours ouvrés.")}
          </p>
          <Link href="/" className="mt-6 inline-flex rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white">
            {L("返回首页", "Back to home", "Retour à l'accueil")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {L("成为 NEOS 房东", "Become a NEOS host", "Devenez hôte NEOS")}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {L("将您的物业转换为高端短租公寓。NEOS 负责运营、营销和房客体验，您坐享租金收入。", "Turn your property into a premium short-term rental. NEOS handles operations, marketing, and guest experience while you earn.", "Transformez votre bien en location premium. NEOS gère les opérations et le marketing.")}
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">
            {L("为什么选择 NEOS？", "Why NEOS?", "Pourquoi NEOS ?")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.titleEn} className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100">
                    <Icon className="w-6 h-6 text-neutral-700" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-2">
                    {L(b.titleZh, b.titleEn, b.titleFr)}
                  </h3>
                  <p className="text-sm text-neutral-600">{L(b.descZh, b.descEn, b.descFr)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Application form */}
      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-2">
            {L("申请成为房东", "Apply to become a host", "Postuler comme hôte")}
          </h2>
          <p className="text-neutral-600 text-center mb-10">
            {L("填写以下信息，我们的团队将评估您的物业并联系您。", "Tell us about your property and we'll get back to you.", "Parlez-nous de votre bien et nous vous répondrons.")}
          </p>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  {L("名", "First name", "Prénom")} *
                </label>
                <input
                  required
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  placeholder={L("名", "First name", "Prénom")}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  {L("姓", "Last name", "Nom")} *
                </label>
                <input
                  required
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  placeholder={L("姓", "Last name", "Nom")}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  {L("邮箱", "Email", "E-mail")} *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  {L("电话", "Phone", "Téléphone")}
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                  placeholder="+1 (xxx) xxx-xxxx"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                {L("物业地址", "Property address", "Adresse du bien")} *
              </label>
              <input
                required
                value={form.propertyAddress}
                onChange={(e) => update("propertyAddress", e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                placeholder={L("例如: 55 Cooper St, Toronto", "e.g. 55 Cooper St, Toronto", "ex: 55 Cooper St, Toronto")}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  {L("城市", "City", "Ville")} *
                </label>
                <select
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900 bg-white"
                >
                  <option>Toronto</option>
                  <option>Vancouver</option>
                  <option>Montreal</option>
                  <option>Calgary</option>
                  <option>Ottawa</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  {L("卧室数量", "Bedrooms", "Chambres")} *
                </label>
                <select
                  required
                  value={form.bedrooms}
                  onChange={(e) => update("bedrooms", e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900 bg-white"
                >
                  <option value="">{L("选择", "Select", "Choisir")}</option>
                  <option value="0">Studio</option>
                  <option value="1">1 BR</option>
                  <option value="2">2 BR</option>
                  <option value="3">3 BR</option>
                  <option value="4">4+ BR</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                {L("备注（可选）", "Notes (optional)", "Notes (optionnel)")}
              </label>
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900 resize-none"
                placeholder={L("描述物业现状、装修情况等", "Describe your property, furnishings, and current status", "Décrivez votre bien, son état et son équipement")}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-neutral-900 py-4 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors"
            >
              {submitting
                ? L("提交中…", "Submitting…", "Envoi…")
                : L("提交申请", "Submit application", "Envoyer la candidature")}
            </button>
          </form>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-semibold text-center mb-10">
            {L("常见问题", "Frequently asked questions", "FAQ")}
          </h2>
          <div className="space-y-4">
            {[
              {
                qEn: "How much can I earn?",
                qZh: "我能赚多少钱？",
                qFr: "Combien puis-je gagner ?",
                aEn: "Hosts on our platform earn 20-40% more compared to traditional long-term rentals. Your actual earnings depend on location, unit size, and seasonality.",
                aZh: "具体收入取决于位置、房型和季节，但通常比传统长租高 20-40%。",
                aFr: "Les hôtes gagnent 20 à 40 % de plus qu'en location longue durée. Le montant dépend de l'emplacement et de la saison.",
              },
              {
                qEn: "What types of properties do you accept?",
                qZh: "接受什么类型的物业？",
                qFr: "Quels types de biens acceptez-vous ?",
                aEn: "Apartments, condos, and houses in downtown Toronto and surrounding areas. Minimum 1 bedroom, fully furnished preferred.",
                aZh: "公寓、Condo、独立屋，位于多伦多市中心及周边。至少 1 室，带家具优先。",
                aFr: "Appartements, condos et maisons au centre-ville de Toronto et environs. Minimum 1 chambre, meublé de préférence.",
              },
              {
                qEn: "Who handles guest communication?",
                qZh: "谁负责与房客沟通？",
                qFr: "Qui gère la communication avec les voyageurs ?",
                aEn: "Our concierge team handles all guest communication, check-ins, and support so you never have to.",
                aZh: "我们的客服团队负责所有房客沟通、入住安排和售后支持。",
                aFr: "Notre équipe conciergerie gère toute la communication avec les voyageurs.",
              },
              {
                qEn: "Is there a minimum commitment?",
                qZh: "有最低合作期限吗？",
                qFr: "Y a-t-il un engagement minimum ?",
                aEn: "We recommend a minimum 6-month partnership, but we review on a case-by-case basis.",
                aZh: "建议最低 6 个月合作期，但我们会根据具体情况评估。",
                aFr: "Nous recommandons un minimum de 6 mois, mais nous étudions chaque cas.",
              },
              {
                qEn: "What fees does NEOS charge?",
                qZh: "NEOS 收取什么费用？",
                qFr: "Quels frais NEOS facture-t-il ?",
                aEn: "Our standard management fee is 15-25% of booking revenue, covering marketing, guest screening, cleaning, and maintenance.",
                aZh: "管理费为预订收入的 15-25%，包含营销、筛选、清洁和维护。",
                aFr: "Frais de gestion de 15 à 25 % des réservations, incluant marketing, sélection, nettoyage et entretien.",
              },
            ].map((faq, i) => (
              <details key={i} className="group rounded-2xl border border-neutral-200 p-5">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-neutral-900">
                  {L(faq.qZh, faq.qEn, faq.qFr)}
                  <span className="text-neutral-400 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="mt-3 text-sm text-neutral-600 leading-relaxed">{L(faq.aZh, faq.aEn, faq.aFr)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
