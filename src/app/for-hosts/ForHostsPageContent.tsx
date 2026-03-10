"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Container, Section } from "@/components/ui";
import { 
  DollarSign, 
  Shield, 
  Clock,
  TrendingUp,
  CheckCircle2,
  Calculator,
  ArrowRight,
  Loader2,
  Users,
  Award,
  Zap
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { submitInquiry } from "@/lib/inquiry-client";

// Form validation schema
const hostFormSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  propertyAddress: z.string().min(10, "Please enter property address"),
  propertyType: z.enum(["apartment", "condo", "house"]).optional(),
  bedrooms: z.string().min(1, "Please specify number of bedrooms"),
  monthlyRent: z.string().optional(),
  message: z.string().min(10, "Please tell us about your property"),
});

type HostFormData = z.infer<typeof hostFormSchema>;

export default function ForHostsPageContent() {
  const { t } = useI18n();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatorValues, setCalculatorValues] = useState({
    currentRent: 2500,
    occupancyRate: 85
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HostFormData>({
    resolver: zodResolver(hostFormSchema),
  });

  const onSubmit = async (data: HostFormData) => {
    setIsSubmitting(true);
    try {
      await submitInquiry("hosts", data);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
      alert(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const advantages = [
    {
      key: "steadyIncome",
      icon: DollarSign,
      title: "Steady Monthly Income",
      description: "Guaranteed rent payments every month, regardless of occupancy. No more chasing tenants for payments."
    },
    {
      key: "professionalMgmt",
      icon: Shield,
      title: "Professional Management",
      description: "Full-service property management including maintenance, cleaning, guest services, and 24/7 support."
    },
    {
      key: "zeroVacancy",
      icon: TrendingUp,
      title: "Zero Vacancy Risk",
      description: "We handle all bookings and marketing. Your property stays occupied with premium business travelers."
    }
  ];

  const process = [
    { 
      key: "apply", 
      step: "01",
      title: "Submit Application",
      description: "Complete our simple application form with your property details and contact information."
    },
    { 
      key: "evaluate", 
      step: "02",
      title: "Property Evaluation",
      description: "Our team visits your property to assess suitability and suggest any improvements needed."
    },
    { 
      key: "setup", 
      step: "03",
      title: "Setup & Staging", 
      description: "We handle professional photography, listing creation, and any necessary staging or improvements."
    },
    { 
      key: "earning", 
      step: "04",
      title: "Start Earning", 
      description: "Your property goes live on our platform and you start receiving guaranteed monthly payments."
    },
  ];

  const benefits = [
    { key: "noMaintenance", icon: Zap, title: "Hands-Off Management", description: "We handle all maintenance, repairs, and guest issues" },
    { key: "premiumGuests", icon: Users, title: "Quality Guests Only", description: "Vetted business professionals and corporate clients" },
    { key: "guaranteed", icon: Award, title: "Payment Guarantee", description: "Monthly payments guaranteed, even during vacant periods" },
    { key: "flexible", icon: Clock, title: "Flexible Terms", description: "Month-to-month agreements with no long-term commitment" },
  ];

  // Calculate potential earnings
  const potentialEarnings = Math.round(calculatorValues.currentRent * 1.2); // 20% premium
  const annualEarnings = potentialEarnings * 12;
  const traditionalEarnings = Math.round(calculatorValues.currentRent * (calculatorValues.occupancyRate / 100) * 12);
  const additionalIncome = annualEarnings - traditionalEarnings;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section className="relative py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {t("hosts.hero.title", "List Your Property")}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              {t("hosts.hero.subtitle", "Earn guaranteed monthly income with zero vacancy risk. Join Toronto's premium executive housing platform and let us handle everything while you collect steady payments.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-blue-900 px-8 py-4 text-lg font-semibold hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Calculator size={20} />
                {t("hosts.hero.calculateCta", "Calculate Your Earnings")}
              </button>
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-white text-white px-8 py-4 text-lg font-semibold hover:bg-white hover:text-blue-900 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {t("hosts.hero.cta", "Get Started")}
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </Container>
        <div className="absolute -bottom-1 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </Section>

      {/* Advantages Section */}
      <Section className="py-20 bg-gray-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("hosts.advantages.title", "Why Choose StayNeos")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("hosts.advantages.subtitle", "Join hundreds of property owners who've transformed their real estate investments into hassle-free income streams.")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {advantages.map((advantage) => (
              <div key={advantage.key} className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 mb-6 mx-auto">
                  <advantage.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  {advantage.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {advantage.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Income Calculator Section */}
      <Section id="calculator" className="py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {t("hosts.calculator.title", "Calculate Your Potential Earnings")}
              </h2>
              <p className="text-xl text-gray-600">
                {t("hosts.calculator.subtitle", "See how much more you could earn with StayNeos compared to traditional rentals.")}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Calculator Inputs */}
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    {t("hosts.calculator.currentRent", "Current Monthly Rent")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                    <input
                      type="number"
                      value={calculatorValues.currentRent}
                      onChange={(e) => setCalculatorValues(prev => ({ ...prev, currentRent: parseInt(e.target.value) || 0 }))}
                      className="w-full pl-8 pr-4 py-4 text-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="2500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    {t("hosts.calculator.occupancyRate", "Current Occupancy Rate")}
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={calculatorValues.occupancyRate}
                      onChange={(e) => setCalculatorValues(prev => ({ ...prev, occupancyRate: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 appearance-none cursor-pointer slider"
                    />
                    <span className="absolute -top-8 right-0 bg-blue-600 text-white px-2 py-1 text-sm font-medium">
                      {calculatorValues.occupancyRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 border-l-4 border-blue-600">
                <h3 className="text-2xl font-bold text-blue-900 mb-6">Your Earnings Potential</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-gray-700">Traditional Rental (Annual):</span>
                    <span className="text-lg font-semibold">${traditionalEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-gray-700">With StayNeos (Annual):</span>
                    <span className="text-lg font-semibold text-blue-600">${annualEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-blue-900 font-semibold">Additional Annual Income:</span>
                    <span className="text-2xl font-bold text-green-600">+${additionalIncome.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-white p-4 border-l-4 border-green-500">
                  <p className="text-sm text-gray-600">
                    <strong className="text-green-600">Guaranteed:</strong> {t("hosts.calculator.guarantee", "Monthly payments regardless of occupancy, plus professional management included.")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Process Section */}
      <Section className="py-20 bg-gray-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("hosts.process.title", "How It Works")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("hosts.process.subtitle", "Get started in four simple steps and begin earning guaranteed income from your property.")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <div key={step.key} className="relative">
                <div className="bg-white p-8 text-center shadow-lg hover:shadow-xl transition-shadow duration-200 h-full">
                  <div className="w-16 h-16 bg-blue-600 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-6">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-gray-400">
                    <ArrowRight size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Benefits Section */}
      <Section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("hosts.benefits.title", "Additional Benefits")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("hosts.benefits.subtitle", "More reasons why property owners choose StayNeos for their investment properties.")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.key} className="text-center group">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 mx-auto mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                  <benefit.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Contact Form Section */}
      <Section id="contact" className="py-20 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            {!isSubmitted ? (
              <>
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    {t("hosts.form.title", "List Your Property Today")}
                  </h2>
                  <p className="text-xl text-blue-100">
                    {t("hosts.form.subtitle", "Complete the form below and our team will contact you within 24 hours to discuss your property.")}
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 md:p-12 text-gray-900 shadow-2xl">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("hosts.form.firstName", "First Name")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("firstName")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder={t("hosts.form.firstNamePlaceholder", "Enter your first name")}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("hosts.form.lastName", "Last Name")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("lastName")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder={t("hosts.form.lastNamePlaceholder", "Enter your last name")}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("hosts.form.email", "Email Address")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        {...register("email")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder={t("hosts.form.emailPlaceholder", "your@email.com")}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("hosts.form.phone", "Phone Number")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        {...register("phone")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder={t("hosts.form.phonePlaceholder", "+1 (555) 000-0000")}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("hosts.form.propertyAddress", "Property Address")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("propertyAddress")}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder={t("hosts.form.propertyAddressPlaceholder", "Enter property address")}
                    />
                    {errors.propertyAddress && (
                      <p className="text-red-500 text-sm mt-1">{errors.propertyAddress.message}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("hosts.form.propertyType", "Property Type")}
                      </label>
                      <select
                        {...register("propertyType")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        <option value="">{t("hosts.form.selectType", "Select type")}</option>
                        <option value="apartment">{t("hosts.form.apartment", "Apartment")}</option>
                        <option value="condo">{t("hosts.form.condo", "Condo")}</option>
                        <option value="house">{t("hosts.form.house", "House")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("hosts.form.bedrooms", "Bedrooms")} <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register("bedrooms")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        <option value="">{t("hosts.form.selectBedrooms", "Select")}</option>
                        <option value="studio">{t("hosts.form.studio", "Studio")}</option>
                        <option value="1">1 {t("hosts.form.bedroom", "Bedroom")}</option>
                        <option value="2">2 {t("hosts.form.bedrooms", "Bedrooms")}</option>
                        <option value="3">3 {t("hosts.form.bedrooms", "Bedrooms")}</option>
                        <option value="4+">4+ {t("hosts.form.bedrooms", "Bedrooms")}</option>
                      </select>
                      {errors.bedrooms && (
                        <p className="text-red-500 text-sm mt-1">{errors.bedrooms.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("hosts.form.monthlyRent", "Current Monthly Rent")}
                      </label>
                      <input
                        type="number"
                        {...register("monthlyRent")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder={t("hosts.form.rentPlaceholder", "Optional")}
                      />
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("hosts.form.message", "Tell us about your property")} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register("message")}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-vertical"
                      placeholder={t("hosts.form.messagePlaceholder", "Describe your property, current condition, furnishing status, and any questions you have about our program...")}
                    />
                    {errors.message && (
                      <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
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
                        {t("hosts.form.submitting", "Submitting...")}
                      </>
                    ) : (
                      <>
                        {t("hosts.form.submit", "Submit Application")}
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
                <h2 className="text-3xl font-bold mb-4">
                  {t("hosts.form.success.title", "Application Submitted!")}
                </h2>
                <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                  {t("hosts.form.success.message", "Thank you for your interest! Our team will review your application and contact you within 24 hours to discuss next steps and answer any questions you may have.")}
                </p>
              </div>
            )}
          </div>
        </Container>
      </Section>
    </div>
  );
}
