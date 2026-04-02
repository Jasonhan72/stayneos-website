"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { useTranslations } from 'next-intl';

interface FooterProps {
  locale: string;
}

export default function Footer({ locale }: FooterProps) {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: t('about'), href: "/about" },
      { label: t('owners') || "For Property Owners", href: "/for-hosts" },
      { label: t('agents') || "For Agents", href: "/for-agents" },
      { label: t('contact'), href: "/contact" },
    ],
    services: [
      { label: t('properties') || "Properties", href: "/properties" },
      { label: t('corporate'), href: "/for-business" },
      { label: t('medicalAcademic', { defaultValue: "Medical & Academic Stays" }), href: "/for-students" },
      { label: t('longTerm') || "Long-term", href: "/long-term" },
    ],
    support: [
      { label: t('marketInsights') || "Market Insights", href: "/market-insights" },
      { label: t('help') || "Help Center", href: "/help" },
      { label: t('faq') || "FAQ", href: "/faq" },
      { label: t('privacy') || "Privacy", href: "/privacy" },
      { label: t('terms') || "Terms", href: "/terms" },
      { label: t('cancellation') || "Cancellation", href: "/cancellation-policy" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/stayneos", label: "Facebook" },
    { icon: Instagram, href: "https://instagram.com/stayneos", label: "Instagram" },
    { icon: Twitter, href: "https://twitter.com/stayneos", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com/company/stayneos", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative h-12 w-12">
                <Image
                  src="/logo.png"
                  alt="NEOS Logo"
                  fill
                  className="object-contain"
                  sizes="48px"
                />
              </div>
              <span className="text-2xl font-bold">NEOS</span>
            </div>
            <p className="text-neutral-300 mb-6 max-w-md">
              {t('description', { defaultValue: "NEOS is a premium executive apartment platform for business professionals, offering quality properties, flexible leases, and 24/7 concierge service." })}
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('company', { defaultValue: "Company" })}</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={`/${locale}${link.href}`}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('services', { defaultValue: "Services" })}</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={`/${locale}${link.href}`}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('support', { defaultValue: "Support" })}</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={`/${locale}${link.href}`}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-neutral-400" />
              <div>
                <p className="text-sm text-neutral-400">{t('addressLabel', { defaultValue: "Address" })}</p>
                <p className="text-white">20 Upjohn Rd, North York, ON M3B 2V9</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={20} className="text-neutral-400" />
              <div>
                <p className="text-sm text-neutral-400">{t('phoneLabel', { defaultValue: "Phone" })}</p>
                <p className="text-white">+1 (647) 862-6518</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-neutral-400" />
              <div>
                <p className="text-sm text-neutral-400">{t('emailLabel', { defaultValue: "Email" })}</p>
                <p className="text-white">hello@neos.rentals</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-neutral-800 text-center">
          <p className="text-neutral-400 text-sm">
            © {currentYear} NEOS. {t('copyright', { defaultValue: "All rights reserved." })}
          </p>
          <p className="text-neutral-500 text-xs mt-2">
            {t('disclaimer', { defaultValue: "NEOS is a premium executive apartment rental platform serving Toronto and the Greater Toronto Area." })}
          </p>
        </div>
      </div>
    </footer>
  );
}