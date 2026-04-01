"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Container, Section } from "@/components/ui";
import { ArrowLeft, Calendar, Eye, ExternalLink, Loader2, Tag } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface MarketPost {
  id: string;
  title: string;
  titleZh?: string;
  titleFr?: string;
  slug: string;
  summary?: string;
  summaryZh?: string;
  summaryFr?: string;
  content: string;
  contentZh?: string;
  contentFr?: string;
  category: string;
  tags?: string;
  source?: string;
  sourceUrl?: string;
  coverImage?: string;
  authorName: string;
  authorAvatar?: string;
  viewCount: number;
  publishedAt: string;
  createdAt: string;
}

function getLocalized(post: MarketPost, field: "title" | "summary" | "content", locale: string): string {
  const zhKey = `${field}Zh` as keyof MarketPost;
  const frKey = `${field}Fr` as keyof MarketPost;
  if (locale === "zh" && post[zhKey]) return post[zhKey] as string;
  if (locale === "fr" && post[frKey]) return post[frKey] as string;
  return post[field] as string;
}

function formatDate(dateStr: string, locale: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(
      locale === "zh" ? "zh-CN" : locale === "fr" ? "fr-CA" : "en-CA",
      { year: "numeric", month: "long", day: "numeric" }
    );
  } catch {
    return dateStr;
  }
}

// Simple markdown-like rendering (bold, links, headers, lists)
function renderContent(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-gray-900 mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-4">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-gray-900 mt-10 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-indigo-600 hover:underline">$1</a>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-gray-700">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-gray-700">$2</li>')
    .replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed mb-4">')
    .replace(/\n/g, '<br/>');
}

export default function MarketPostPage({ slug }: { slug: string }) {
  const { t, locale } = useI18n();
  const [post, setPost] = useState<MarketPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/market-posts/${slug}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setPost(data);
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("marketHub.notFound", "Post not found")}</h2>
          <Link href="/market-insights" className="text-indigo-600 hover:underline">
            {t("marketHub.backToHub", "← Back to Market Insights")}
          </Link>
        </div>
      </div>
    );
  }

  const title = getLocalized(post, "title", locale);
  const content = getLocalized(post, "content", locale);
  const parsedTags: string[] = post.tags ? (() => { try { return JSON.parse(post.tags); } catch { return []; } })() : [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Section className="relative py-16 bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 text-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <Link
              href="/market-insights"
              className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              {t("marketHub.backToHub", "Back to Market Insights")}
            </Link>

            <div className="flex items-center gap-2 text-sm text-blue-200 mb-4">
              <span className="px-2.5 py-1 bg-white/15 rounded-full font-medium">
                {post.category.replace("-", " ")}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(post.publishedAt, locale)}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {post.viewCount} {t("marketHub.views", "views")}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">{title}</h1>

            <div className="flex items-center gap-3 text-blue-100 text-sm">
              <span>{post.authorName}</span>
              {post.source && (
                <>
                  <span>·</span>
                  {post.sourceUrl ? (
                    <a
                      href={post.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-white"
                    >
                      {post.source} <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span>{post.source}</span>
                  )}
                </>
              )}
            </div>
          </div>
        </Container>
      </Section>

      {/* Content */}
      <Section className="py-12">
        <Container>
          <article className="max-w-4xl mx-auto">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{
                __html: `<p class="text-gray-700 leading-relaxed mb-4">${renderContent(content)}</p>`,
              }}
            />

            {/* Tags */}
            {parsedTags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag size={16} className="text-gray-400" />
                  {parsedTags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Source */}
            {post.sourceUrl && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <a
                  href={post.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  <ExternalLink size={16} />
                  {t("marketHub.viewSource", "View original source")}
                </a>
              </div>
            )}

            {/* Back link */}
            <div className="mt-10 pt-6 border-t border-gray-200">
              <Link
                href="/market-insights"
                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <ArrowLeft size={16} />
                {t("marketHub.backToHub", "Back to Market Insights")}
              </Link>
            </div>
          </article>
        </Container>
      </Section>
    </div>
  );
}
