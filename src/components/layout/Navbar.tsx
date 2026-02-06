"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

interface NavbarProps {
  variant?: "light" | "dark" | "transparent";
  showContact?: boolean;
}

export default function Navbar({ variant = "light", showContact = true }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "首页" },
    { href: "/properties", label: "房源" },
    { href: "/services", label: "服务" },
    { href: "/about", label: "关于我们" },
    { href: "/contact", label: "联系我们" },
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
      {/* Top Bar - Contact Info */}
      {showContact && (
        <div className="bg-primary text-white py-2.5 px-4 hidden md:block">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <a 
                href="tel:+1-234-567-8900" 
                className="flex items-center gap-2 hover:text-accent transition-colors duration-200"
              >
                <Phone className="w-4 h-4" />
                <span>+1 (234) 567-8900</span>
              </a>
              <a 
                href="mailto:info@stayneos.com" 
                className="flex items-center gap-2 hover:text-accent transition-colors duration-200"
              >
                <Mail className="w-4 h-4" />
                <span>info@stayneos.com</span>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="hover:text-accent transition-colors duration-200"
              >
                登录
              </Link>
              <span className="text-primary-300">|</span>
              <Link 
                href="/register" 
                className="hover:text-accent transition-colors duration-200"
              >
                注册
              </Link>
            </div>
          </div>
        </div>
      )}

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

            {/* CTA Button */}
            <div className="hidden lg:flex items-center gap-4">
              <Button 
                variant="primary" 
                size="md"
                onClick={() => window.location.href = "/properties"}
              >
                浏览房源
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "lg:hidden p-2.5 rounded-lg transition-colors duration-200",
                "hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-accent",
                textStyles[currentVariant]
              )}
              aria-label={isMobileMenuOpen ? "关闭菜单" : "打开菜单"}
              aria-expanded={isMobileMenuOpen}
            >
              <div className="relative w-6 h-6">
                <span
                  className={cn(
                    "absolute left-0 block w-6 h-0.5 bg-current transition-all duration-300",
                    isMobileMenuOpen ? "top-3 rotate-45" : "top-1"
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-3 block w-6 h-0.5 bg-current transition-all duration-300",
                    isMobileMenuOpen ? "opacity-0" : "opacity-100"
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 block w-6 h-0.5 bg-current transition-all duration-300",
                    isMobileMenuOpen ? "top-3 -rotate-45" : "top-5"
                  )}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "lg:hidden absolute top-full left-0 right-0 bg-white shadow-xl transition-all duration-300 overflow-hidden",
            isMobileMenuOpen 
              ? "max-h-[500px] opacity-100 border-t border-neutral-200" 
              : "max-h-0 opacity-0"
          )}
        >
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "block py-3 px-4 text-neutral-700 font-medium transition-all duration-200 rounded-lg",
                  "hover:bg-accent/10 hover:text-primary hover:pl-6"
                )}
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animation: isMobileMenuOpen ? "slideInRight 0.3s ease-out forwards" : "none"
                }}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-neutral-200 space-y-3">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center py-3 text-neutral-700 font-medium hover:bg-neutral-50 rounded-lg transition-colors"
              >
                登录
              </Link>
              <Link
                href="/properties"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center py-3.5 bg-accent text-primary font-semibold rounded-lg hover:bg-accent-600 transition-colors"
              >
                浏览房源
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
