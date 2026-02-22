"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n, type Locale } from "@/lib/i18n";

interface LanguageCurrencySelectorProps {
  variant?: "light" | "dark" | "transparent";
}

const languages = [
  { code: "EN", name: "English", flag: "🇺🇸", locale: "en" as Locale },
  { code: "中文", name: "中文", flag: "🇨🇳", locale: "zh" as Locale },
  { code: "FR", name: "Français", flag: "🇫🇷", locale: "fr" as Locale },
];

const currencies = [
  { code: "CAD", symbol: "$", name: "Canadian Dollar" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
];

export function LanguageCurrencySelector({ variant = "light" }: LanguageCurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const menuRef = useRef<HTMLDivElement>(null);
  const { locale, setLocale } = useI18n();
  
  // Get current language based on i18n locale
  const selectedLang = languages.find(lang => lang.locale === locale) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDarkStyle = variant === "dark" || variant === "transparent";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-full transition-all duration-200",
          "hover:bg-black/5 focus:outline-none",
          isOpen && "bg-black/5",
          isDarkStyle ? "text-white" : "text-neutral-700"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Flag Icon */}
        <span className="text-xl">{selectedLang.flag}</span>
        <span className="text-sm font-medium">
          {selectedLang.code}, {selectedCurrency.symbol}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-neutral-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-neutral-400" />
        )}
      </button>

      {/* Dropdown */}
      <div
        className={cn(
          "absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-neutral-100",
          "transition-all duration-200 origin-top-right z-50",
          isOpen 
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        )}
      >
        {/* Language Section */}
        <div className="px-4 py-3 border-b border-neutral-100">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">
            Language
          </p>
          <div className="space-y-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLocale(lang.locale);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                  selectedLang.code === lang.code
                    ? "bg-blue-50 text-blue-600"
                    : "text-neutral-700 hover:bg-neutral-50"
                )}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Currency Section */}
        <div className="px-4 py-3">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">
            Currency
          </p>
          <div className="grid grid-cols-2 gap-1">
            {currencies.map((curr) => (
              <button
                key={curr.code}
                onClick={() => {
                  setSelectedCurrency(curr);
                }}
                className={cn(
                  "flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors",
                  selectedCurrency.code === curr.code
                    ? "bg-blue-50 text-blue-600"
                    : "text-neutral-700 hover:bg-neutral-50"
                )}
              >
                <span className="font-medium">{curr.symbol}</span>
                <span className="text-xs text-neutral-500">{curr.code}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LanguageCurrencySelector;
