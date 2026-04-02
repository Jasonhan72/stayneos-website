"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, User, Home, Heart, KeyRound, Building2, Phone, ChevronRight, LayoutDashboard, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/UserContext";
import { useTranslations, useLocale } from 'next-intl';
import { locales, localeNames } from '@/i18n.config';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
  variant?: "light" | "dark" | "transparent";
}

export default function MobileMenu({ isOpen, onClose, locale, variant = "light" }: MobileMenuProps) {
  const { user, logout } = useAuth();
  const t = useTranslations('nav');
  const currentLocale = useLocale();
  const [showLangCurrency, setShowLangCurrency] = useState(false);
  
  const userInitial = user?.firstName?.[0] || user?.name?.[0] || "U";

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  const bgStyles = {
    light: "bg-white",
    dark: "bg-primary",
    transparent: "bg-primary",
  };

  const textStyles = {
    light: "text-neutral-700",
    dark: "text-white",
    transparent: "text-white",
  };

  const borderStyles = {
    light: "border-neutral-200",
    dark: "border-white/20",
    transparent: "border-white/20",
  };

  const menuItems = [
    { icon: Home, label: t('home'), href: "/" },
    { icon: Building2, label: t('properties'), href: "/properties" },
    { icon: Info, label: t('about'), href: "/about" },
    { icon: Phone, label: t('contact'), href: "/contact" },
    { icon: Building2, label: t('business'), href: "/for-business" },
    { icon: Building2, label: t('hosts'), href: "/for-hosts" },
    { icon: Building2, label: t('agents'), href: "/for-agents" },
  ];

  const userMenuItems = user ? [
    { icon: LayoutDashboard, label: t('dashboard'), href: "/dashboard" },
    { icon: Home, label: t('bookings'), href: "/dashboard/bookings" },
    { icon: Heart, label: t('wishlists'), href: "/dashboard/wishlists" },
    { icon: User, label: t('profile'), href: "/dashboard/profile" },
    { icon: Building2, label: t('becomeHost'), href: "/become-host" },
  ] : [];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 w-full max-w-sm z-50 transform transition-transform duration-300 ease-in-out",
          bgStyles[variant],
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between p-6 border-b",
          borderStyles[variant]
        )}>
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image
                src="/logo.png"
                alt="NEOS Logo"
                fill
                className="object-contain"
                sizes="40px"
              />
            </div>
            <span className={cn(
              "text-2xl font-bold",
              textStyles[variant]
            )}>
              NEOS
            </span>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500",
              variant === "light" 
                ? "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                : "text-white/90 hover:text-white hover:bg-white/10"
            )}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-80px)] overflow-y-auto">
          {/* User Section */}
          <div className={cn(
            "p-6 border-b",
            borderStyles[variant]
          )}>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name || "User"}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-primary font-medium text-lg">
                      {userInitial}
                    </span>
                  )}
                </div>
                <div>
                  <div className={cn(
                    "font-medium",
                    textStyles[variant]
                  )}>
                    {user.firstName || user.name || "User"}
                  </div>
                  <div className={cn(
                    "text-sm opacity-70",
                    textStyles[variant]
                  )}>
                    {user.email}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  href={`/${locale}/login`}
                  className={cn(
                    "block w-full px-4 py-3 rounded-lg text-center font-medium transition-colors",
                    variant === "light"
                      ? "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      : "bg-white/10 text-white hover:bg-white/20"
                  )}
                  onClick={onClose}
                >
                  {t('login')}
                </Link>
                <Link
                  href={`/${locale}/register`}
                  className="block w-full px-4 py-3 rounded-lg bg-primary text-white text-center font-medium hover:bg-primary-dark transition-colors"
                  onClick={onClose}
                >
                  {t('signup')}
                </Link>
              </div>
            )}
          </div>

          {/* Main Menu */}
          <div className="p-4">
            <h3 className={cn(
              "text-sm font-medium uppercase tracking-wider mb-4",
              variant === "light" ? "text-neutral-500" : "text-white/70"
            )}>
              {t('navigation')}
            </h3>
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={`/${locale}${item.href}`}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      variant === "light"
                        ? "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    )}
                    onClick={onClose}
                  >
                    <item.icon size={20} className="opacity-70" />
                    <span>{item.label}</span>
                    <ChevronRight size={16} className="ml-auto opacity-50" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* User Menu (if logged in) */}
          {user && userMenuItems.length > 0 && (
            <div className="p-4 border-t border-neutral-200/50">
              <h3 className={cn(
                "text-sm font-medium uppercase tracking-wider mb-4",
                variant === "light" ? "text-neutral-500" : "text-white/70"
              )}>
                {t('account')}
              </h3>
              <ul className="space-y-1">
                {userMenuItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={`/${locale}${item.href}`}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                        variant === "light"
                          ? "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                          : "text-white/90 hover:text-white hover:bg-white/10"
                      )}
                      onClick={onClose}
                    >
                      <item.icon size={20} className="opacity-70" />
                      <span>{item.label}</span>
                      <ChevronRight size={16} className="ml-auto opacity-50" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Language Selector */}
          <div className="p-4 border-t border-neutral-200/50">
            <button
              onClick={() => setShowLangCurrency(!showLangCurrency)}
              className={cn(
                "flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors",
                variant === "light"
                  ? "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🌐</span>
                <span>{localeNames[currentLocale as keyof typeof localeNames] || 'English'}</span>
              </div>
              <ChevronRight size={16} className={showLangCurrency ? "rotate-90" : ""} />
            </button>

            {showLangCurrency && (
              <div className="mt-2 space-y-1">
                {locales.map((loc) => (
                  <Link
                    key={loc}
                    href={`/${loc}`}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                      variant === "light"
                        ? "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                        : "text-white/90 hover:text-white hover:bg-white/10",
                      currentLocale === loc && "bg-primary/10 text-primary"
                    )}
                    onClick={onClose}
                  >
                    <span>{localeNames[loc]}</span>
                    {currentLocale === loc && (
                      <span className="ml-auto text-primary">✓</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Logout (if logged in) */}
          {user && (
            <div className="p-4 border-t border-neutral-200/50">
              <button
                onClick={async () => {
                  await logout();
                  onClose();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  variant === "light"
                    ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                    : "text-red-400 hover:text-red-300 hover:bg-white/10"
                )}
              >
                <KeyRound size={20} />
                <span>{t('logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}