"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Container, Section } from "@/components/ui";
import { 
  Users, 
  MapPin, 
  Wifi,
  Coffee,
  Book,
  CheckCircle2,
  ArrowRight,
  Loader2,
  DollarSign,
  Calendar,
  Shield,
  Home,
  Star,
  Train
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { submitInquiry } from "@/lib/inquiry-client";

// Form validation schema
const studentFormSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  university: z.string().min(2, "University is required"),
  program: z.string().optional(),
  moveInDate: z.string().min(1, "Move-in date is required"),
  duration: z.string().optional(),
  budget: z.string().optional(),
  roomType: z.enum(["studio", "shared", "1bed"]).optional(),
  message: z.string().min(10, "Please tell us about your housing needs"),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

export default function ForStudentsPageContent() {
  const { t } = useI18n();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
  });

  const onSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true);
    try {
      await submitInquiry("students", data);
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
      key: "campusProximity",
      icon: MapPin,
      title: "Campus Proximity",
      description: "Walk or take a short transit ride to major Toronto universities. Save time and transportation costs."
    },
    {
      key: "moveInReady",
      icon: Home,
      title: "Move-In Ready",
      description: "Fully furnished apartments with everything you need - from furniture to kitchen essentials and high-speed WiFi."
    },
    {
      key: "community",
      icon: Users,
      title: "Student Community",
      description: "Connect with other students, join study groups, and build lasting friendships in a vibrant academic environment."
    },
    {
      key: "flexible",
      icon: Calendar,
      title: "Flexible Leases",
      description: "Choose from 4-month, 8-month, or full-year leases that match your academic schedule and budget."
    }
  ];

  const universities = [
    {
      name: "University of Toronto",
      shortName: "UofT",
      description: "Canada's top-ranked university with campuses across Toronto",
      programs: ["St. George Campus", "Scarborough Campus", "Mississauga Campus"],
      studentCount: "97,000+",
      distance: "Walking distance to downtown campus"
    },
    {
      name: "Toronto Metropolitan University",
      shortName: "TMU",
      description: "Innovative urban university in the heart of downtown Toronto",
      programs: ["Business", "Engineering", "Media Arts", "Social Work"],
      studentCount: "45,000+",
      distance: "5-15 minutes via subway/streetcar"
    },
    {
      name: "OCAD University",
      shortName: "OCAD U",
      description: "Canada's largest art and design university",
      programs: ["Art & Design", "Digital Media", "Architecture"],
      studentCount: "4,500+",
      distance: "10 minutes via streetcar"
    },
    {
      name: "George Brown College",
      shortName: "GBC",
      description: "Leading college for career-focused education",
      programs: ["Culinary Arts", "Business", "Health Sciences", "Technology"],
      studentCount: "32,000+",
      distance: "Multiple campus locations - easy access"
    },
    {
      name: "Centennial College",
      shortName: "CC",
      description: "Ontario's first community college with multiple Toronto campuses",
      programs: ["Applied Sciences", "Business", "Engineering Technology"],
      studentCount: "40,000+",
      distance: "Various locations - transit friendly"
    },
    {
      name: "Seneca Polytechnic",
      shortName: "Seneca",
      description: "Leading polytechnic institution with strong industry connections",
      programs: ["Aviation", "Business", "Technology", "Health"],
      studentCount: "28,000+",
      distance: "Multiple campuses - direct transit connections"
    }
  ];

  const features = [
    { key: "wifi", icon: Wifi, title: "High-Speed WiFi", description: "Perfect for online classes and research" },
    { key: "study", icon: Book, title: "Study Spaces", description: "Quiet areas for focused academic work" },
    { key: "social", icon: Coffee, title: "Common Areas", description: "Spaces to socialize and collaborate" },
    { key: "security", icon: Shield, title: "Secure Buildings", description: "24/7 security and key card access" },
  ];

  const pricing = [
    {
      type: "Shared Room",
      price: "1,200",
      duration: "per month",
      features: [
        "Shared bedroom with student",
        "Shared bathroom & kitchen",
        "All utilities included",
        "WiFi & study areas",
        "Community events"
      ],
      popular: false
    },
    {
      type: "Private Studio",
      price: "1,800",
      duration: "per month", 
      features: [
        "Private bedroom & bathroom",
        "Kitchenette included",
        "All utilities & WiFi",
        "Study desk & storage",
        "Laundry facilities"
      ],
      popular: true
    },
    {
      type: "1-Bedroom Apt",
      price: "2,400",
      duration: "per month",
      features: [
        "Full private apartment",
        "Full kitchen & bathroom",
        "Living area included",
        "Premium building amenities",
        "Perfect for couples/sharing"
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      university: "University of Toronto",
      program: "Computer Science",
      quote: "Living with StayNeos made my first year in Toronto so much easier. The apartment was fully furnished and the community helped me make friends quickly!",
      rating: 5
    },
    {
      name: "Marcus Johnson", 
      university: "Toronto Metropolitan University",
      program: "Business Management",
      quote: "The location was perfect - 10 minutes to campus and close to everything downtown. The study spaces were a lifesaver during exams.",
      rating: 5
    },
    {
      name: "Emma Rodriguez",
      university: "OCAD University", 
      program: "Graphic Design",
      quote: "As an international student, having everything set up when I arrived was amazing. The flexible lease worked perfectly with my program schedule.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section className="relative py-24 bg-gradient-to-br from-purple-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {t("students.hero.title", "Student Housing Made Simple")}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              {t("students.hero.subtitle", "Premium furnished apartments near Toronto's top universities. Move in ready with flexible leases, vibrant student community, and everything you need to succeed academically.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-blue-900 px-8 py-4 text-lg font-semibold hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <DollarSign size={20} />
                {t("students.hero.pricingCta", "View Pricing")}
              </button>
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-white text-white px-8 py-4 text-lg font-semibold hover:bg-white hover:text-blue-900 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {t("students.hero.cta", "Apply Now")}
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
              {t("students.advantages.title", "Why Students Choose StayNeos")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("students.advantages.subtitle", "Focus on your studies while we take care of your housing needs with purpose-built student living solutions.")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((advantage) => (
              <div key={advantage.key} className="bg-white p-8 text-center shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 mb-6 mx-auto">
                  <advantage.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {advantage.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {advantage.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Universities Section */}
      <Section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("students.universities.title", "Partner Universities & Colleges")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("students.universities.subtitle", "Strategically located near Toronto's top educational institutions for easy access to campus and academic resources.")}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {universities.map((university, index) => (
              <div key={index} className="bg-gray-50 p-8 border-l-4 border-blue-600 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {university.name}
                    </h3>
                    <p className="text-gray-600">{university.description}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 text-sm font-semibold">
                    {university.studentCount}
                  </span>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Popular Programs:</h4>
                  <div className="flex flex-wrap gap-2">
                    {university.programs.map((program, i) => (
                      <span key={i} className="bg-white text-gray-700 px-2 py-1 text-sm border">
                        {program}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-blue-600">
                  <Train size={16} />
                  <span className="text-sm font-medium">{university.distance}</span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Features Section */}
      <Section className="py-20 bg-blue-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("students.features.title", "Student-Focused Amenities")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("students.features.subtitle", "Every space is designed with student success in mind, from study areas to social spaces.")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.key} className="bg-white p-8 text-center shadow-lg hover:shadow-xl transition-all duration-200 group">
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

      {/* Pricing Section */}
      <Section id="pricing" className="py-20 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("students.pricing.title", "Student-Friendly Pricing")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("students.pricing.subtitle", "Flexible options to fit every student budget with all-inclusive pricing and no hidden fees.")}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricing.map((plan, index) => (
              <div key={index} className={`relative bg-white p-8 shadow-xl hover:shadow-2xl transition-shadow duration-200 ${plan.popular ? 'border-2 border-blue-500' : 'border border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-6 py-2 font-semibold text-sm">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {plan.type}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">/{plan.duration}</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className={`w-full py-3 px-6 font-semibold transition-colors duration-200 ${
                    plan.popular 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {t("students.pricing.select", "Select Plan")}
                </button>
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
              {t("students.testimonials.title", "What Students Say")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("students.testimonials.subtitle", "Hear from current and former residents about their StayNeos experience.")}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-gray-700 italic mb-6 leading-relaxed">
                  &quot;{testimonial.quote}&quot;
                </blockquote>
                
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.program}</div>
                  <div className="text-sm text-blue-600">{testimonial.university}</div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Contact Form Section */}
      <Section id="contact" className="py-20 bg-gradient-to-br from-purple-900 to-blue-800 text-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            {!isSubmitted ? (
              <>
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    {t("students.form.title", "Apply for Student Housing")}
                  </h2>
                  <p className="text-xl text-blue-100">
                    {t("students.form.subtitle", "Ready to secure your Toronto student housing? Complete the application below and our team will contact you within 24 hours.")}
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 md:p-12 text-gray-900 shadow-2xl">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("students.form.firstName", "First Name")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("firstName")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder={t("students.form.firstNamePlaceholder", "Enter your first name")}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("students.form.lastName", "Last Name")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("lastName")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder={t("students.form.lastNamePlaceholder", "Enter your last name")}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("students.form.email", "Email Address")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        {...register("email")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder={t("students.form.emailPlaceholder", "your@email.com")}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("students.form.phone", "Phone Number")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        {...register("phone")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder={t("students.form.phonePlaceholder", "+1 (555) 000-0000")}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("students.form.university", "University/College")} <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register("university")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        <option value="">{t("students.form.selectUniversity", "Select your school")}</option>
                        <option value="university-of-toronto">{t("students.form.uoft", "University of Toronto")}</option>
                        <option value="toronto-metropolitan">{t("students.form.tmu", "Toronto Metropolitan University")}</option>
                        <option value="ocad">{t("students.form.ocad", "OCAD University")}</option>
                        <option value="george-brown">{t("students.form.gbc", "George Brown College")}</option>
                        <option value="centennial">{t("students.form.cc", "Centennial College")}</option>
                        <option value="seneca">{t("students.form.seneca", "Seneca Polytechnic")}</option>
                        <option value="other">{t("students.form.other", "Other")}</option>
                      </select>
                      {errors.university && (
                        <p className="text-red-500 text-sm mt-1">{errors.university.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("students.form.program", "Program/Major")}
                      </label>
                      <input
                        {...register("program")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder={t("students.form.programPlaceholder", "e.g. Computer Science")}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("students.form.moveInDate", "Move-in Date")} <span className="text-red-500">*</span>
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
                        {t("students.form.duration", "Lease Duration")}
                      </label>
                      <select
                        {...register("duration")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        <option value="">{t("students.form.selectDuration", "Select")}</option>
                        <option value="4months">4 {t("students.form.months", "Months")}</option>
                        <option value="8months">8 {t("students.form.months", "Months")}</option>
                        <option value="12months">12 {t("students.form.months", "Months")}</option>
                        <option value="flexible">{t("students.form.flexible", "Flexible")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("students.form.budget", "Monthly Budget")}
                      </label>
                      <select
                        {...register("budget")}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        <option value="">{t("students.form.selectBudget", "Select budget")}</option>
                        <option value="under-1000">Under $1,000</option>
                        <option value="1000-1500">$1,000 - $1,500</option>
                        <option value="1500-2000">$1,500 - $2,000</option>
                        <option value="2000-2500">$2,000 - $2,500</option>
                        <option value="2500+">$2,500+</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("students.form.roomType", "Preferred Room Type")}
                    </label>
                    <div className="grid md:grid-cols-3 gap-4">
                      <label className="flex items-center gap-3 p-4 border border-gray-300 cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          {...register("roomType")}
                          value="shared"
                          className="text-blue-600"
                        />
                        <span>{t("students.form.shared", "Shared Room")}</span>
                      </label>
                      <label className="flex items-center gap-3 p-4 border border-gray-300 cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          {...register("roomType")}
                          value="studio"
                          className="text-blue-600"
                        />
                        <span>{t("students.form.studio", "Private Studio")}</span>
                      </label>
                      <label className="flex items-center gap-3 p-4 border border-gray-300 cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          {...register("roomType")}
                          value="1bed"
                          className="text-blue-600"
                        />
                        <span>{t("students.form.oneBed", "1-Bedroom")}</span>
                      </label>
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("students.form.message", "Additional Information")} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register("message")}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-vertical"
                      placeholder={t("students.form.messagePlaceholder", "Tell us about yourself, any special requirements, roommate preferences, or questions you have about student housing with StayNeos...")}
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
                        {t("students.form.submitting", "Submitting...")}
                      </>
                    ) : (
                      <>
                        {t("students.form.submit", "Submit Application")}
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
                  {t("students.form.success.title", "Application Submitted!")}
                </h2>
                <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                  {t("students.form.success.message", "Thank you for your application! Our student housing team will review your information and contact you within 24 hours to discuss available options and next steps.")}
                </p>
              </div>
            )}
          </div>
        </Container>
      </Section>
    </div>
  );
}
