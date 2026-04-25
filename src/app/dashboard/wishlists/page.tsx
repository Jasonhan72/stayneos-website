"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default function WishlistsPage() {
  const { locale } = useI18n();
  const L = (z: string, e: string, f: string) =>
    locale === "zh" ? z : locale === "fr" ? f : e;

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-8">
          {L("收藏", "Wishlists", "Favoris")}
        </h1>
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-12 text-center">
          <Heart className="mx-auto mb-3 w-6 h-6 text-neutral-400" />
          <p className="text-sm text-neutral-600 mb-4">
            {L(
              "还没有收藏的房源。在房源页点击心形图标即可收藏。",
              "You haven't saved any homes yet. Tap the heart icon on any listing to save it here.",
              "Vous n'avez encore enregistré aucun logement. Touchez l'icône en forme de cœur pour en enregistrer un."
            )}
          </p>
          <Link
            href="/properties"
            className="inline-flex items-center rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            {L("浏览房源", "Browse homes", "Parcourir les logements")}
          </Link>
        </div>
      </div>
    </main>
  );
}
