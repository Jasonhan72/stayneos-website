import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import SearchBar from "@/components/ui/SearchBar";
import PropertyCard from "@/components/property/PropertyCard";
import { getFeaturedProperties } from "@/lib/data";
import { ArrowRight, Shield, Clock, Award, Headphones } from "lucide-react";
import Link from "next/link";
import {
  OrganizationSchema,
  WebSiteSchema,
  LocalBusinessSchema,
  BreadcrumbSchema,
} from "@/components/seo/StructuredData";

export default function Home() {
  const featuredProperties = getFeaturedProperties();

  const features = [
    {
      icon: Shield,
      title: "品质保障",
      description: "严选高端房源，确保每一处细节都符合您的期望",
    },
    {
      icon: Clock,
      title: "灵活租期",
      description: "支持短租、长租，灵活满足不同出行需求",
    },
    {
      icon: Award,
      title: "专业服务",
      description: "24小时管家服务，让您的居住体验更加舒适",
    },
    {
      icon: Headphones,
      title: "全天候支持",
      description: "专业客服团队随时为您解决任何问题",
    },
  ];

  return (
    <>
      {/* Structured Data */}
      <OrganizationSchema />
      <WebSiteSchema />
      <LocalBusinessSchema />
      <BreadcrumbSchema
        items={[{ name: "首页", item: "https://stayneos.com" }]}
      />

      <main id="main-content" className="min-h-screen">
        <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center" aria-label="主页横幅">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80"
            alt="豪华公寓内部"
            fill
            priority
            quality={80}
            sizes="100vw"
            className="object-cover"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvL0A9Ljo7Ujo4P0ZDS0dMTU5PUVVDWkRHQ11VT0tUVVZfW//2wBDAR..."
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              尊享高端行政公寓
              <br />
              <span className="text-amber-400">开启品质生活</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              专为商务人士打造的高端行政公寓平台，提供优质的居住体验和贴心的管家服务
            </p>
          </div>

          <SearchBar />
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 rounded-full border-2 border-white/50 flex justify-center pt-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">为什么选择 StayNeos</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              我们致力于为每一位客户提供卓越的居住体验，从房源筛选到入住服务，每一个细节都精心打磨
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-2xl flex items-center justify-center" aria-hidden="true">
                  <feature.icon className="text-blue-600" size={28} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-20 bg-amber-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">精选房源</h2>
              <p className="text-lg text-gray-600 max-w-xl">
                精心挑选的高端行政公寓，每一处都是品质生活的体现
              </p>
            </div>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors mt-4 md:mt-0"
            >
              查看全部房源
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">准备好开启您的品质生活了吗？</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
              立即注册成为会员，享受专属优惠和个性化服务
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/properties" className="px-8 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900">
                开始探索
              </Link>
              <button className="px-8 py-3 border border-white/30 text-white rounded-lg font-medium hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-slate-900" aria-label="联系我们">
                联系我们
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950" role="contentinfo">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">StayNeos</h3>
              <p className="text-gray-400 text-sm">
                高端行政公寓出租平台，为您提供优质的居住体验
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">关于我们</h4>
              <ul className="space-y-2 text-sm text-gray-400" role="list">
                <li><a href="#" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded">公司介绍</a></li>
                <li><a href="#" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded">团队成员</a></li>
                <li><a href="#" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded">加入我们</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">客户服务</h4>
              <ul className="space-y-2 text-sm text-gray-400" role="list">
                <li><a href="#" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded">帮助中心</a></li>
                <li><a href="#" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded">联系我们</a></li>
                <li><a href="#" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded">常见问题</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">关注我们</h4>
              <ul className="space-y-2 text-sm text-gray-400" role="list">
                <li><a href="#" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded">微信公众号</a></li>
                <li><a href="#" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded">微博</a></li>
                <li><a href="#" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded">小红书</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} StayNeos. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
    </>
  );
}
