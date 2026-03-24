"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Container, Section } from "@/components/ui";
import { 
  Calendar, 
  TrendingDown, 
  CheckCircle2, 
  ArrowRight,
  Loader2,
  Home,
  Shield,
  Users,
  Building2,
  Zap,
  Heart,
  MapPin,
  Star
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { submitInquiry } from "@/lib/inquiry-client";

// Form validation schema
const longTermFormSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  moveInDate: z.string().min(1, "Move-in date is required"),
  leaseDuration: z.enum(["3months", "6months", "12months", "18months"]).optional(),
  propertyType: z.enum(["studio", "1bed", "2bed", "3bed"]).optional(),
  budget: z.string().optional(),
  location: z.string().optional(),
  message: z.string().min(10, "Please tell us about your requirements"),
});

type LongTermFormData = z.infer<typeof longTermFormSchema>;

export default function LongTermPageContent() {
  const { t } = useI18n();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<string>("6months");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LongTermFormData>({
    resolver: zodResolver(longTermFormSchema),
  });

  const onSubmit = async (data: LongTermFormData) => {
    setIsSubmitting(true);
    try {
      await submitInquiry("long_term", data);
      setIsSubmitted(true);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error("Submission error:", error);
      alert(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pricingTiers = [
    {
      duration: "3 Months",
      key: "3months",
      discount: "10%",
      monthlyPrice: 3150,
      originalPrice: 3500,
      totalSavings: 1050,
      features: [
        "10% discount on monthly rate",
        "Flexible move-out with 30 days notice",
        "Perfect for short assignments",
        "All utilities included"
      ],
      popular: false
    },
    {
      duration: "6 Months",
      key: "6months", 
      discount: "20%",
      monthlyPrice: 2800,
      originalPrice: 3500,
      totalSavings: 4200,
      features: [
        "20% discount on monthly rate",
        "Mid-lease modification options",
        "Ideal for project assignments",
        "Priority customer support"
      ],
      popular: true
    },
    {
      duration: "12 Months",
      key: "12months",
      discount: "30%",
      monthlyPrice: 2450,
      originalPrice: 3500,
      totalSavings: 12600,
      features: [
        "30% discount on monthly rate",
        "Maximum savings & stability",
        "Annual lease renewal options",
        "Dedicated account manager"
      ],
      popular: false
    }
  ];

  const advantages = [
    {
      key: "savings",
      icon: TrendingDown,
      title: "Significant Savings",
      description: "Save up to 30% on monthly rates compared to short-term stays. The longer you stay, the more you save.",
      benefit: "Up to $12,600 annual savings"
    },
    {
      key: "stability",
      icon: Home,
      title: "Housing Stability",
      description: "Secure your housing for months ahead with locked-in rates and guaranteed availability.",
      benefit: "Rate protection guaranteed"
    },
    {
      key: "flexibility",
      icon: Calendar,
      title: "Flexible Terms",
      description: "Choose 3, 6, or 12-month terms with options to extend or modify based on your evolving needs.",
      benefit: "Easy lease modifications"
    },
    {
      key: "support",
      icon: Shield,
      title: "Premium Support",
      description: "Dedicated account management and priority support for all long-term residents.",
      benefit: "VIP customer service"
    }
  ];

  const testimonials = [
    {
      name: "David Kim",
      role: "Project Manager",
      company: "Tech Consulting Firm",
      duration: "12-month lease",
      quote: "The 12-month lease saved our company over $10,000 compared to hotels. The dedicated account manager made everything seamless.",
      savings: "$10,000+",
      rating: 5
    },
    {
      name: "Sarah Thompson",
      role: "Marketing Director", 
      company: "Financial Services",
      duration: "6-month lease",
      quote: "Perfect solution for our Toronto expansion. The flexibility to extend and modify the lease was exactly what we needed.",
      savings: "$4,200",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Software Engineer",
      company: "Remote Worker",
      duration: "6-month lease",
      quote: "Working remotely from Toronto for 6 months was amazing. The long-term rate made it affordable and the apartment had everything I needed.",
      savings: "$3,600",
      rating: 5
    }
  ];

  const benefits = [
    { key: "utilities", icon: Zap, title: "All Bills Included", description: "Electricity, water, gas, internet - everything covered" },
    { key: "furnished", icon: Home, title: "Fully Furnished", description: "Quality furniture, appliances, and housewares included" },
    { key: "maintenance", icon: Shield, title: "24/7 Maintenance", description: "Rapid response for any issues or repairs needed" },
    { key: "concierge", icon: Users, title: "Concierge Service", description: "Personal assistance with local services and needs" },
    { key: "cleaning", icon: Star, title: "Regular Cleaning", description: "Weekly or bi-weekly cleaning service available" },
    { key: "location", icon: MapPin, title: "Prime Locations", description: "Central Toronto locations with transit access" }
  ];

  const useCases = [
    {
      title: "Corporate Projects",
      description: "Perfect for extended business assignments, project teams, and temporary office setups.",
      icon: Building2,
      duration: "3-12 months typical"
    },
    {
      title: "Relocation Bridge",
      description: "Temporary housing while searching for permanent residence or awaiting property purchase.",
      icon: Home,
      duration: "3-6 months typical"
    },
    {
      title: "Remote Work",
      description: "Flexible living for digital nomads, remote workers, and location-independent professionals.",
      icon: Users,
      duration: "6-12 months typical"
    },
    {
      title: "Life Transitions",
      description: "Temporary housing during divorce, job changes, or other major life transitions.",
      icon: Heart,
      duration: "3-6 months typical"
    }
  ];

  const getCurrentPricing = () => {
    return pricingTiers.find(tier => tier.key === selectedDuration) || pricingTiers[1];
  };

  const currentTier = getCurrentPricing();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section className="relative py-24 bg-gradient-to-br from-green-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {t("longterm.hero.title", "Long-Term Rental Discounts")}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              {t("longterm.hero.subtitle", "Save significantly on extended stays with our flexible long-term lease options. Choose 3, 6, or 12-month terms and enjoy up to 30% off monthly rates in Toronto's premium furnished apartments.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-blue-900 px-8 py-4 text-lg font-semibold hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <TrendingDown size={20} />
                {t("longterm.hero.savingsCta", "See Savings")}
              </button>
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-white text-white px-8 py-4 text-lg font-semibold hover:bg-white hover:text-blue-900 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {t("longterm.hero.cta", "Get Quote")}
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </Container>
        <div className="absolute -bottom-1 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </Section>

      {/* Pricing Comparison Section */}
      <Section id="pricing" className="py-20 bg-gray-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("longterm.pricing.title", "Choose Your Savings Level")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("longterm.pricing.subtitle", "The longer you stay, the more you save. All options include the same premium amenities and services.")}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier) => (
              <div key={tier.key} className={`relative bg-white shadow-xl hover:shadow-2xl transition-all duration-200 ${tier.popular ? 'border-2 border-green-500 scale-105' : 'border border-gray-200'}`}>
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-6 py-2 font-semibold text-sm">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {tier.duration}
                    </h3>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="bg-green-100 text-green-800 px-3 py-1 font-bold text-lg">
                        {tier.discount} OFF
                      </span>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-3xl text-gray-400 line-through">
                          ${tier.originalPrice.toLocaleString()}
                        </span>
                        <span className="text-4xl font-bold text-gray-900">
                          ${tier.monthlyPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-gray-600">per month</div>
                    </div>
                    <div className="bg-green-50 p-3 border-l-4 border-green-500">
                      <div className="font-semibold text-green-800">Total Savings</div>
                      <div className="text-2xl font-bold text-green-600">
                        ${tier.totalSavings.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    onClick={() => {
                      setSelectedDuration(tier.key);
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full py-3 px-6 font-semibold transition-colors duration-200 ${
                      tier.popular 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {t("longterm.pricing.select", "Select This Plan")}
                  </button>
                </div>
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
              {t("longterm.advantages.title", "Why Choose Long-Term with NEOS")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("longterm.advantages.subtitle", "Beyond just savings, long-term stays offer stability, convenience, and a true home-away-from-home experience.")}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {advantages.map((advantage) => (
              <div key={advantage.key} className="flex items-start gap-6">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 flex-shrink-0">
                  <advantage.icon size={32} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {advantage.title}
                    </h3>
                    <span className="bg-green-100 text-green-800 px-3 py-1 text-sm font-semibold">
                      {advantage.benefit}
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

      {/* Use Cases Section */}
      <Section className="py-20 bg-blue-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("longterm.usecases.title", "Perfect For Your Situation")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("longterm.usecases.subtitle", "Long-term rentals work for a variety of life and business situations requiring extended Toronto stays.")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((usecase, index) => (
              <div key={index} className="bg-white p-8 text-center shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 mx-auto mb-6">
                  <usecase.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {usecase.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {usecase.description}
                </p>
                <div className="text-sm text-blue-600 font-medium">
                  {usecase.duration}
                </div>
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
              {t("longterm.benefits.title", "Everything Included")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("longterm.benefits.subtitle", "All long-term rentals include premium amenities and services at no additional cost.")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.key} className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 flex-shrink-0">
                  <benefit.icon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Testimonials Section */}
      <Section className="py-20 bg-gray-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("longterm.testimonials.title", "Long-Term Resident Stories")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("longterm.testimonials.subtitle", "See how our long-term residents have saved money and enjoyed their extended Toronto stays.")}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 text-sm font-bold">
                    Saved {testimonial.savings}
                  </span>
                </div>
                
                <blockquote className="text-gray-700 italic mb-6 leading-relaxed">
                  &quot;{testimonial.quote}&quot;
                </blockquote>
                
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-blue-600">{testimonial.company}</div>
                  <div className="text-xs text-gray-500 mt-1">{testimonial.duration}</div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Contact Form Section */}
      <Section id="contact" className="py-20 bg-gradient-to-br from-green-900 to-blue-800 text-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            {!isSubmitted ? (
              <>
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    {t("longterm.form.title", "Get Your Long-Term Rental Quote")}
                  </h2>
                  <p className="text-xl text-blue-100">
                    {t("longterm.form.subtitle", "Tell us about your long-term housing needs and we'll create a custom proposal with your savings breakdown.")}
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 md:p-12 text-gray-900 shadow-2xl">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("longterm.form.firstName", "First Name")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("firstName")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder={t("longterm.form.firstNamePlaceholder", "Enter your first name")}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("longterm.form.lastName", "Last Name")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("lastName")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder={t("longterm.form.lastNamePlaceholder", "Enter your last name")}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("longterm.form.email", "Email Address")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        {...register("email")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder={t("longterm.form.emailPlaceholder", "your@email.com")}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("longterm.form.phone", "Phone Number")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        {...register("phone")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder={t("longterm.form.phonePlaceholder", "+1 (555) 000-0000")}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("longterm.form.moveInDate", "Desired Move-in Date")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        {...register("moveInDate")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                      {errors.moveInDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.moveInDate.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("longterm.form.leaseDuration", "Preferred Lease Duration")}
                      </label>
                      <select
                        {...register("leaseDuration")}
                        value={selectedDuration}
                        onChange={(e) => setSelectedDuration(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        <option value="3months">3 {t("longterm.form.months", "Months")} (10% off)</option>
                        <option value="6months">6 {t("longterm.form.months", "Months")} (20% off)</option>
                        <option value="12months">12 {t("longterm.form.months", "Months")} (30% off)</option>
                        <option value="18months">18+ {t("longterm.form.months", "Months")} (Custom pricing)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("longterm.form.propertyType", "Property Type")}
                      </label>
                      <select
                        {...register("propertyType")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        <option value="">{t("longterm.form.selectType", "Select type")}</option>
                        <option value="studio">{t("longterm.form.studio", "Studio")}</option>
                        <option value="1bed">1 {t("longterm.form.bedroom", "Bedroom")}</option>
                        <option value="2bed">2 {t("longterm.form.bedrooms", "Bedrooms")}</option>
                        <option value="3bed">3+ {t("longterm.form.bedrooms", "Bedrooms")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("longterm.form.budget", "Monthly Budget")}
                      </label>
                      <select
                        {...register("budget")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        <option value="">{t("longterm.form.selectBudget", "Select budget")}</option>
                        <option value="2000-2500">$2,000 - $2,500</option>
                        <option value="2500-3000">$2,500 - $3,000</option>
                        <option value="3000-3500">$3,000 - $3,500</option>
                        <option value="3500-4000">$3,500 - $4,000</option>
                        <option value="4000+">$4,000+</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("longterm.form.location", "Preferred Area")}
                      </label>
                      <select
                        {...register("location")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        <option value="">{t("longterm.form.selectLocation", "Select area")}</option>
                        <option value="downtown">Downtown Core</option>
                        <option value="yorkville">Yorkville</option>
                        <option value="liberty-village">Liberty Village</option>
                        <option value="midtown">Midtown</option>
                        <option value="north-york">North York</option>
                        <option value="waterfront">Waterfront</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("longterm.form.message", "Tell us about your requirements")} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register("message")}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-vertical"
                      placeholder={t("longterm.form.messagePlaceholder", "Please describe your long-term housing needs, any specific requirements, reasons for extended stay, and any questions about our long-term rental program...")}
                    />
                    {errors.message && (
                      <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  {/* Pricing Preview */}
                  <div className="bg-green-50 p-6 mb-8 border-l-4 border-green-500">
                    <h3 className="font-bold text-green-800 mb-3">Your Estimated Savings:</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Monthly Rate (with {currentTier.discount} discount):</div>
                        <div className="text-2xl font-bold text-green-600">${currentTier.monthlyPrice.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Total Savings ({currentTier.duration.toLowerCase()}):</div>
                        <div className="text-2xl font-bold text-green-600">${currentTier.totalSavings.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-green-600 text-white py-4 px-8 text-lg font-semibold hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        {t("longterm.form.submitting", "Submitting...")}
                      </>
                    ) : (
                      <>
                        {t("longterm.form.submit", "Get My Quote & Savings")}
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
                  {t("longterm.form.success.title", "Quote Request Submitted!")}
                </h2>
                <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                  {t("longterm.form.success.message", "Thank you for your interest in long-term rentals! Our team will prepare a detailed quote with your exact savings breakdown and contact you within 24 hours.")}
                </p>
              </div>
            )}
          </div>
        </Container>
      </Section>
    </div>
  );
}
