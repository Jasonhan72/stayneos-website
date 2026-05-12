"use client";

import { Fragment, type ReactNode, useState, useEffect } from "react";
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

function getLocalized(post: MarketPost, field: "title" | "summary" | "content", locale: string): { text: string; isTranslated: boolean } {
  const zhKey = `${field}Zh` as keyof MarketPost;
  const frKey = `${field}Fr` as keyof MarketPost;
  
  if (locale === "zh" && post[zhKey]) {
    return { text: post[zhKey] as string, isTranslated: true };
  }
  if (locale === "fr" && post[frKey]) {
    return { text: post[frKey] as string, isTranslated: true };
  }
  
  // Check if translation exists but is empty
  if (locale === "zh" || locale === "fr") {
    return { text: post[field] as string, isTranslated: false };
  }
  
  return { text: post[field] as string, isTranslated: true };
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

function sanitizeExternalUrl(url: string): string | null {
  try {
    const parsed = new URL(url, "https://www.stayneos.com");
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean).map((part, index) => {
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) return <strong key={index}>{boldMatch[1]}</strong>;

    const italicMatch = part.match(/^\*([^*]+)\*$/);
    if (italicMatch) return <em key={index}>{italicMatch[1]}</em>;

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const safeUrl = sanitizeExternalUrl(linkMatch[2]);
      if (!safeUrl) return <Fragment key={index}>{linkMatch[1]}</Fragment>;
      return (
        <a
          key={index}
          href={safeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:underline"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return <Fragment key={index}>{part}</Fragment>;
  });
}

function renderContent(text: string): ReactNode[] {
  const elements: ReactNode[] = [];
  const paragraphLines: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (!paragraphLines.length) return;
    elements.push(
      <p key={`p-${elements.length}`} className="text-gray-700 leading-relaxed mb-4">
        {renderInline(paragraphLines.join(" "))}
      </p>
    );
    paragraphLines.length = 0;
  };

  const flushList = () => {
    if (!listType || !listItems.length) return;
    const Tag = listType;
    elements.push(
      <Tag
        key={`list-${elements.length}`}
        className={listType === "ul" ? "mb-4 ml-6 list-disc text-gray-700" : "mb-4 ml-6 list-decimal text-gray-700"}
      >
        {listItems.map((item, index) => (
          <li key={index} className="mb-2">
            {renderInline(item)}
          </li>
        ))}
      </Tag>
    );
    listType = null;
    listItems = [];
  };

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    const unorderedMatch = line.match(/^- (.+)$/);
    const orderedMatch = line.match(/^\d+\. (.+)$/);

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      elements.push(
        <h3 key={`h3-${elements.length}`} className="text-xl font-bold text-gray-900 mt-8 mb-3">
          {renderInline(line.slice(4))}
        </h3>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      elements.push(
        <h2 key={`h2-${elements.length}`} className="text-2xl font-bold text-gray-900 mt-10 mb-4">
          {renderInline(line.slice(3))}
        </h2>
      );
      continue;
    }

    if (line.startsWith("# ")) {
      flushParagraph();
      flushList();
      elements.push(
        <h1 key={`h1-${elements.length}`} className="text-3xl font-bold text-gray-900 mt-10 mb-4">
          {renderInline(line.slice(2))}
        </h1>
      );
      continue;
    }

    if (unorderedMatch) {
      flushParagraph();
      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }
      listItems.push(unorderedMatch[1]);
      continue;
    }

    if (orderedMatch) {
      flushParagraph();
      if (listType !== "ol") {
        flushList();
        listType = "ol";
      }
      listItems.push(orderedMatch[1]);
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();
  return elements;
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

  const titleResult = getLocalized(post, "title", locale);
  const contentResult = getLocalized(post, "content", locale);
  const title = titleResult.text;
  const content = contentResult.text;
  const isContentTranslated = contentResult.isTranslated;
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
            {!isContentTranslated && (locale === "zh" || locale === "fr") && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  {locale === "zh" 
                    ? "⚠️ 此内容尚未翻译为中文。显示的是英文原文。"
                    : "⚠️ Ce contenu n'est pas encore traduit en français. L'original anglais est affiché."
                  }
                </p>
              </div>
            )}
            
            <div className="prose prose-lg max-w-none">{renderContent(content)}</div>

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
