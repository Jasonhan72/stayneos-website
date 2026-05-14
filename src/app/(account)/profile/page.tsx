"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Shield, Star, MapPin, Briefcase, MessageCircle, Pencil } from "lucide-react";
import { useAuth } from "@/lib/context/UserContext";
import { useI18n } from "@/lib/i18n";

export default function ProfilePage() {
  const { locale } = useI18n();
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const L = (zh: string, en: string, fr: string) =>
    locale === "zh" ? zh : locale === "fr" ? fr : en;

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent("/profile")}`);
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="h-10 w-1/3 animate-pulse rounded-md bg-neutral-100" />
        <div className="mt-8 h-64 animate-pulse rounded-2xl bg-neutral-100" />
      </div>
    );
  }

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.name ||
    user.email.split("@")[0];

  const initials =
    (user.firstName?.[0] || user.email?.[0] || "U").toUpperCase() +
    (user.lastName?.[0] || "").toUpperCase();

  const memberSinceLabel = user.memberSince
    ? new Date(user.memberSince).toLocaleDateString(
        locale === "zh" ? "zh-CN" : locale === "fr" ? "fr-CA" : "en-CA",
        { year: "numeric", month: "long" }
      )
    : null;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 md:py-16">
      {/* Header */}
      <header className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-5">
          {user.image || user.avatar ? (
            <Image
              src={(user.image || user.avatar) as string}
              alt={displayName}
              width={104}
              height={104}
              className="h-24 w-24 rounded-full object-cover md:h-28 md:w-28"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-neutral-900 md:h-28 md:w-28">
              <span className="text-3xl font-medium text-white">{initials}</span>
            </div>
          )}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
              {displayName}
            </h1>
            {memberSinceLabel ? (
              <p className="mt-1 text-sm text-neutral-500">
                {L(`${memberSinceLabel} 加入`, `Joined ${memberSinceLabel}`, `Membre depuis ${memberSinceLabel}`)}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {user.role && user.role !== "USER" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                  <Star size={12} className="fill-amber-500" />
                  {user.role}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                <Shield size={12} />
                {L("身份已验证", "Verified", "Vérifié")}
              </span>
            </div>
          </div>
        </div>
        <Link
          href="/account/personal-info"
          className="inline-flex items-center gap-2 self-start rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
        >
          <Pencil size={14} />
          {L("编辑资料", "Edit profile", "Modifier le profil")}
        </Link>
      </header>

      {/* Bio */}
      <section className="mt-10 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              {L("关于我", "About me", "À propos de moi")}
            </h2>
            {user.bio ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                {user.bio}
              </p>
            ) : (
              <p className="mt-3 text-sm italic text-neutral-500">
                {L(
                  "还没有添加简介。点击编辑资料让其他人了解你。",
                  "No bio yet. Edit your profile to tell others about yourself.",
                  "Pas encore de bio. Modifiez votre profil pour vous présenter."
                )}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              {L("身份与认证", "Identity & verification", "Identité & vérification")}
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700">
              <li className="flex items-center justify-between">
                <span>{L("邮箱", "Email", "Courriel")}</span>
                <span className="text-emerald-700">
                  {user.email}
                </span>
              </li>
              {user.phone ? (
                <li className="flex items-center justify-between">
                  <span>{L("电话", "Phone", "Téléphone")}</span>
                  <span className="text-neutral-900">{user.phone}</span>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-neutral-900">
              {L("快捷操作", "Quick actions", "Actions rapides")}
            </h3>
            <div className="mt-3 space-y-2 text-sm">
              <Link
                href="/dashboard/messages"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-neutral-700 transition hover:bg-neutral-50"
              >
                <MessageCircle size={14} />
                {L("我的消息", "My messages", "Mes messages")}
              </Link>
              <Link
                href="/bookings"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-neutral-700 transition hover:bg-neutral-50"
              >
                <Briefcase size={14} />
                {L("我的行程", "My trips", "Mes voyages")}
              </Link>
              <Link
                href="/dashboard/wishlists"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-neutral-700 transition hover:bg-neutral-50"
              >
                <MapPin size={14} />
                {L("我的收藏", "Wishlists", "Favoris")}
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
