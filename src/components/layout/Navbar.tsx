"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "./UserMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileMenu from "./MobileMenu";
import { useAuth } from "@/lib/context/UserContext";
import { useTranslations, useLocale } from 'next-intl';

interface NavbarProps {
  variant?: "light" | "dark" | "transparent";
  locale: string;
}

export default function Navbar({ variant = "light", locale }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user: _user, isAuthenticated: _isAuthenticated } = useAuth();
  const t = useTranslations('nav');
  const currentLocale = useLocale();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/properties", label: t('properties') },
    { href: "/for-business", label: t('business') },
    { href: "/about", label: t('about') },
    { href: "/contact", label: t('contact') },
  ];

  const bgStyles = {
    light: isScrolled ? "bg-white shadow-md" : "bg-white",
    dark: isScrolled ? "bg-primary shadow-md" : "bg-primary",
    transparent: isScrolled ? "bg-white shadow-md" : "bg-transparent",
  };

  const textStyles = {
    light: "text-neutral-700 hover:text-neutral-900",
    dark: "text-white/90 hover:text-white",
    transparent: isScrolled ? "text-neutral-700 hover:text-neutral-900" : "text-white hover:text-white/80",
  };

  const logoTextStyles = {
    light: "text-neutral-900",
    dark: "text-white",
    transparent: isScrolled ? "text-neutral-900" : "text-white",
  };

  const menuButtonStyles = {
    light: "text-neutral-700 hover:text-neutral-900",
    dark: "text-white/90 hover:text-white",
    transparent: isScrolled ? "text-neutral-700 hover:text-neutral-900" : "text-white hover:text-white/80",
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          bgStyles[variant],
          isScrolled ? "py-3" : "py-4"
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href={`/${locale}`} className="flex items-center gap-3">
                <div className="relative h-10 w-10">
                  <Image
                    src="/logo.png"
                    alt="NEOS Logo"
                    fill
                    className="object-contain"
                    sizes="40px"
                    priority
                  />
                </div>
                <span
                  className={cn(
                    "text-2xl font-bold tracking-tight",
                    logoTextStyles[variant]
                  )}
                >
                  NEOS
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={`/${locale}${link.href}`}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    textStyles[variant]
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <LanguageSwitcher locale={currentLocale} isScrolled={isScrolled} />

              {/* User Menu / Auth Buttons */}
              <UserMenu locale={locale} />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={cn(
                  "md:hidden p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2",
                  menuButtonStyles[variant]
                )}
                aria-label={t('openMenu')}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        locale={locale}
        variant={variant}
      />
    </>
  );
}