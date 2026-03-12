"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Container, Section } from "@/components/ui";
import { 
  Building2, 
  Users, 
  Clock,
  Headphones,
  TrendingDown,
  CheckCircle2,
  ArrowRight,
  Loader2,
  BarChart3,
  Globe,
  Award,
  Calendar,
  CreditCard,
  Phone,
  ShieldCheck,
  FileText,
  Lock,
  Timer
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { submitInquiry } from "@/lib/inquiry-client";

// Form validation schema
const businessFormSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  jobTitle: z.string().min(2, "Job title is required"),
  accommodationType: z.enum(["individual", "group", "long-term", "project-team"]).optional(),
  numberOfUnits: z.string().optional(),
  duration: z.string().optional(),
  budget: z.string().optional(),
  requirements: z.string().min(20, "Please describe your requirements"),
});

type BusinessFormData = z.infer<typeof businessFormSchema>;

export default function ForBusinessPageContent() {
  const { t } = useI18n();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessFormSchema),
  });

  const onSubmit = async (data: BusinessFormData) => {
    setIsSubmitting(true);
    try {
      await submitInquiry("business", data);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
      alert(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };



  const trustSignals = [
    { key: 'insured', icon: ShieldCheck, text: t('business.trust.insured') },
    { key: 'invoicing', icon: FileText, text: t('business.trust.invoicing') },
    { key: 'secure', icon: Lock, text: t('business.trust.secure') },
    { key: 'response', icon: Timer, text: t('business.trust.response') },
  ];

  const solutions = [
    {
      key: "individual",
      icon: Users,
      title: "Business Travel",
      description: "Individual accommodations for executives and business travelers with premium amenities and 24/7 concierge support.",
      features: ["Executive suites", "Airport transfers", "Concierge service", "Flexible check-in"]
    },
    {
      key: "relocation",
      icon: Building2,
      title: "Employee Relocation",
      description: "Temporary housing for relocating employees with move-in ready apartments and local orientation support.",
      features: ["Fully furnished", "Utilities included", "Local orientation", "Flexible terms"]
    },
    {
      key: "group",
      icon: Globe,
      title: "Group Accommodations",
      description: "Multiple units for training programs, conferences, or project teams with centralized billing and coordination.",
      features: ["Bulk booking discounts", "Team coordination", "Centralized billing", "Meeting spaces"]
    },
    {
      key: "longterm",
      icon: Calendar,
      title: "Long-term Projects",
      description: "Extended stays for project teams or extended assignments with cost-effective monthly rates and dedicated support.",
      features: ["Extended stay rates", "Project coordination", "Regular housekeeping", "Dedicated account manager"]
    }
  ];

  const advantages = [
    {
      key: "flexible",
      icon: Clock,
      title: "Flexible Terms",
      description: "Month-to-month agreements with no long-term commitments. Scale up or down based on your business needs.",
      stat: "30-day minimum"
    },
    {
      key: "cost",
      icon: TrendingDown,
      title: "Cost Savings",
      description: "Save 30-40% compared to hotels for extended stays. All-inclusive pricing with no hidden fees.",
      stat: "Up to 40% savings"
    },
    {
      key: "manager",
      icon: Headphones,
      title: "Dedicated Account Manager",
      description: "Personal account manager for seamless booking, billing, and ongoing support throughout your partnership.",
      stat: "24/7 support"
    },
    {
      key: "billing",
      icon: CreditCard,
      title: "Streamlined Billing",
      description: "Consolidated monthly invoicing with detailed reporting and expense tracking for easy reconciliation.",
      stat: "Single invoice"
    }
  ];

  const caseStudies = [
    {
      company: "Tech Startup",
      label: "Typical Scenario",
      challenge: "Needed 15 units for 6-month project team relocation to Toronto",
      solution: "Provided furnished apartments in downtown core with meeting spaces",
      result: "Saved $180,000 compared to hotels while improving team productivity",
      savings: "60%"
    },
    {
      company: "Consulting Firm",
      label: "Typical Scenario",
      challenge: "Executive travel program with unpredictable durations",
      solution: "Flexible booking system with premium downtown suites",
      result: "Reduced accommodation costs by 35% with improved executive satisfaction",
      savings: "35%"
    },
    {
      company: "Manufacturing Corp",
      label: "Typical Scenario",
      challenge: "Employee relocation program for new Toronto office",
      solution: "Staged move-in process with temporary housing for 50+ employees",
      result: "Smooth transition with 95% employee satisfaction rating",
      savings: "45%"
    }
  ];

  const features = [
    { key: "booking", icon: Calendar, title: "Easy Booking", description: "Online platform for easy reservations and modifications" },
    { key: "reporting", icon: BarChart3, title: "Expense Reporting", description: "Detailed reporting for expense management and budgeting" },
    { key: "support", icon: Phone, title: "24/7 Support", description: "Round-the-clock support for urgent needs and modifications" },
    { key: "quality", icon: Award, title: "Quality Guarantee", description: "Vetted properties meeting corporate standards" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section className="relative py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {t("business.hero.title", "Corporate Housing Solutions")}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              {t("business.hero.subtitle", "Streamlined accommodation solutions for business travelers, employee relocations, and project teams. Save costs, reduce complexity, and provide premium housing for your organization.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-blue-900 px-8 py-4 text-lg font-semibold hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {t("business.hero.ctaQuote", "Request a Quote")}
                <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-white text-white px-8 py-4 text-lg font-semibold hover:bg-white hover:text-blue-900 transition-all duration-200"
              >
                {t("business.hero.ctaBrowse", "Explore Solutions")}
              </button>
            </div>
          </div>
        </Container>
        <div className="absolute -bottom-1 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </Section>



      <Section className="py-10 bg-white border-b border-neutral-200">
        <Container>
          <div className="grid md:grid-cols-2 gap-4">
            {trustSignals.map((item) => (
              <div key={item.key} className="flex items-start gap-3 bg-neutral-50 border border-neutral-200 p-4">
                <item.icon className="w-5 h-5 text-blue-700 mt-0.5" />
                <p className="text-neutral-800 font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Solutions Section */}
      <Section id="solutions" className="py-20 bg-gray-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("business.solutions.title", "Solutions for Every Need")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("business.solutions.subtitle", "From individual business travelers to large project teams, we have the perfect accommodation solution for your organization.")}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {solutions.map((solution) => (
              <div key={solution.key} className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 mr-4">
                    <solution.icon size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {solution.title}
                  </h3>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {solution.description}
                </p>
                <ul className="space-y-2">
                  {solution.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Advantages Section */}
      <Section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("business.advantages.title", "Why Choose StayNeos for Business")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("business.advantages.subtitle", "Transform your corporate accommodation strategy with our comprehensive business solutions.")}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {advantages.map((advantage) => (
              <div key={advantage.key} className="flex items-start gap-6">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 flex-shrink-0">
                  <advantage.icon size={32} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {advantage.title}
                    </h3>
                    <span className="bg-green-100 text-green-800 px-3 py-1 text-sm font-semibold">
                      {advantage.stat}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {advantage.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Case Studies Section */}
      <Section className="py-20 bg-blue-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("business.cases.title", "Success Stories")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("business.cases.subtitle", "See how leading companies have transformed their accommodation strategies with StayNeos.")}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <div key={index} className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900"><span>{study.company}</span></h3>
                  <span className="bg-green-100 text-green-800 px-3 py-1 text-sm font-bold">
                    {study.savings} saved
                  </span>
                </div>
                
                <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold mb-3">{study.label || t("business.cases.typical", "Typical Scenario")}</p>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Challenge:</h4>
                    <p className="text-sm text-gray-600">{study.challenge}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Solution:</h4>
                    <p className="text-sm text-gray-600">{study.solution}</p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-blue-600 mb-1">Result:</h4>
                    <p className="text-sm text-gray-900 font-medium">{study.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Features Section */}
      <Section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("business.features.title", "Business-First Features")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("business.features.subtitle", "Enterprise-grade features designed to simplify corporate accommodation management.")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.key} className="text-center group">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 mx-auto mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Stats Section */}
      <Section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <Container>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">—</div>
              <div className="text-blue-100">{t("business.stats.companies", "Operational Support") }</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">—</div>
              <div className="text-blue-100">{t("business.stats.stays", "Flexible Portfolio") }</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">30-40%</div>
              <div className="text-blue-100">{t("business.stats.savings", "Average Savings vs Hotels")}</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">{t("business.stats.satisfaction", "Dedicated Account Support") }</div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Contact Form Section */}
      <Section id="contact" className="py-20 bg-gray-50">
        <Container>
          <div className="max-w-4xl mx-auto">
            {!isSubmitted ? (
              <>
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    {t("business.form.title", "Request a Custom Quote")}
                  </h2>
                  <p className="text-xl text-gray-600">
                    {t("business.form.subtitle", "Tell us about your requirements and our team will create a customized solution for your organization.")}
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 md:p-12 shadow-2xl">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("business.form.companyName", "Company Name")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("companyName")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder={t("business.form.companyNamePlaceholder", "Your company name")}
                      />
                      {errors.companyName && (
                        <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("business.form.contactName", "Contact Name")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("contactName")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder={t("business.form.contactNamePlaceholder", "Your full name")}
                      />
                      {errors.contactName && (
                        <p className="text-red-500 text-sm mt-1">{errors.contactName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("business.form.email", "Email Address")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        {...register("email")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder={t("business.form.emailPlaceholder", "your@company.com")}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("business.form.phone", "Phone Number")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        {...register("phone")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder={t("business.form.phonePlaceholder", "+1 (555) 000-0000")}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("business.form.jobTitle", "Job Title")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("jobTitle")}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder={t("business.form.jobTitlePlaceholder", "Your job title")}
                    />
                    {errors.jobTitle && (
                      <p className="text-red-500 text-sm mt-1">{errors.jobTitle.message}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("business.form.accommodationType", "Accommodation Type")}
                      </label>
                      <select
                        {...register("accommodationType")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        <option value="">{t("business.form.selectType", "Select type")}</option>
                        <option value="individual">{t("business.form.individual", "Individual Travel")}</option>
                        <option value="group">{t("business.form.group", "Group Accommodation")}</option>
                        <option value="long-term">{t("business.form.longTerm", "Long-term Stay")}</option>
                        <option value="project-team">{t("business.form.projectTeam", "Project Team")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("business.form.numberOfUnits", "Number of Units")}
                      </label>
                      <select
                        {...register("numberOfUnits")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        <option value="">{t("business.form.selectUnits", "Select")}</option>
                        <option value="1">1 {t("business.form.unit", "Unit")}</option>
                        <option value="2-5">2-5 {t("business.form.units", "Units")}</option>
                        <option value="6-10">6-10 {t("business.form.units", "Units")}</option>
                        <option value="11-20">11-20 {t("business.form.units", "Units")}</option>
                        <option value="20+">20+ {t("business.form.units", "Units")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("business.form.duration", "Expected Duration")}
                      </label>
                      <select
                        {...register("duration")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        <option value="">{t("business.form.selectDuration", "Select")}</option>
                        <option value="1-3months">1-3 {t("business.form.months", "Months")}</option>
                        <option value="3-6months">3-6 {t("business.form.months", "Months")}</option>
                        <option value="6-12months">6-12 {t("business.form.months", "Months")}</option>
                        <option value="1year+">1+ {t("business.form.years", "Years")}</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("business.form.budget", "Monthly Budget Range")}
                    </label>
                    <select
                      {...register("budget")}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value="">{t("business.form.selectBudget", "Select budget range")}</option>
                      <option value="under-5k">{t("business.form.budgetOptions.under5k", "Under $5,000")}</option>
                      <option value="5k-15k">{t("business.form.budgetOptions.5kTo15k", "$5,000 - $15,000")}</option>
                      <option value="15k-30k">{t("business.form.budgetOptions.15kTo30k", "$15,000 - $30,000")}</option>
                      <option value="30k-50k">{t("business.form.budgetOptions.30kTo50k", "$30,000 - $50,000")}</option>
                      <option value="50k+">{t("business.form.budgetOptions.50kPlus", "$50,000+")}</option>
                    </select>
                  </div>

                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("business.form.requirements", "Specific Requirements")} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register("requirements")}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-vertical"
                      placeholder={t("business.form.requirementsPlaceholder", "Please describe your accommodation needs, preferred locations, special requirements, timeline, and any other details that would help us create the perfect solution for your organization...")}
                    />
                    {errors.requirements && (
                      <p className="text-red-500 text-sm mt-1">{errors.requirements.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-4 px-8 text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        {t("business.form.submitting", "Submitting...")}
                      </>
                    ) : (
                      <>
                        {t("business.form.submit", "Request Quote")}
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {t("business.form.success.title", "Quote Request Submitted!")}
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  {t("business.form.success.message", "Thank you for your interest! Our business development team will analyze your requirements and contact you within 24 hours with a customized proposal and pricing.")}
                </p>
              </div>
            )}
          </div>
        </Container>
      </Section>
    </div>
  );
}
