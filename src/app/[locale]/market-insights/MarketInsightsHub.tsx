'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, TrendingUp, FileText, BarChart3, Globe, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// 模拟文章数据
const mockPosts = [
  {
    id: 'mp_1775086977540_27kja0',
    title: 'Toronto Condo Market Report Q1 2026: Rental Demand Up 12%',
    titleZh: '多伦多公寓市场报告 2026年第一季度：租赁需求增长12%',
    titleFr: 'Rapport sur le marché des condos de Toronto T1 2026 : La demande locative augmente de 12 %',
    slug: 'toronto-condo-market-report-q1-2026-rental-demand-up-12-1775086',
    summary: 'Toronto condo rental market shows strong demand with 12% year-over-year growth. Average rent for 1-bedroom condos reaches $2,850 in downtown core.',
    summaryZh: '多伦多公寓租赁市场需求强劲，同比增长12%。市中心一居室公寓平均租金达到2,850加元。',
    summaryFr: 'Le marché locatif des condos de Toronto montre une forte demande avec une croissance de 12 % en glissement annuel. Le loyer moyen des condos 1 chambre atteint 2 850 $ dans le centre-ville.',
    category: 'rental-trends',
    tags: '["Condo", "Rental", "Toronto", "Q1 2026", "Market Report"]',
    source: 'NEOS Research',
    publishedAt: '2026-03-15T10:30:00Z',
    readTime: '5 min',
    views: 1245,
  },
  // 更多文章...
];

const CATEGORY_ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  'rental-trends': TrendingUp,
  'market-reports': BarChart3,
  'investment': Globe,
  'policy': FileText,
  'neighborhoods': Calendar,
};

const CATEGORY_COLORS: Record<string, string> = {
  'rental-trends': 'bg-blue-100 text-blue-800',
  'market-reports': 'bg-green-100 text-green-800',
  'investment': 'bg-purple-100 text-purple-800',
  'policy': 'bg-amber-100 text-amber-800',
  'neighborhoods': 'bg-pink-100 text-pink-800',
};

export default function MarketInsightsHub() {
  const t = useTranslations('marketInsights');
  const [posts, _setPosts] = useState<typeof mockPosts>(mockPosts);
  const [filteredPosts, setFilteredPosts] = useState<typeof mockPosts>(mockPosts);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const categories = [
    { id: 'all', name: t('categories.all') },
    { id: 'rental-trends', name: t('categories.rentalTrends') },
    { id: 'market-reports', name: t('categories.marketReports') },
    { id: 'investment', name: t('categories.investment') },
    { id: 'policy', name: t('categories.policy') },
    { id: 'neighborhoods', name: t('categories.neighborhoods') },
  ];

  // 过滤文章
  useEffect(() => {
    let filtered = [...posts];
    
    // 按类别过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }
    
    // 按搜索词过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.summary.toLowerCase().includes(query) ||
        (post.tags && JSON.parse(post.tags).some((tag: string) => 
          tag.toLowerCase().includes(query)
        ))
      );
    }
    
    setFilteredPosts(filtered);
  }, [posts, selectedCategory, searchQuery]);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      // 这里应该调用实际的 API
      // const res = await fetch(`/api/market-posts`);
      // const data = await res.json();
      // setPosts(data.posts || []);
      
      // 暂时使用模拟数据
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-white/90 mb-8">
              {t('hero.subtitle')}
            </p>
            <div className="relative max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={t('search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Category Filters */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  selectedCategory === category.id
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('stats.totalReports')}</p>
                <p className="text-3xl font-bold mt-2">42</p>
              </div>
              <FileText className="text-primary" size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('stats.monthlyGrowth')}</p>
                <p className="text-3xl font-bold mt-2">+12%</p>
              </div>
              <TrendingUp className="text-green-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('stats.avgRent')}</p>
                <p className="text-3xl font-bold mt-2">$2,850</p>
              </div>
              <BarChart3 className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('stats.activeListings')}</p>
                <p className="text-3xl font-bold mt-2">1,247</p>
              </div>
              <Globe className="text-purple-500" size={24} />
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500">{t('loading')}</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">{t('noPosts')}</h3>
            <p className="mt-2 text-gray-500">{t('noPostsDesc')}</p>
          </div>
        ) : (
          <>
            <div className="mb-8 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {t('recentReports')} ({filteredPosts.length})
              </h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                <Download size={18} />
                {t('downloadAll')}
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => {
                const CategoryIcon = CATEGORY_ICONS[post.category] || FileText;
                const parsedTags: string[] = post.tags ? (() => {
                  try { return JSON.parse(post.tags); } catch { return []; }
                })() : [];

                return (
                  <Link
                    key={post.id}
                    href={`/market-insights/${post.slug}`}
                    className="group block"
                  >
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow h-full">
                      {/* Category Badge */}
                      <div className="p-6 pb-0">
                        <span className={cn(
                          "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium",
                          CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-800'
                        )}>
                          <CategoryIcon className="w-3 h-3" />
                          {categories.find(c => c.id === post.category)?.name || post.category}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {post.summary}
                        </p>

                        {/* Tags */}
                        {parsedTags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {parsedTags.slice(0, 3).map((tag: string) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {parsedTags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{parsedTags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Meta */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <span>{post.source}</span>
                            <span>•</span>
                            <span>{post.readTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>{post.views.toLocaleString()} views</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </span>
                          <span className="text-primary font-medium text-sm group-hover:underline">
                            {t('readMore')} →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* Newsletter Section */}
        <div className="mt-16 bg-gradient-to-r from-primary/10 to-primary-dark/10 rounded-2xl p-8 md:p-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('newsletter.title')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('newsletter.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder={t('newsletter.placeholder')}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium">
                {t('newsletter.subscribe')}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              {t('newsletter.privacy')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}