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
      { label: t("footer.owners") || "For Property Owners", href: "/for-hosts" },
      { label: t("footer.agents") || "For Agents", href: "/for-agents" },
      { label: t("footer.contact"), href: "/contact" },
    ],
    services: [
      { label: t("footer.properties") || "Properties", href: "/properties" },
      { label: t("footer.corporate"), href: "/for-business" },
      { label: t("footer.medicalAcademic", "Medical & Academic Stays"), href: "/for-students" },
      { label: t("footer.longTerm") || "Long-term", href: "/long-term" },
    ],
    support: [
      { label: t("footer.marketInsights") || "Market Insights", href: "/market-insights" },
      { label: t("footer.help") || "Help Center", href: "/help" },
      { label: t("footer.faq") || "FAQ", href: "/faq" },
      { label: t("footer.privacy") || "Privacy", href: "/privacy" },
      { label: t("footer.terms") || "Terms", href: "/terms" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/stayneos", label: "Facebook" },
    { icon: Instagram, href: "https://instagram.com/stayneos", label: "Instagram" },
    { icon: Twitter, href: "https://x.com/Stayneos", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com/company/stayneos", label: "LinkedIn" },
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
                  alt="NEOS"
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
                  href="mailto:hello@neos.rentals"
                  className="flex items-center gap-3 text-primary-100 hover:text-accent transition-colors duration-200 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-700/50 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span>hello@neos.rentals</span>
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
                  <span>{t("footer.corporateOffice", "Corporate Office: 20 Upjohn Rd, North York, ON, M3B 2V9")}</span>
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
          <div className="py-5 md:py-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-primary-200 text-center sm:text-left">
                {`© ${currentYear} NEOS. All rights reserved.`}
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
            <p className="text-xs text-primary-200 text-center">
              {t("footer.trustLine", "Owner-operated · Fully insured · Corporate invoicing available · All properties in concierge-serviced buildings")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
