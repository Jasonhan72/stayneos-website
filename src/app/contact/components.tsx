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

// 联系表单组件
export function ContactForm() {
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
    { value: "booking", label: "预订咨询" },
    { value: "partnership", label: "合作洽谈" },
    { value: "support", label: "技术支持" },
    { value: "other", label: "其他" },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "请输入您的姓名";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "请输入您的邮箱";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "请输入有效的邮箱地址";
    }
    
    if (!formData.message.trim()) {
      newErrors.message = "请输入您的消息";
    } else if (formData.message.length < 10) {
      newErrors.message = "消息内容至少需要10个字符";
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
            提交成功！
          </h3>
          <p className="text-neutral-600 mb-8 max-w-sm">
            感谢您的来信。我们已收到您的消息，将在 24 小时内与您联系。
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
            发送新消息
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
            <h3 className="text-xl font-semibold text-neutral-900">联系我们</h3>
            <p className="text-sm text-neutral-500">填写以下表单，我们会尽快回复</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="姓名 *"
              placeholder="请输入您的姓名"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={errors.name}
            />
            
            <Input
              label="邮箱 *"
              type="email"
              placeholder="请输入您的邮箱"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={errors.email}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                电话（选填）
              </label>
              <input
                type="tel"
                placeholder="请输入您的电话"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 transition-all duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                主题 *
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
            label="消息内容 *"
            placeholder="请详细描述您的需求或问题..."
            rows={6}
            value={formData.message}
            onChange={(e) => handleChange("message", e.target.value)}
            error={errors.message}
          />

          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span>* 为必填项</span>
          </div>

          <UIButton
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full"
          >
            {!isSubmitting && <Send className="w-5 h-5 mr-2" />}
            发送消息
          </UIButton>

          <p className="text-xs text-neutral-500 text-center">
            您的信息将被发送至 hello@stayneos.com，我们承诺保护您的隐私。
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

// 联系信息卡片
export function ContactInfoCard() {
  const contactItems = [
    {
      icon: Mail,
      title: "电子邮箱",
      content: "hello@stayneos.com",
      href: "mailto:hello@stayneos.com",
      description: "我们通常在 24 小时内回复"
    },
    {
      icon: MapPin,
      title: "办公地址",
      content: "20 Upjohn Rd, North York, ON, M3B 2V9",
      href: "https://maps.google.com/?q=20+Upjohn+Rd+North+York+ON+M3B+2V9",
      description: "欢迎预约参观",
      external: true
    },
    {
      icon: Phone,
      title: "联系电话",
      content: "+1 (416) 555-0123",
      href: "tel:+14165550123",
      description: "工作时间随时拨打"
    },
    {
      icon: Clock,
      title: "工作时间",
      content: "周一至周五 9:00-18:00 EST",
      description: "周末及节假日休息"
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
          关注我们
        </h4>
        <p className="text-sm text-neutral-600 mb-6">
          在社交媒体上关注我们，获取最新房源和优惠信息
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
  const faqs = [
    { question: "如何预订公寓？", href: "/faq#booking" },
    { question: "最短租期是多久？", href: "/faq#lease" },
    { question: "押金如何退还？", href: "/faq#deposit" },
    { question: "可以带宠物入住吗？", href: "/faq#pets" },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="w-5 h-5 text-accent" />
          <h4 className="text-lg font-semibold text-neutral-900">
            常见问题
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
          查看全部 FAQ
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </CardContent>
    </Card>
  );
}

// 地图组件
export function MapSection() {
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
          在 Google Maps 中打开
          <ChevronRight className="w-4 h-4 ml-1" />
        </a>
      </div>
    </div>
  );
}
