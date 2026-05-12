"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Container, Section } from "@/components/ui";
import { Users, MapPin, Home, Calendar, ArrowRight, Loader2, DollarSign, HeartPulse, GraduationCap, Stethoscope } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { submitInquiry } from "@/lib/inquiry-client";

const formSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  university: z.string().min(2),
  program: z.string().optional(),
  moveInDate: z.string().min(1),
  duration: z.string().optional(),
  budget: z.string().optional(),
  roomType: z.enum(["studio", "1bed"]).optional(),
  message: z.string().min(10),
});

type FormData = z.infer<typeof formSchema>;

export default function ForStudentsPageContent() {
  const { t } = useI18n();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await submitInquiry("students", data);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const audiences = [
    { icon: GraduationCap, text: t("students.audience.1") },
    { icon: Stethoscope, text: t("students.audience.2") },
    { icon: Users, text: t("students.audience.3") },
    { icon: Calendar, text: t("students.audience.4") },
  ];

  return (
    <div className="min-h-screen">
      <Section className="relative py-24 bg-gradient-to-br from-purple-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">{t("students.hero.title")}</h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">{t("students.hero.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white text-blue-900 px-8 py-4 text-lg font-semibold hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2">
                <DollarSign size={20} />{t("students.hero.pricingCta")}
              </button>
              <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="border-2 border-white text-white px-8 py-4 text-lg font-semibold hover:bg-white hover:text-blue-900 transition-all duration-200 flex items-center justify-center gap-2">
                {t("students.hero.cta")}<ArrowRight size={20} />
              </button>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="py-20 bg-gray-50">
        <Container>
          <h2 className="text-4xl font-bold text-center mb-12">{t("students.advantages.title")}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {audiences.map((a, idx) => (
              <div key={idx} className="bg-white p-6 shadow">
                <a.icon className="text-blue-600 mb-4" />
                <p className="text-gray-700">{a.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="pricing" className="py-20 bg-white">
        <Container>
          <h2 className="text-4xl font-bold text-center mb-6">{t("students.pricing.title")}</h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-8">{t("students.pricing.subtitle")}</p>
          <div className="max-w-xl mx-auto bg-gray-50 p-8 border-l-4 border-blue-600">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t("students.pricing.real.title")}</h3>
            <p className="text-3xl font-bold text-blue-700 mb-4">$5,500 - $10,000 / {t("students.pricing.month")}</p>
            <ul className="space-y-2 text-gray-700">
              <li>• {t("students.pricing.real.1")}</li>
              <li>• {t("students.pricing.real.2")}</li>
              <li>• {t("students.pricing.real.3")}</li>
            </ul>
          </div>
        </Container>
      </Section>

      <Section className="py-20 bg-blue-50">
        <Container>
          <h2 className="text-4xl font-bold text-center mb-6">{t("students.location.title")}</h2>
          <p className="text-center text-gray-700 max-w-4xl mx-auto mb-10">{t("students.location.subtitle")}</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 shadow"><MapPin className="text-blue-600 mb-3" /><p>{t("students.location.point1")}</p></div>
            <div className="bg-white p-6 shadow"><HeartPulse className="text-blue-600 mb-3" /><p>{t("students.location.point2")}</p></div>
            <div className="bg-white p-6 shadow"><Home className="text-blue-600 mb-3" /><p>{t("students.location.point3")}</p></div>
            <div className="bg-white p-6 shadow"><Calendar className="text-blue-600 mb-3" /><p>{t("students.location.point4")}</p></div>
          </div>
        </Container>
      </Section>

      <Section id="contact" className="py-20 bg-white">
        <Container>
          {isSubmitted ? (
            <div className="max-w-2xl mx-auto text-center bg-green-50 border border-green-200 p-8"><h3 className="text-2xl font-bold text-green-800 mb-3">{t("students.form.success.title")}</h3><p className="text-green-700">{t("students.form.success.message")}</p></div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto bg-gray-50 p-8 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input {...register("firstName")} placeholder={t("students.form.firstName")} className="px-4 py-3 border" />
                <input {...register("lastName")} placeholder={t("students.form.lastName")} className="px-4 py-3 border" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <input {...register("email")} placeholder={t("students.form.email")} className="px-4 py-3 border" />
                <input {...register("phone")} placeholder={t("students.form.phone")} className="px-4 py-3 border" />
              </div>
              <input {...register("university")} placeholder={t("students.form.university")} className="w-full px-4 py-3 border" />
              <input type="date" {...register("moveInDate")} className="w-full px-4 py-3 border" />
              <textarea {...register("message")} rows={5} placeholder={t("students.form.message")} className="w-full px-4 py-3 border" />
              {(errors.firstName || errors.lastName || errors.email || errors.phone || errors.university || errors.moveInDate || errors.message) && (
                <p className="text-sm text-red-600">{t("students.form.validation")}</p>
              )}
              <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 disabled:opacity-60">
                {isSubmitting ? <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={16} />{t("students.form.submitting")}</span> : t("students.form.submit")}
              </button>
            </form>
          )}
        </Container>
      </Section>
    </div>
  );
}
