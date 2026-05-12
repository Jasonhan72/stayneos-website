"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Globe,
  HelpCircle,
  Heart,
  LogOut,
  Luggage,
  Menu,
  MessageCircle,
  User,
  UserCog,
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

  const L = (zh: string, en: string, fr: string) =>
    locale === "zh" ? zh : locale === "fr" ? fr : en;

  if (isLoading) {
    return <div className="h-10 w-[82px] animate-pulse rounded-full bg-black/5" />;
  }

  const isDarkStyle = variant === "dark" || variant === "transparent";
    if (!user) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-3 rounded-full border px-2 py-1.5 pl-3 transition-all duration-200",
            isDarkStyle
              ? "border-white/30 hover:border-white/60 hover:shadow-md"
              : "border-neutral-200 hover:border-neutral-300 hover:shadow-md"
          )}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={L("用户菜单", "User menu", "Menu utilisateur")}
        >
          <Menu className={cn("h-4 w-4", isDarkStyle ? "text-white" : "text-neutral-700")} />
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full",
              isDarkStyle ? "bg-white/20" : "bg-neutral-500"
            )}
          >
            <span className="text-[11px] font-medium text-white">?</span>
          </div>
        </button>

        {isOpen && (
          <div
            className={cn(
              "animate-in slide-in-from-top-2 absolute right-0 z-50 mt-2 w-60 rounded-xl border border-neutral-200 bg-white py-2 shadow-2xl fade-in duration-150"
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
            <div className="my-1 border-t border-neutral-200" />
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

  const sections: MenuLink[][] = [
    [
      { label: L("消息", "Messages", "Messages"), href: "/dashboard/messages", icon: MessageCircle, bold: true },
      { label: L("我的行程", "Trips", "Voyages"), href: "/bookings", icon: Luggage, bold: true },
      { label: L("收藏", "Wishlists", "Favoris"), href: "/wishlists", icon: Heart, bold: true },
    ],
    [
      { label: L("个人主页", "Profile", "Profil"), href: "/profile", icon: User },
      { label: L("账号设置", "Account settings", "Paramètres du compte"), href: "/account/personal-info", icon: UserCog },
      { label: L("语言与货币", "Languages & currency", "Langues et devise"), href: "/account/preferences", icon: Globe },
      { label: L("帮助中心", "Help Centre", "Centre d'aide"), href: "/help", icon: HelpCircle },
    ],
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
          "flex items-center gap-3 rounded-full border px-2 py-1.5 pl-3 transition-all duration-200",
          isDarkStyle
            ? "border-white/30 hover:border-white/60 hover:shadow-md"
            : "border-neutral-200 hover:border-neutral-300 hover:shadow-md"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={L("用户菜单", "User menu", "Menu utilisateur")}
      >
        <Menu className={cn("h-4 w-4", isDarkStyle ? "text-white" : "text-neutral-700")} />
        {user.image ? (
          <Image
            src={user.image}
            alt={userAlt}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900">
            <span className="text-xs font-medium text-white">{initials}</span>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="animate-in slide-in-from-top-2 absolute right-0 z-50 mt-3 w-[320px] rounded-[24px] border border-neutral-200 bg-white py-3 shadow-[0_20px_50px_rgba(0,0,0,0.18)] fade-in duration-150">
          {sections.map((section, idx) => (
            <div key={idx}>
              {section.map((item) => (
                <MenuItem key={item.href} item={item} onClick={() => setIsOpen(false)} />
              ))}
              {idx < sections.length - 1 ? <div className="my-2 border-t border-neutral-200" /> : null}
            </div>
          ))}
          <div className="my-2 border-t border-neutral-200" />
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="flex min-h-[56px] w-full items-center gap-4 px-5 text-left text-[15px] text-neutral-900 transition-colors hover:bg-neutral-50"
          >
            <LogOut className="h-5 w-5 text-neutral-600" />
            <span className="flex-1 font-medium">{L("退出登录", "Log out", "Déconnexion")}</span>
            <ChevronRight className="h-4 w-4 text-neutral-400" />
          </button>
        </div>
      )}
    </div>
  );
}

function MenuItem({ item, onClick }: { item: MenuLink; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} onClick={onClick} className="flex min-h-[56px] items-center gap-4 px-5 text-[15px] text-neutral-900 transition-colors hover:bg-neutral-50">
      <Icon className="h-5 w-5 text-neutral-600" />
      <span className={item.bold ? "flex-1 font-semibold" : "flex-1 font-medium"}>{item.label}</span>
      <ChevronRight className="h-4 w-4 text-neutral-400" />
    </Link>
  );
}
