"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Container, Section } from "@/components/ui";
import { 
  Home, 
  Users, 
  UserPlus, 
  CheckCircle2,
  Building2,
  DollarSign,
  Clock,
  Award,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { submitInquiry } from "@/lib/inquiry-client";

// Form validation schema
const agentFormSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  company: z.string().optional(),
  licenseNumber: z.string().optional(),
  partnershipType: z.enum(["property", "tenant", "guest"]).optional(),
  message: z.string().min(10, "Please tell us more about your interest"),
});

type AgentFormData = z.infer<typeof agentFormSchema>;

export default function ForAgentsPageContent() {
  const { t } = useI18n();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AgentFormData>({
    resolver: zodResolver(agentFormSchema),
  });

  const onSubmit = async (data: AgentFormData) => {
    setIsSubmitting(true);
    try {
      await submitInquiry("agents", data);
      setIsSubmitted(true);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error("Submission error:", error);
      alert(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const partnershipModels = [
    {
      key: "property",
      icon: Home,
      commission: "50%",
      commissionPeriodKey: "agents.models.property.period",
    },
    {
      key: "tenant",
      icon: Users,
      commission: "$500",
      commissionPeriodKey: "agents.models.tenant.period",
    },
    {
      key: "guest",
      icon: UserPlus,
      commission: "$200",
      commissionPeriodKey: "agents.models.guest.period",
    },
  ];

  const steps = [
    { key: "register", icon: "01" },
    { key: "evaluate", icon: "02" },
    { key: "review", icon: "03" },
    { key: "commission", icon: "04" },
  ];

  const requirements = [
    { key: "furnished" },
    { key: "location" },
    { key: "quality" },
    { key: "amenities" },
  ];

  const benefits = [
    { key: "commission", icon: DollarSign },
    { key: "support", icon: Award },
    { key: "marketing", icon: Building2 },
    { key: "fast", icon: Clock },
  ];

  return (
    <>
      {/* Hero Section */}
      <Section className="bg-gradient-to-br from-primary via-primary-800 to-primary-900 text-white py-20 md:py-28">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t("agents.hero.title")}
            </h1>
            <p className="text-xl text-white/90 leading-relaxed mb-8">
              {t("agents.hero.subtitle")}
            </p>
            <a
              href="#register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-full font-semibold hover:bg-white/90 transition-colors"
            >
              {t("agents.hero.cta")}
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </Container>
      </Section>

      {/* Partnership Models */}
      <Section className="py-16 md:py-24">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t("agents.models.title")}</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              {t("agents.models.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {partnershipModels.map((model) => {
              const IconComponent = model.icon;
              return (
                <div
                  key={model.key}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-neutral-100 hover:shadow-xl transition-shadow"
                >
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                    <IconComponent className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {t(`agents.models.${model.key}.title`)}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed mb-4">
                    {t(`agents.models.${model.key}.desc`)}
                  </p>
                  <div className="pt-4 border-t border-neutral-100">
                    <p className="text-sm text-neutral-500">{t("agents.models.commission")}</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {model.commission}
                      <span className="text-sm font-normal text-neutral-500 ml-1">
                        / {t(model.commissionPeriodKey)}
                      </span>
                    </p>
                  </div>
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
            <h2 className="text-3xl font-bold mb-4">{t("agents.process.title")}</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              {t("agents.process.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.key} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {t(`agents.process.${step.key}.title`)}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {t(`agents.process.${step.key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Property Requirements */}
      <Section className="py-16 md:py-24">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t("agents.requirements.title")}</h2>
              <p className="text-neutral-600">{t("agents.requirements.subtitle")}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {requirements.map((req) => (
                <div
                  key={req.key}
                  className="flex items-start gap-4 p-6 bg-white rounded-xl border border-neutral-100"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      {t(`agents.requirements.${req.key}.title`)}
                    </h3>
                    <p className="text-neutral-600 text-sm">
                      {t(`agents.requirements.${req.key}.desc`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Why Partner with NEOS */}
      <Section className="bg-neutral-50 py-16 md:py-24">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t("agents.benefits.title")}</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              {t("agents.benefits.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => {
              const IconComponent = benefit.icon;
              return (
                <div key={benefit.key} className="text-center">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t(`agents.benefits.${benefit.key}.title`)}
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    {t(`agents.benefits.${benefit.key}.desc`)}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Registration Form */}
      <Section id="register" className="py-16 md:py-24">
        <Container>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t("agents.form.title")}</h2>
              <p className="text-neutral-600">{t("agents.form.subtitle")}</p>
            </div>

            {isSubmitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">{t("agents.form.successTitle")}</h3>
                <p className="text-neutral-600 mb-6">{t("agents.form.successMessage")}</p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t("agents.form.submitAnother")}
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white rounded-2xl p-8 shadow-lg border border-neutral-100"
              >
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {t("agents.form.firstName")} *
                    </label>
                    <input
                      {...register("firstName")}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder={t("agents.form.firstNamePlaceholder")}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {t("agents.form.lastName")} *
                    </label>
                    <input
                      {...register("lastName")}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder={t("agents.form.lastNamePlaceholder")}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {t("agents.form.email")} *
                    </label>
                    <input
                      {...register("email")}
                      type="email"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder={t("agents.form.emailPlaceholder")}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {t("agents.form.phone")} *
                    </label>
                    <input
                      {...register("phone")}
                      type="tel"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder={t("agents.form.phonePlaceholder")}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {t("agents.form.company")}
                    </label>
                    <input
                      {...register("company")}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder={t("agents.form.companyPlaceholder")}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {t("agents.form.license")}
                    </label>
                    <input
                      {...register("licenseNumber")}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder={t("agents.form.licensePlaceholder")}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    {t("agents.form.partnershipType")} *
                  </label>
                  <select
                    {...register("partnershipType")}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="">{t("agents.form.selectType")}</option>
                    <option value="property">{t("agents.models.property.title")}</option>
                    <option value="tenant">{t("agents.models.tenant.title")}</option>
                    <option value="guest">{t("agents.models.guest.title")}</option>
                  </select>
                  {errors.partnershipType && (
                    <p className="mt-1 text-sm text-red-600">{errors.partnershipType.message}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    {t("agents.form.message")} *
                  </label>
                  <textarea
                    {...register("message")}
                    rows={4}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                    placeholder={t("agents.form.messagePlaceholder")}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <p className="text-sm text-neutral-500 mb-6">
                  {t("agents.form.privacyNote")}
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t("agents.form.submitting")}
                    </>
                  ) : (
                    t("agents.form.submit")
                  )}
                </button>
              </form>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
