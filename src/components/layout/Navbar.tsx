"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "./UserMenu";
import { LanguageCurrencySelector } from "./LanguageCurrencySelector";
import { MobileMenu } from "./MobileMenu";
import { useAuth } from "@/lib/UserContext";
import { useI18n } from "@/lib/i18n";

interface NavbarProps {
  variant?: "light" | "dark" | "transparent";
}

export default function Navbar({ variant = "light" }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/properties", label: t("nav.properties") },
    { href: "/services", label: t("nav.services") },
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
  ];

  const bgStyles = {
    light: isScrolled ? "bg-white shadow-md" : "bg-white",
    dark: isScrolled ? "bg-primary shadow-md" : "bg-primary",
    transparent: isScrolled ? "bg-white shadow-md" : "bg-transparent",
  };

  const textStyles = {
    light: "text-neutral-700 hover:text-neutral-900",
    dark: "text-white/90 hover:text-white",
    transparent: isScrolled ? "text-neutral-700 hover:text-neutral-900" : "text-white/90 hover:text-white",
  };

  const currentVariant = isScrolled ? "light" : variant;

  return (
    <>
      {/* Main Navigation */}
      <nav
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          bgStyles[currentVariant]
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/logo.png"
                alt="StayNeos"
                width={140}
                height={48}
                className="h-9 md:h-10 w-auto object-contain"
                priority
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
                    textStyles[currentVariant]
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop - Language/Currency + User Menu */}
            <div className="hidden lg:flex items-center gap-2">
              <LanguageCurrencySelector variant={currentVariant as "light" | "dark" | "transparent"} />
              <UserMenu variant={currentVariant as "light" | "dark" | "transparent"} />
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
                        alt={user.name || "User"}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold bg-[#e3f2fd] text-[#1967d2]">
                      {(() => {
                        const name = user?.name || "";
                        const email = user?.email || "";
                        if (name) {
                          const initials = name.split(" ").filter(n => n).map(n => n[0]).join("").toUpperCase();
                          return initials.slice(0, 2) || "U";
                        }
                        if (email) {
                          return email.substring(0, 2).toUpperCase();
                        }
                        return "U";
                      })()}
                    </div>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className={cn(
                    "p-2 rounded-lg transition-colors duration-200",
                    "hover:bg-neutral-100 focus:outline-none",
                    textStyles[currentVariant]
                  )}
                  aria-label="打开菜单"
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}
