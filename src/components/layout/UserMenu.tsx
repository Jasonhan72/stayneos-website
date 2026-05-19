"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  Globe,
  HelpCircle,
  Heart,
  Home,
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
  badge?: number;
};

export function UserMenu({ variant = "light" }: UserMenuProps) {
  const { locale, t } = useI18n();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
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

  useEffect(() => {
    if (!user) {
      setUnreadMessages(0);
      return;
    }
    const readCached = () => {
      const cached = Number(window.localStorage.getItem("stayneos_unread_messages") || "0");
      if (Number.isFinite(cached)) setUnreadMessages(cached);
    };
    const refresh = async () => {
      try {
        const res = await fetch("/api/conversations", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const count = Number(data.unreadCount || 0);
        setUnreadMessages(count);
        window.localStorage.setItem("stayneos_unread_messages", String(count));
      } catch {}
    };
    const onUnread = (event: Event) => {
      const detail = (event as CustomEvent<{ count?: number }>).detail;
      setUnreadMessages(Number(detail?.count || 0));
    };
    readCached();
    refresh();
    window.addEventListener("stayneos:unread-messages", onUnread);
    const id = window.setInterval(refresh, 30000);
    return () => {
      window.removeEventListener("stayneos:unread-messages", onUnread);
      window.clearInterval(id);
    };
  }, [user]);

  const L = (zh: string, en: string, fr: string) =>
    locale === "zh" ? zh : locale === "fr" ? fr : en;

  const isDarkStyle = variant === "dark" || variant === "transparent";

  // SSR-safe: no skeleton — always render Sign Up / Log In when no user
  // (covers both SSR initial render and client-side unauthenticated state)
  if (!user) {
    return (
      <div className="flex items-center gap-1" ref={menuRef}>
        <Link
          href="/register"
          className={cn(
            "text-sm font-medium px-3 py-2 rounded-full transition-all duration-200",
            isDarkStyle
              ? "text-white/90 hover:text-white hover:bg-white/10"
              : "text-neutral-700 hover:text-neutral-900 hover:bg-black/5"
          )}
        >
          {L("注册", "Sign Up", "Inscription")}
        </Link>
        <Link
          href="/login"
          className={cn(
            "text-sm font-medium px-3 py-2 rounded-full transition-all duration-200",
            isDarkStyle
              ? "text-white/90 hover:text-white hover:bg-white/10"
              : "text-neutral-700 hover:text-neutral-900 hover:bg-black/5"
          )}
        >
          {L("登录", "Log In", "Connexion")}
        </Link>
      </div>
    );
  }

  const isHost = !!(user && ["ADMIN", "SUPER_ADMIN", "HOST"].includes((user as { role?: string }).role ?? ""));
  const isHostMode = pathname?.startsWith("/host");

  const hostSwitchItem: MenuLink = isHost
    ? {
        label: isHostMode
          ? t("nav.switchToTravelling")
          : t("nav.switchToHosting"),
        href: isHostMode ? "/" : "/host",
        icon: isHostMode ? Luggage : Home,
        bold: true,
      }
    : {
        label: t("nav.becomeAHost"),
        href: "/become-a-host",
        icon: Home,
        bold: true,
      };

  const sections: MenuLink[][] = [
    [
      { label: L("消息", "Messages", "Messages"), href: "/dashboard/messages", icon: MessageCircle, bold: true, badge: unreadMessages },
      { label: L("我的行程", "Trips", "Voyages"), href: "/bookings", icon: Luggage, bold: true },
      { label: L("收藏", "Wishlists", "Favoris"), href: "/dashboard/wishlists", icon: Heart, bold: true },
    ],
    [
      hostSwitchItem,
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
            onClick={async () => {
              setIsOpen(false);
              await logout();
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
      <span className="relative">
        <Icon className="h-5 w-5 text-neutral-600" />
        {item.badge ? <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#FF385C] ring-2 ring-white" /> : null}
      </span>
      <span className={item.bold ? "flex-1 font-semibold" : "flex-1 font-medium"}>{item.label}</span>
      {item.badge ? <span className="rounded-full bg-[#FF385C] px-2 py-0.5 text-xs font-bold text-white">{item.badge}</span> : null}
      <ChevronRight className="h-4 w-4 text-neutral-400" />
    </Link>
  );
}
