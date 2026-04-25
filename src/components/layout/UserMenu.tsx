"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  MessageCircle,
  Luggage,
  Heart,
  Home,
  UserCog,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/UserContext";
import { useI18n } from "@/lib/i18n";

interface UserMenuProps {
  variant?: "light" | "dark" | "transparent";
}

type MenuLink = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  bold?: boolean;
};

export function UserMenu({ variant = "light" }: UserMenuProps) {
  const { locale } = useI18n();
  const { user, logout, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // i18n helpers (inline, avoid missing key churn)
  const L = (zh: string, en: string, fr: string) =>
    locale === "zh" ? zh : locale === "fr" ? fr : en;

  if (isLoading) {
    return <div className="w-[82px] h-10 rounded-full bg-black/5 animate-pulse" />;
  }

  const isDarkStyle = variant === "dark" || variant === "transparent";
  const isHost =
    user?.role === "HOST" ||
    user?.role === "ADMIN" ||
    user?.role === "SUPER_ADMIN";

  // ===== Not logged in =====
  if (!user) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-3 px-2 pl-3 py-1.5 rounded-full border transition-all duration-200",
            isDarkStyle
              ? "border-white/30 hover:border-white/60 hover:shadow-md"
              : "border-neutral-200 hover:shadow-md hover:border-neutral-300"
          )}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={L("用户菜单", "User menu", "Menu utilisateur")}
        >
          <Menu
            className={cn(
              "w-4 h-4",
              isDarkStyle ? "text-white" : "text-neutral-700"
            )}
          />
          <div
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center",
              isDarkStyle ? "bg-white/20" : "bg-neutral-500"
            )}
          >
            <span className="text-[11px] font-medium text-white">?</span>
          </div>
        </button>

        {isOpen && (
          <div
            className={cn(
              "absolute right-0 mt-2 w-60 py-2 rounded-xl shadow-2xl border border-neutral-200 bg-white z-50",
              "animate-in fade-in slide-in-from-top-2 duration-150"
            )}
          >
            <Link
              href="/register"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
            >
              {L("注册", "Sign up", "Inscription")}
            </Link>
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              {L("登录", "Log in", "Connexion")}
            </Link>
            <div className="border-t border-neutral-200 my-1" />
            <Link
              href="/become-a-host"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              {L("开放您的房源", "List your home", "Mettez votre logement en location")}
            </Link>
            <Link
              href="/help"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              {L("帮助中心", "Help Centre", "Centre d'aide")}
            </Link>
          </div>
        )}
      </div>
    );
  }

  // ===== Logged in =====
  const firstSection: MenuLink[] = [
    {
      label: L("消息", "Messages", "Messages"),
      href: "/dashboard/messages",
      icon: MessageCircle,
      bold: true,
    },
    {
      label: L("我的行程", "Trips", "Voyages"),
      href: "/bookings",
      icon: Luggage,
      bold: true,
    },
    {
      label: L("收藏", "Wishlists", "Favoris"),
      href: "/wishlists",
      icon: Heart,
      bold: true,
    },
  ];

  const hostSection: MenuLink[] = isHost
    ? [
        {
          label: L("切换到房东模式", "Switch to Hosting", "Passer en mode hôte"),
          href: "/host",
          icon: Home,
          bold: true,
        },
      ]
    : [
        {
          label: L("开放您的房源", "List your home", "Mettez votre logement en location"),
          href: "/become-a-host",
          icon: Home,
          bold: true,
        },
      ];

  const thirdSection: MenuLink[] = [
    {
      label: L("账号设置", "Account settings", "Paramètres du compte"),
      href: "/account",
      icon: UserCog,
    },
    {
      label: L("帮助中心", "Help Centre", "Centre d'aide"),
      href: "/help",
      icon: HelpCircle,
    },
  ];

  const userAlt = L("用户头像", "User avatar", "Avatar utilisateur");
  const initials =
    (user.firstName?.[0] || user.email?.[0] || "U").toUpperCase() +
    (user.lastName?.[0] || "").toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-3 px-2 pl-3 py-1.5 rounded-full border transition-all duration-200",
          isDarkStyle
            ? "border-white/30 hover:border-white/60 hover:shadow-md"
            : "border-neutral-200 hover:shadow-md hover:border-neutral-300"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={L("用户菜单", "User menu", "Menu utilisateur")}
      >
        <Menu
          className={cn(
            "w-4 h-4",
            isDarkStyle ? "text-white" : "text-neutral-700"
          )}
        />
        {user.image ? (
          <Image
            src={user.image}
            alt={userAlt}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center">
            <span className="text-xs font-medium text-white">{initials}</span>
          </div>
        )}
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute right-0 mt-2 w-64 py-2 rounded-xl shadow-2xl border border-neutral-200 bg-white z-50",
            "animate-in fade-in slide-in-from-top-2 duration-150"
          )}
        >
          {firstSection.map((item) => (
            <MenuItem key={item.href} item={item} onClick={() => setIsOpen(false)} />
          ))}
          <div className="border-t border-neutral-200 my-1" />
          {hostSection.map((item) => (
            <MenuItem key={item.href} item={item} onClick={() => setIsOpen(false)} />
          ))}
          <div className="border-t border-neutral-200 my-1" />
          {thirdSection.map((item) => (
            <MenuItem key={item.href} item={item} onClick={() => setIsOpen(false)} />
          ))}
          <div className="border-t border-neutral-200 my-1" />
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <LogOut className="w-4 h-4 text-neutral-500" />
            <span>{L("退出登录", "Log out", "Déconnexion")}</span>
          </button>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  item,
  onClick,
}: {
  item: MenuLink;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors",
        item.bold && "font-semibold text-neutral-900"
      )}
    >
      <Icon className="w-4 h-4 text-neutral-500" />
      <span>{item.label}</span>
    </Link>
  );
}
