/**
 * AB-001 Design Token Preview Page
 *
 * 内部预览页：对比旧 PropertyCard 与新 AirbnbListingCard
 * 路径：/airbnb-preview
 *
 * 不在导航/sitemap 中暴露，仅供 Neos/Nova 设计验收用。
 */

"use client";

import { useI18n } from "@/lib/i18n";
import PropertyCard, { Property } from "@/components/property/PropertyCard";
import AirbnbListingCard from "@/components/property/AirbnbListingCard";
import ResponsiveImage from "@/components/ui/ResponsiveImage";

const DEMO: Property[] = [
  {
    id: "1",
    title: "Cooper at 55 — Penthouse Condo with Lake Views",
    titleZh: "库珀街 55 号湖景顶层公寓",
    titleFr: "Appartement-terrasse avec vue sur le lac au 55 Cooper",
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
    titleZh: "配备特大床的公寓，可望加拿大国家电视塔",
    titleFr: "Appartement ICE avec très grand lit et vue sur la tour CN",
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
    titleZh: "约克维尔精品套房，配备设计师家具",
    titleFr: "Suite à Yorkville avec mobilier de designer",
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
    titleZh: "湖滨阁楼公寓，配备落地窗",
    titleFr: "Loft du bord du lac avec fenêtres pleine hauteur",
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
  const { t } = useI18n();
  return (
    <main className="container-custom py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-neutral-900">{t("property.preview.title")}</h1>
        <p className="mt-2 text-neutral-600">
          {t("property.preview.comparison")}
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          {t("property.preview.brand")}
        </p>
      </div>

      <section className="mb-16">
        <h2 className="mb-6 text-xl font-semibold text-neutral-900">
          {t("property.preview.newCard")}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {DEMO.map((p, i) => (
            <AirbnbListingCard key={p.id} property={p} priority={i === 0} />
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6 text-xl font-semibold text-neutral-900">
          {t("property.preview.oldCard")}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DEMO.slice(0, 3).map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6 text-xl font-semibold text-neutral-900">{t("property.preview.filters")}</h2>
        <div className="flex flex-wrap gap-3">
          <button className="ab-pill" type="button">
            {t("property.preview.price")}
          </button>
          <button className="ab-pill ab-pill--active" type="button">
            {t("property.preview.short")}
          </button>
          <button className="ab-pill" type="button">
            {t("property.preview.monthly")}
          </button>
          <button className="ab-pill" type="button">
            {t("property.preview.pet")}
          </button>
          <button className="ab-pill" type="button">
            {t("property.preview.view")}
          </button>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6 text-xl font-semibold text-neutral-900">{t("property.preview.badges")}</h2>
        <div className="flex flex-wrap gap-3">
          <span className="ab-trust-badge ab-trust-badge--verified">{t("property.preview.verified")}</span>
          <span className="ab-trust-badge ab-trust-badge--superhost">{t("property.preview.superhost")}</span>
          <span className="ab-trust-badge">{t("property.preview.self")}</span>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6 text-xl font-semibold text-neutral-900">
          {t("property.preview.gallery")}
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
            {t("property.preview.photos")}
          </button>
        </div>
      </section>
    </main>
  );
}
