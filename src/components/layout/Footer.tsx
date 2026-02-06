"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: "关于我们", href: "/about" },
      { label: "我们的团队", href: "/team" },
      { label: "职业机会", href: "/careers" },
      { label: "新闻中心", href: "/news" },
    ],
    services: [
      { label: "企业住房", href: "/corporate" },
      { label: "短期租赁", href: "/short-term" },
      { label: "长期租赁", href: "/long-term" },
      { label: "物业管理", href: "/property-management" },
    ],
    support: [
      { label: "帮助中心", href: "/help" },
      { label: "常见问题", href: "/faq" },
      { label: "联系我们", href: "/contact" },
      { label: "隐私政策", href: "/privacy" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-primary text-white">
      {/* Main Footer */}
      <div className="border-b border-primary-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 md:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <Link href="/" className="inline-block">
                <Image
                  src="/logo.png"
                  alt="StayNeos"
                  width={150}
                  height={50}
                  className="h-10 md:h-11 w-auto object-contain"
                />
              </Link>
              <p className="mt-4 text-primary-100 max-w-sm leading-relaxed text-sm md:text-base">
                为现代旅行者提供精心设计的住宿体验。无论是商务出行还是休闲度假，我们都能为您提供完美的居住空间。
              </p>
              
              {/* Contact Info */}
              <div className="mt-6 space-y-3">
                <a
                  href="mailto:info@stayneos.com"
                  className="flex items-center gap-3 text-primary-100 hover:text-accent transition-colors duration-200 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-700/50 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span>info@stayneos.com</span>
                </a>
                <a
                  href="tel:+1-234-567-8900"
                  className="flex items-center gap-3 text-primary-100 hover:text-accent transition-colors duration-200 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-700/50 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span>+1 (234) 567-8900</span>
                </a>
                <div className="flex items-center gap-3 text-primary-100">
                  <div className="w-10 h-10 rounded-lg bg-primary-700/50 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span>123 Main Street, Toronto, ON</span>
                </div>
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h4 className="font-semibold text-base mb-4 md:mb-5 text-white">公司</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-primary-100 hover:text-accent transition-colors duration-200 text-sm md:text-base"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-base mb-4 md:mb-5 text-white">服务</h4>
              <ul className="space-y-3">
                {footerLinks.services.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-primary-100 hover:text-accent transition-colors duration-200 text-sm md:text-base"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-base mb-4 md:mb-5 text-white">支持</h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-primary-100 hover:text-accent transition-colors duration-200 text-sm md:text-base"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-primary-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-5 md:py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-primary-200 text-center sm:text-left">
              © {currentYear} StayNeos. 保留所有权利。
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-primary-200 hover:text-accent hover:bg-primary-700/50 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
