"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Container, Section } from "@/components/ui";
import {
  BarChart3,
  Calendar,
  ChevronRight,
  Eye,
  FileText,
  Loader2,
  Search,
  Tag,
  TrendingUp,
} from "lucide-react";
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
  category: string;
  tags?: string;
  source?: string;
  coverImage?: string;
  authorName: string;
  viewCount: number;
  publishedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const CATEGORIES = [
  { key: "all", labelKey: "marketHub.catAll", default: "All" },
  { key: "market-report", labelKey: "marketHub.catReport", default: "Market Reports" },
  { key: "trreb", labelKey: "marketHub.catTrreb", default: "TRREB Data" },
  { key: "rental-trends", labelKey: "marketHub.catRental", default: "Rental Trends" },
  { key: "neighborhood", labelKey: "marketHub.catNeighborhood", default: "Neighborhoods" },
  { key: "investment", labelKey: "marketHub.catInvestment", default: "Investment" },
  { key: "news", labelKey: "marketHub.catNews", default: "Industry News" },
];

const CATEGORY_ICONS: Record<string, typeof FileText> = {
  "market-report": BarChart3,
  trreb: FileText,
  "rental-trends": TrendingUp,
  neighborhood: Tag,
  investment: TrendingUp,
  news: FileText,
};

function formatDate(dateStr: string, locale: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "zh" ? "zh-CN" : locale === "fr" ? "fr-CA" : "en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getLocalizedField(post: MarketPost, field: "title" | "summary", locale: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = post as any;
  if (locale === "zh") return p[`${field}Zh`] || p[field] || "";
  if (locale === "fr") return p[`${field}Fr`] || p[field] || "";
  return p[field] || "";
}

export default function MarketInsightsHub() {
  const { t, locale } = useI18n();
  const [posts, setPosts] = useState<MarketPost[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const fetchPosts = useCallback(async (p: number, category: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: "12" });
      if (category !== "all") params.set("category", category);
      const res = await fetch(`/api/market-posts?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPosts(data.posts || []);
      setPagination(data.pagination || null);
    } catch {
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(page, activeCategory);
  }, [page, activeCategory, fetchPosts]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setPage(1);
  };

  // Filter by search locally
  const filteredPosts = searchQuery
    ? posts.filter((post) => {
        const title = getLocalizedField(post, "title", locale).toLowerCase();
        const summary = getLocalizedField(post, "summary", locale).toLowerCase();
        const q = searchQuery.toLowerCase();
        return title.includes(q) || summary.includes(q);
      })
    : posts;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <Section className="relative py-20 bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              {t("marketHub.title", "Market Insights Hub")}
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {t("marketHub.subtitle", "Toronto real estate market reports, TRREB data analysis, rental trends, and investment insights. Updated regularly.")}
            </p>

            {/* Search */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("marketHub.searchPlaceholder", "Search reports and insights...")}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/95 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-accent shadow-lg"
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* Category tabs */}
      <Section className="py-0 bg-white border-b border-gray-200 sticky top-0 z-20">
        <Container>
          <div className="flex overflow-x-auto gap-1 py-3 scrollbar-none -mx-4 px-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => handleCategoryChange(cat.key)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.key
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t(cat.labelKey, cat.default)}
              </button>
            ))}
          </div>
        </Container>
      </Section>

      {/* Posts grid */}
      <Section className="py-12">
        <Container>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <FileText size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {t("marketHub.noPosts", "No reports yet")}
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {t("marketHub.noPostsDesc", "Market reports and TRREB data analysis will appear here as they are published. Check back soon!")}
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => {
                  const CategoryIcon = CATEGORY_ICONS[post.category] || FileText;
                  const parsedTags: string[] = post.tags ? (() => { try { return JSON.parse(post.tags); } catch { return []; } })() : [];

                  return (
                    <Link
                      key={post.id}
                      href={`/market-insights/${post.slug}`}
                      className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 hover:border-indigo-200"
                    >
                      {/* Cover image or colored header */}
                      {post.coverImage ? (
                        <div
                          className="h-44 bg-cover bg-center"
                          style={{ backgroundImage: `url(${post.coverImage})` }}
                        />
                      ) : (
                        <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <CategoryIcon size={40} className="text-white/60" />
                        </div>
                      )}

                      <div className="p-5">
                        {/* Category + Date */}
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-medium">
                            {post.category.replace("-", " ")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(post.publishedAt, locale)}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {getLocalizedField(post, "title", locale)}
                        </h3>

                        {/* Summary */}
                        <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                          {getLocalizedField(post, "summary", locale)}
                        </p>

                        {/* Tags */}
                        {parsedTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {parsedTags.slice(0, 3).map((tag: string) => (
                              <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            <span>{post.authorName}</span>
                            {post.source && <span>· {post.source}</span>}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye size={12} />
                            <span>{post.viewCount}</span>
                            <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
                  >
                    {t("common.prev", "Previous")}
                  </button>
                  <span className="text-sm text-gray-500 px-3">
                    {page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                    disabled={page >= pagination.totalPages}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
                  >
                    {t("common.next", "Next")}
                  </button>
                </div>
              )}
            </>
          )}
        </Container>
      </Section>
    </div>
  );
}
