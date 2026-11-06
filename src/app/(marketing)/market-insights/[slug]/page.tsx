import { Metadata } from "next";
import { getDb } from "@/lib/d1";
import { getServerTranslation, resolveRequestLocale } from "@/lib/i18n-server";
import MarketPostPage from "./MarketPostPage";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await resolveRequestLocale();
  const fallback = {
    title: getServerTranslation(locale, "marketHub.title"),
    description: getServerTranslation(locale, "marketHub.subtitle"),
  };
  try {
    const post = await getDb().prepare(
      "SELECT title, titleZh, titleFr, summary, summaryZh, summaryFr FROM MarketPost WHERE slug = ? AND status = 'PUBLISHED'",
    ).bind(slug).first<Record<string, string | null>>();
    if (!post) return fallback;
    const suffix = locale === "zh" ? "Zh" : locale === "fr" ? "Fr" : "";
    return { title: post["title" + suffix] || post.title || fallback.title, description: post["summary" + suffix] || fallback.description };
  } catch {
    return fallback;
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <MarketPostPage slug={slug} />;
}
