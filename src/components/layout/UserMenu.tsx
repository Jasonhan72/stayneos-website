"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { 
  User, 
  Home, 
  Heart, 
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/UserContext";

interface UserMenuProps {
  variant?: "light" | "dark" | "transparent";
  locale: string;
}

export function UserMenu({ variant = "light", locale }: UserMenuProps) {
  const t = useTranslations('nav');
  const { user, logout, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const textStyles = {
    light: "text-neutral-700 hover:text-neutral-900",
    dark: "text-white/90 hover:text-white",
    transparent: "text-white hover:text-white/80",
  };

  const menuItemStyles = {
    light: "text-neutral-700 hover:bg-neutral-100",
    dark: "text-white/90 hover:bg-white/10",
    transparent: "text-white hover:bg-white/10",
  };

  const menuBgStyles = {
    light: "bg-white border-neutral-200",
    dark: "bg-primary border-primary-dark",
    transparent: "bg-primary border-primary-dark",
  };

  const userInitial = user?.firstName?.[0] || user?.name?.[0] || "U";

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: t('dashboard'),
      href: "/dashboard",
      requiresAuth: true,
    },
    {
      icon: Home,
      label: t('bookings'),
      href: "/dashboard/bookings",
      requiresAuth: true,
    },
    {
      icon: Heart,
      label: t('wishlists'),
      href: "/dashboard/wishlists",
      requiresAuth: true,
    },
    {
      icon: User,
      label: t('profile'),
      href: "/dashboard/profile",
      requiresAuth: true,
    },
    {
      icon: Building2,
      label: t('becomeHost'),
      href: "/become-host",
      requiresAuth: false,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-neutral-200 animate-pulse" />
        <div className="hidden md:block">
          <div className="h-4 w-20 bg-neutral-200 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/login`}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            variant === "dark" || variant === "transparent"
              ? "text-white/90 hover:text-white hover:bg-white/10"
              : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
          )}
        >
          {t('login')}
        </Link>
        <Link
          href={`/${locale}/register`}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-colors"
          )}
        >
          {t('signup')}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2",
          textStyles[variant]
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name || "User"}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <span className="text-primary font-medium">{userInitial}</span>
          )}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium">
            {user.firstName || user.name || "User"}
          </div>
          <div className="text-xs opacity-70">
            {user.role === "HOST" ? t('host') : t('guest')}
          </div>
        </div>
        {isOpen ? (
          <ChevronUp size={16} className="opacity-70" />
        ) : (
          <ChevronDown size={16} className="opacity-70" />
        )}
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute right-0 mt-2 w-56 rounded-lg shadow-lg border py-1 z-50",
            menuBgStyles[variant]
          )}
        >
          <div className="px-4 py-3 border-b border-neutral-200/50">
            <div className="font-medium">{user.name}</div>
            <div className="text-sm opacity-70">{user.email}</div>
          </div>

          <div className="py-1">
            {menuItems.map((item) => {
              if (item.requiresAuth && !user) return null;
              
              return (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 text-sm transition-colors",
                    menuItemStyles[variant]
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon size={16} className="opacity-70" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-neutral-200/50 pt-1">
            <button
              onClick={async () => {
                await logout();
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors",
                menuItemStyles[variant]
              )}
            >
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}