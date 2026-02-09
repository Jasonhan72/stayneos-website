"use client";

import { useState, FormEvent } from "react";
import { 
  Mail, 
  MapPin, 
  Phone, 
  Clock, 
  Send, 
  CheckCircle, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin,
  MessageSquare,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, Input, TextArea, UIButton } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

// 联系表单组件
export function ContactForm() {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "booking",
    message: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const subjectOptions = [
    { value: "booking", label: t("contact.form.subjectBooking") },
    { value: "partnership", label: t("contact.form.subjectPartnership") },
    { value: "support", label: t("contact.form.subjectSupport") },
    { value: "other", label: t("contact.form.subjectOther") },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t("contact.form.errorName");
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t("contact.form.errorEmail");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("errors.invalidEmail");
    }
    
    if (!formData.message.trim()) {
      newErrors.message = t("contact.form.errorMessage");
    } else if (formData.message.length < 10) {
      newErrors.message = t("contact.form.minChars");
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // 模拟提交延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // TODO: 实际实现时，这里调用邮件 API 发送数据到 hello@stayneos.com
    console.log("Form submitted:", formData);
    
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (isSuccess) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center min-h-[500px] text-center">
          <div className="w-20 h-20 bg-green-100 flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
            {t("contact.success.title")}
          </h3>
          <p className="text-neutral-600 mb-8 max-w-sm">
            {t("contact.success.message")}
          </p>
          <UIButton 
            variant="primary"
            onClick={() => {
              setIsSuccess(false);
              setFormData({
                name: "",
                email: "",
                phone: "",
                subject: "booking",
                message: "",
              });
            }}
          >
            {t("contact.success.sendNew")}
          </UIButton>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-neutral-900">{t("contact.form.title")}</h3>
            <p className="text-sm text-neutral-500">{t("contact.form.subtitle")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={`${t("contact.form.name")} *`}
              placeholder={t("contact.form.namePlaceholder")}
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={errors.name}
            />
            
            <Input
              label={`${t("contact.form.email")} *`}
              type="email"
              placeholder={t("contact.form.emailPlaceholder")}
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={errors.email}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t("contact.form.phoneOptional")}
              </label>
              <input
                type="tel"
                placeholder={t("contact.form.phonePlaceholder")}
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 transition-all duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {`${t("contact.form.subject")} *`}
              </label>
              <select
                value={formData.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 bg-white text-neutral-900 appearance-none cursor-pointer transition-all duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {subjectOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <TextArea
            label={`${t("contact.form.message")} *`}
            placeholder={t("contact.form.messagePlaceholder")}
            rows={6}
            value={formData.message}
            onChange={(e) => handleChange("message", e.target.value)}
            error={errors.message}
          />

          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span>* {t("contact.form.required")}</span>
          </div>

          <UIButton
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full"
          >
            {!isSubmitting && <Send className="w-5 h-5 mr-2" />}
            {t("contact.form.send")}
          </UIButton>

          <p className="text-xs text-neutral-500 text-center">
            {t("contact.form.privacyNote")}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

// 联系信息卡片
export function ContactInfoCard() {
  const { t } = useI18n();

  const contactItems = [
    {
      icon: Mail,
      title: t("contact.emailLabel"),
      content: "hello@stayneos.com",
      href: "mailto:hello@stayneos.com",
      description: t("contact.responseTime")
    },
    {
      icon: MapPin,
      title: t("contact.addressLabel"),
      content: "20 Upjohn Rd, North York, ON, M3B 2V9",
      href: "https://maps.google.com/?q=20+Upjohn+Rd+North+York+ON+M3B+2V9",
      description: t("contact.visitUs"),
      external: true
    },
    {
      icon: Phone,
      title: t("contact.phoneLabel"),
      content: "+1 (647) 862-6518",
      href: "tel:+16478626518",
      description: t("contact.callAnytime")
    },
    {
      icon: Clock,
      title: t("contact.hoursLabel"),
      content: t("contact.workHours"),
      description: t("contact.weekend")
    }
  ];

  return (
    <div className="space-y-6">
      {contactItems.map((item, index) => (
        <Card key={index} className="group hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent group-hover:text-white transition-colors">
                <item.icon className="w-6 h-6 text-accent group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-neutral-500 mb-1">
                  {item.title}
                </h4>
                {item.href ? (
                  <a 
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="text-lg font-semibold text-neutral-900 hover:text-primary transition-colors"
                  >
                    {item.content}
                  </a>
                ) : (
                  <p className="text-lg font-semibold text-neutral-900">
                    {item.content}
                  </p>
                )}
                <p className="text-sm text-neutral-500 mt-1">
                  {item.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// 社交媒体链接
export function SocialLinks() {
  const { t } = useI18n();

  const socials = [
    { icon: Facebook, label: "Facebook", href: "#" },
    { icon: Instagram, label: "Instagram", href: "#" },
    { icon: Twitter, label: "Twitter", href: "#" },
    { icon: Linkedin, label: "LinkedIn", href: "#" },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h4 className="text-lg font-semibold text-neutral-900 mb-4">
          {t("contact.followUs")}
        </h4>
        <p className="text-sm text-neutral-600 mb-6">
          {t("contact.followDesc")}
        </p>
        <div className="flex items-center gap-3">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              className="w-12 h-12 bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-primary hover:text-white transition-colors"
              aria-label={social.label}
            >
              <social.icon className="w-5 h-5" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// FAQ 快速链接
export function FAQQuickLinks() {
  const { t } = useI18n();

  const faqs = [
    { question: t("contact.faqHowToBook"), href: "/faq#booking" },
    { question: t("contact.faqMinStay"), href: "/faq#lease" },
    { question: t("contact.faqDeposit"), href: "/faq#deposit" },
    { question: t("contact.faqPets"), href: "/faq#pets" },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="w-5 h-5 text-accent" />
          <h4 className="text-lg font-semibold text-neutral-900">
            {t("contact.faqTitle")}
          </h4>
        </div>
        <ul className="space-y-3">
          {faqs.map((faq, index) => (
            <li key={index}>
              <Link 
                href={faq.href}
                className="flex items-center justify-between text-neutral-600 hover:text-primary transition-colors group"
              >
                <span className="text-sm">{faq.question}</span>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-primary transition-colors" />
              </Link>
            </li>
          ))}
        </ul>
        <Link 
          href="/faq"
          className="inline-flex items-center text-sm text-primary hover:text-primary-700 font-medium mt-4"
        >
          {t("contact.viewAllFaq")}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </CardContent>
    </Card>
  );
}

// 地图组件
export function MapSection() {
  const { t } = useI18n();

  return (
    <div className="w-full h-[400px] bg-neutral-100 relative overflow-hidden">
      {/* Google Maps 嵌入 */}
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2879.6760623391347!2d-79.3456!3d43.7532!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4d3b3c8e3c7b9%3A0x7e6e8b3d3d3d3d3d!2s20%20Upjohn%20Rd%2C%20North%20York%2C%20ON%20M3B%202V9%2C%20Canada!5e0!3m2!1sen!2sca!4v1234567890"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0"
        title="StayNeos Office Location"
      />
      
      {/* 地图上的信息卡片 */}
      <div className="absolute bottom-4 left-4 bg-white p-4 shadow-lg max-w-xs">
        <h4 className="font-semibold text-neutral-900 mb-1">StayNeos</h4>
        <p className="text-sm text-neutral-600">20 Upjohn Rd, North York, ON</p>
        <a 
          href="https://maps.google.com/?q=20+Upjohn+Rd+North+York+ON+M3B+2V9"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-primary hover:text-primary-700 font-medium mt-2"
        >
          {t("contact.openInMaps")}
          <ChevronRight className="w-4 h-4 ml-1" />
        </a>
      </div>
    </div>
  );
}
