/**
 * AB-001 Design Token Preview Page
 *
 * 内部预览页：对比旧 PropertyCard 与新 AirbnbListingCard
 * 路径：/airbnb-preview
 *
 * 不在导航/sitemap 中暴露，仅供 Neos/Nova 设计验收用。
 */

"use client";

import PropertyCard, { Property } from "@/components/property/PropertyCard";
import AirbnbListingCard from "@/components/property/AirbnbListingCard";
import ResponsiveImage from "@/components/ui/ResponsiveImage";

const DEMO: Property[] = [
  {
    id: "1",
    title: "Cooper at 55 — Penthouse Condo with Lake Views",
    titleZh: "Cooper at 55 — 湖景顶层公寓",
    location: "CityPlace, Toronto",
    price: 12500,
    priceUnit: "Month",
    rating: 4.97,
    reviewCount: 86,
    images: ["/images/cooper-55-c5e8357d.jpg"],
    maxGuests: 4,
    area: 1450,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ["Lake view", "Gym", "Pool"],
    featured: true,
  },
  {
    id: "2",
    title: "ICE Condo with King-size Bed & CN Tower View",
    location: "Downtown, Toronto",
    price: 8200,
    priceUnit: "Month",
    rating: 4.88,
    reviewCount: 142,
    images: ["/images/simcoe-238-2.jpg"],
    maxGuests: 3,
    area: 980,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["CN Tower view"],
  },
  {
    id: "3",
    title: "Yorkville Boutique Suite — Designer Furnishings",
    location: "Yorkville, Toronto",
    price: 6500,
    priceUnit: "Month",
    rating: 4.91,
    reviewCount: 64,
    images: ["/images/simcoe-238-3.jpg"],
    maxGuests: 2,
    area: 720,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["Concierge"],
  },
  {
    id: "4",
    title: "Lakeshore Loft with Floor-to-Ceiling Windows",
    location: "Harbourfront, Toronto",
    price: 7400,
    priceUnit: "Month",
    rating: 4.83,
    reviewCount: 51,
    images: ["/images/simcoe-238-kitchen.jpg"],
    maxGuests: 4,
    area: 1180,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ["Lakefront"],
  },
];

export default function AirbnbPreviewPage() {
  return (
    <main className="container-custom py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-neutral-900">AB-001 Design Preview</h1>
        <p className="mt-2 text-neutral-600">
          对比旧 PropertyCard 与新 AirbnbListingCard。新卡片采用 Airbnb DLS 风格：留白、无 border、20:19 比例、左下信息层级。
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          品牌色保留 #003B5C / #C9A962。详情见{" "}
          <code>agents/neos/memory/2026-05-17-stayneos-airbnb-plan.md</code>
        </p>
      </div>

      <section className="mb-16">
        <h2 className="mb-6 text-xl font-semibold text-neutral-900">
          新 · AirbnbListingCard (AB-001)
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {DEMO.map((p, i) => (
            <AirbnbListingCard key={p.id} property={p} priority={i === 0} />
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6 text-xl font-semibold text-neutral-900">
          旧 · PropertyCard (current production)
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DEMO.slice(0, 3).map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6 text-xl font-semibold text-neutral-900">Pills (筛选 chip)</h2>
        <div className="flex flex-wrap gap-3">
          <button className="ab-pill" type="button">
            Any price
          </button>
          <button className="ab-pill ab-pill--active" type="button">
            Short stay
          </button>
          <button className="ab-pill" type="button">
            Monthly
          </button>
          <button className="ab-pill" type="button">
            Pet-friendly
          </button>
          <button className="ab-pill" type="button">
            Lake view
          </button>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6 text-xl font-semibold text-neutral-900">Trust badges</h2>
        <div className="flex flex-wrap gap-3">
          <span className="ab-trust-badge ab-trust-badge--verified">✓ Location verified</span>
          <span className="ab-trust-badge ab-trust-badge--superhost">⭐ Superhost</span>
          <span className="ab-trust-badge">Self check-in</span>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6 text-xl font-semibold text-neutral-900">
          Image grid (房源详情页 hero)
        </h2>
        <div className="ab-image-grid">
          <div className="ab-image-grid__hero">
            <ResponsiveImage src="/images/cooper-55-c5e8357d.jpg" alt="hero" fill />
          </div>
          <div className="ab-image-grid__thumb">
            <ResponsiveImage src="/images/simcoe-238-2.jpg" alt="t1" fill />
          </div>
          <div className="ab-image-grid__thumb">
            <ResponsiveImage src="/images/simcoe-238-3.jpg" alt="t2" fill />
          </div>
          <div className="ab-image-grid__thumb">
            <ResponsiveImage src="/images/simcoe-238-kitchen.jpg" alt="t3" fill />
          </div>
          <div className="ab-image-grid__thumb">
            <ResponsiveImage src="/images/simcoe-238-bath1.jpg" alt="t4" fill />
          </div>
          <button type="button" className="ab-image-grid__show-all">
            Show all photos
          </button>
        </div>
      </section>
    </main>
  );
}
