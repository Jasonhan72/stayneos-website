"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: t("footer.about"), href: "/about" },
      { label: t("footer.team"), href: "/team" },
      { label: t("footer.careers"), href: "/careers" },
      { label: t("footer.news"), href: "/news" },
    ],
    services: [
      { label: t("footer.corporate"), href: "/corporate" },
      { label: t("footer.shortTerm"), href: "/short-term" },
      { label: t("footer.longTerm"), href: "/long-term" },
      { label: t("footer.propertyManagement"), href: "/property-management" },
    ],
    support: [
      { label: t("footer.help"), href: "/help" },
      { label: t("footer.faq"), href: "/faq" },
      { label: t("footer.contact"), href: "/contact" },
      { label: t("footer.privacy"), href: "/privacy" },
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
                {t("footer.description")}
              </p>
              
              {/* Contact Info */}
              <div className="mt-6 space-y-3">
                <a
                  href="mailto:hello@stayneos.com"
                  className="flex items-center gap-3 text-primary-100 hover:text-accent transition-colors duration-200 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-700/50 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span>hello@stayneos.com</span>
                </a>
                <a
                  href="tel:+16478626518"
                  className="flex items-center gap-3 text-primary-100 hover:text-accent transition-colors duration-200 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-700/50 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span>+1 (647) 862-6518</span>
                </a>
                <a
                  href="https://maps.google.com/?q=20+Upjohn+Rd+North+York+ON+M3B+2V9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-primary-100 hover:text-accent transition-colors duration-200 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-700/50 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span>20 Upjohn Rd, North York, ON, M3B 2V9</span>
                </a>
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h4 className="font-semibold text-base mb-4 md:mb-5 text-white">{t("footer.companyTitle")}</h4>
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
              <h4 className="font-semibold text-base mb-4 md:mb-5 text-white">{t("footer.servicesTitle")}</h4>
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
              <h4 className="font-semibold text-base mb-4 md:mb-5 text-white">{t("footer.supportTitle")}</h4>
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
              {t("footer.copyright", { year: currentYear })}
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
