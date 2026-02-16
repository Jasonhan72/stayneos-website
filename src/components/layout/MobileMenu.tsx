"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, User, Home, Heart, KeyRound, Building2, Phone, ChevronRight, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/UserContext";
import { useI18n } from "@/lib/i18n";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "CAD", symbol: "$", name: "Canadian Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
];

// Get greeting based on time of day
const getGreeting = (t: (key: string) => string, hour: number) => {
  if (hour < 12) return t("greeting.morning");
  if (hour < 18) return t("greeting.afternoon");
  return t("greeting.evening");
};

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user, logout } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [showLangCurrency, setShowLangCurrency] = useState(false);
  
  const languages = [
    { code: "en", name: t("language.en"), flag: "🇺🇸" },
    { code: "zh", name: t("language.zh"), flag: "🇨🇳" },
    { code: "fr", name: t("language.fr"), flag: "🇫🇷" },
  ];
  
  const selectedLang = languages.find(l => l.code === locale) || languages[0];

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

  // Reset lang currency view when menu closes
  useEffect(() => {
    if (!isOpen) {
      setShowLangCurrency(false);
    }
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  // Logged out menu items
  const publicMenuItems = [
    { label: t("nav.landlords"), href: "/landlords", icon: KeyRound },
    { label: t("nav.business"), href: "/corporate", icon: Building2 },
    { label: t("nav.contact"), href: "/contact", icon: Phone },
  ];

  if (showLangCurrency) {
    return (
      <div
        className={cn(
          "fixed inset-0 bg-white z-50 transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={() => setShowLangCurrency(false)} className="p-2">
            <span className="text-2xl">←</span>
          </button>
          <h2 className="text-lg font-semibold">{t("language.title")} / {t("currency.title")}</h2>
          <button onClick={onClose} className="p-2">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-neutral-500 mb-3">{t("language.title")}</h3>
            <div className="space-y-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLocale(lang.code as 'en' | 'fr' | 'zh')}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                    selectedLang.code === lang.code
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-neutral-50"
                  )}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-neutral-500 mb-3">{t("currency.title")}</h3>
            <div className="grid grid-cols-2 gap-2">
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => setSelectedCurrency(curr)}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-lg transition-colors",
                    selectedCurrency.code === curr.code
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-neutral-50 border"
                  )}
                >
                  <span className="font-semibold">{curr.symbol}</span>
                  <span className="text-sm">{curr.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-50 shadow-2xl",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Close Button */}
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="w-6 h-6 text-neutral-600" />
          </button>
        </div>

        <div className="px-6 pb-6 overflow-y-auto h-[calc(100%-80px)]">
          {!user ? (
            // Logged out state
            <>
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center gap-4 mb-8"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-medium">{t("nav.signup")}</span>
                  <span className="text-neutral-400">or</span>
                  <span className="text-blue-600 font-medium">{t("nav.login")}</span>
                </div>
              </Link>

              {publicMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center justify-between py-4 border-b border-neutral-100"
                >
                  <div className="flex items-center gap-4">
                    <item.icon className="w-5 h-5 text-neutral-600" />
                    <span className="text-neutral-800">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </Link>
              ))}

              <button
                onClick={() => setShowLangCurrency(true)}
                className="w-full flex items-center justify-between py-4 border-b border-neutral-100"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{selectedLang.flag}</span>
                  <span className="text-neutral-800">{selectedLang.name}, {selectedCurrency.symbol} {selectedCurrency.code}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              </button>
            </>
          ) : (
            // Logged in state - Blueground style
            <>
              {/* User Header with Greeting */}
              <div className="flex items-center gap-4 mb-6">
                {user?.avatar || user?.image ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-100">
                    <Image
                      src={user.avatar || user.image!}
                      alt={user.name || "User"}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg">
                    {(() => {
                      const name = user?.name || "";
                      if (!name) return "U";
                      return name.split(" ").filter(n => n).map(n => n[0]).join("").toUpperCase().slice(0, 2);
                    })()}
                  </div>
                )}
                <h2 className="text-xl font-semibold text-neutral-800">
                  {getGreeting(t, new Date().getHours())}, {(user?.name?.split(" ").filter(n => n)[0]) || t("common.there")}
                </h2>
              </div>

              {/* Primary Menu Items */}
              <div className="space-y-0">
                <Link
                  href="/dashboard/bookings"
                  onClick={onClose}
                  className="flex items-center justify-between py-4 border-b border-neutral-100"
                >
                  <div className="flex items-center gap-4">
                    <Home className="w-5 h-5 text-neutral-600" />
                    <span className="text-neutral-800">{t("nav.bookings")}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </Link>

                <Link
                  href="/profile"
                  onClick={onClose}
                  className="flex items-center justify-between py-4 border-b border-neutral-100"
                >
                  <div className="flex items-center gap-4">
                    <User className="w-5 h-5 text-neutral-600" />
                    <span className="text-neutral-800">{t("nav.personalDetails")}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </Link>

                <Link
                  href="/profile/preferences"
                  onClick={onClose}
                  className="flex items-center justify-between py-4 border-b border-neutral-100"
                >
                  <div className="flex items-center gap-4">
                    <SlidersHorizontal className="w-5 h-5 text-neutral-600" />
                    <span className="text-neutral-800">{t("nav.preferences")}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </Link>

                <Link
                  href="/wishlists"
                  onClick={onClose}
                  className="flex items-center justify-between py-4 border-b border-neutral-100"
                >
                  <div className="flex items-center gap-4">
                    <Heart className="w-5 h-5 text-neutral-600" />
                    <span className="text-neutral-800">{t("nav.wishlists")}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </Link>

                <button
                  onClick={() => setShowLangCurrency(true)}
                  className="w-full flex items-center justify-between py-4 border-b border-neutral-100"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{selectedLang.flag}</span>
                    <span className="text-neutral-800">{selectedLang.name}, {selectedCurrency.symbol} {selectedCurrency.code}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </button>
              </div>

              {/* Divider */}
              <div className="my-4 border-t border-neutral-200" />

              {/* Secondary Menu Items */}
              <div className="space-y-0">
                <Link
                  href="/landlords"
                  onClick={onClose}
                  className="flex items-center justify-between py-4 border-b border-neutral-100"
                >
                  <div className="flex items-center gap-4">
                    <KeyRound className="w-5 h-5 text-neutral-600" />
                    <span className="text-neutral-800">{t("nav.landlords")}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </Link>

                <Link
                  href="/corporate"
                  onClick={onClose}
                  className="flex items-center justify-between py-4 border-b border-neutral-100"
                >
                  <div className="flex items-center gap-4">
                    <Building2 className="w-5 h-5 text-neutral-600" />
                    <span className="text-neutral-800">{t("nav.business")}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </Link>

                <Link
                  href="/contact"
                  onClick={onClose}
                  className="flex items-center justify-between py-4 border-b border-neutral-100"
                >
                  <div className="flex items-center gap-4">
                    <Phone className="w-5 h-5 text-neutral-600" />
                    <span className="text-neutral-800">{t("nav.contact")}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </Link>
              </div>

              {/* Log out */}
              <button
                onClick={handleLogout}
                className="w-full text-left py-4 text-red-600 font-medium"
              >
                {t("nav.logout")}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default MobileMenu;
