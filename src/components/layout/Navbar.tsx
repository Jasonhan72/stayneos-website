"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "./UserMenu";
import { LanguageCurrencySelector } from "./LanguageCurrencySelector";
import { MobileMenu } from "./MobileMenu";
import { useAuth } from "@/lib/context/UserContext";
import { useI18n } from "@/lib/i18n";

interface NavbarProps {
  variant?: "light" | "dark" | "transparent";
}

export default function Navbar({ variant = "light" }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const rafRef = useRef<number | null>(null);
  const userAlt = locale === "zh" ? "用户头像" : locale === "fr" ? "Avatar utilisateur" : "User avatar";
  const openMenuLabel = locale === "zh" ? "打开菜单" : locale === "fr" ? "Ouvrir le menu" : "Open menu";
  const defaultInitial = locale === "zh" ? "用" : locale === "fr" ? "U" : "U";

  // Throttled scroll listener (~100ms via rAF) with 80px threshold for homepage
  const handleScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      const threshold = isHomePage ? 80 : 20;
      setIsScrolled(window.scrollY > threshold);
      rafRef.current = null;
    });
  }, [isHomePage]);

  useEffect(() => {
    handleScroll(); // check initial state
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  const navLinks = [
    { href: "/properties", label: t("nav.properties") },
    { href: "/for-business", label: t("nav.business") },
    { href: "/about", label: t("nav.about") },
  ];

  // Per Jason 2026-05-17: nav is always white background with dark text
  // across all pages, including homepage hero. No more transparent variant,
  // no gradient scrim. Keeps things simple and readable on every viewport.
  const effectiveVariant = isHomePage ? "light" : variant;

  const bgStyles = {
    light: isScrolled ? "bg-white shadow-md" : "bg-white",
    dark: isScrolled ? "bg-primary shadow-md" : "bg-primary",
    transparent: "bg-transparent",
  };

  const textStyles = {
    light: "text-neutral-700 hover:text-neutral-900",
    dark: "text-white/90 hover:text-white",
    transparent: "text-neutral-700 hover:text-neutral-900",
  };

  return (
    <>
      {/* Main Navigation */}
      <nav
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          bgStyles[effectiveVariant],
          isScrolled && "shadow-md"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/logo.png"
                alt="NEOS"
                width={140}
                height={48}
                className="h-9 md:h-10 w-auto object-contain"
                priority={true}
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors duration-200 py-2",
                    textStyles[effectiveVariant]
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop - Language/Currency + Partner With Us + User Menu */}
            <div className="hidden lg:flex items-center gap-2">
              <LanguageCurrencySelector variant={effectiveVariant as "light" | "dark" | "transparent"} />
              
              {/* Hosting mode badge */}
              {pathname?.startsWith("/host") && (
                <span className="text-xs font-semibold text-[#003B5C] bg-[#003B5C]/10 px-3 py-1.5 rounded-full border border-[#003B5C]/20">
                  Hosting
                </span>
              )}

              {/* Partner With Us button — hide in host mode */}
              {!pathname?.startsWith("/host") && (
              <Link
                href="/for-agents"
                className={cn(
                  "text-sm font-medium px-3 py-2 rounded-full transition-all duration-200",
                  "hover:bg-black/5",
                  textStyles[effectiveVariant]
                )}
              >
                {t("nav.partnerWithUs")}
              </Link>
              )}
              
              {isAuthenticated ? (
              <UserMenu variant={effectiveVariant as "light" | "dark" | "transparent"} />
            ) : (
              <>
                <Link
                  href="/register"
                  className={cn(
                    "text-sm font-medium px-3 py-2 rounded-full transition-all duration-200",
                    "hover:bg-black/5",
                    textStyles[effectiveVariant]
                  )}
                >
                  {t("nav.signup")}
                </Link>
                <Link
                  href="/login"
                  className={cn(
                    "text-sm font-medium px-3 py-2 rounded-full transition-all duration-200",
                    "hover:bg-black/5",
                    textStyles[effectiveVariant]
                  )}
                >
                  {t("nav.login")}
                </Link>
              </>
            )}
            </div>

            {/* Mobile - User Avatar when logged in, Hamburger when logged out */}
            <div className="lg:hidden flex items-center gap-2">
              {isAuthenticated && user ? (
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-black/5 transition-all"
                >
                  {user?.avatar || user?.image ? (
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-100">
                      <Image
                        src={user.avatar || user.image!}
                        alt={user.name || userAlt}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center">
                      <span className="text-xs font-medium text-neutral-500">
                        {(user.name || defaultInitial).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <Menu size={20} className="text-neutral-600" />
                </button>
              ) : (
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className={cn(
                    "p-2 -mr-2 rounded-full hover:bg-black/5 transition-all",
                    textStyles[effectiveVariant]
                  )}
                  aria-label={openMenuLabel}
                >
                  <Menu size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
