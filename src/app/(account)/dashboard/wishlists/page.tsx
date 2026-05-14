'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import { Container } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import { useWishlist } from '@/lib/context/WishlistContext';
import { Heart, MapPin, Star, ArrowRight, Trash2, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WishlistGetResponse } from '@/types/api';

type Property = WishlistGetResponse['properties'][number];

export default function DashboardWishlistsPage() {
  const { t } = useI18n();
  const { wishlist: wishlistIds, toggleWishlist } = useWishlist();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/wishlist', { credentials: 'include', cache: 'no-store' });
        const payload = await response.json() as WishlistGetResponse;
        if (!response.ok) throw new Error(payload?.error || 'Failed to load wishlist');
        if (active) setProperties(payload.properties || []);
      } catch {
        if (active) setProperties([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [wishlistIds]);

  const wishlist = useMemo(() => properties.map((property) => ({ id: property.id, title: property.title, location: [property.neighborhood, property.city].filter(Boolean).join(', ') || property.address || '', price: property.priceMonthly ?? property.basePrice ?? 0, currency: property.currency || 'CAD', priceUnit: t('wishlists.priceUnit'), rating: property.averageRating || 0, reviewCount: property.reviewCount || 0, bedrooms: property.bedrooms || 0, bathrooms: property.bathrooms || 0, image: property.images?.find((image) => image.isPrimary)?.url || property.images?.[0]?.url || '/images/cooper-55-c5e8357d.jpg', slug: property.slug || property.id })), [properties, t]);

  const handleRemove = async (propertyId: string) => { setRemovingId(propertyId); try { await toggleWishlist(propertyId); } finally { setTimeout(() => setRemovingId(null), 300); } };

  if (loading) return <main className="min-h-screen bg-neutral-50"><div className="pt-20 pb-12"><Container><div className="py-20 text-center text-neutral-400">Loading…</div></Container></div></main>;
  if (wishlist.length === 0) return <main className="min-h-screen bg-neutral-50"><div className="pt-20 pb-12"><Container><div className="max-w-2xl mx-auto text-center"><div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6"><Heart size={40} className="text-neutral-300" /></div><h1 className="text-3xl font-bold text-neutral-900 mb-4">{t('wishlists.emptyTitle')}</h1><p className="text-neutral-600 mb-8">{t('wishlists.emptyDescription')}</p><Link href="/properties"><Button size="lg">{t('wishlists.explore')}<ArrowRight size={18} className="ml-2" /></Button></Link></div></Container></div></main>;

  return <main className="min-h-screen bg-neutral-50"><div className="pt-20 pb-12"><Container><div className="mb-8"><h1 className="text-3xl font-bold text-neutral-900">{t('wishlists.title')}</h1><p className="text-neutral-600 mt-2">{t('wishlists.savedCount', { count: wishlist.length })}</p></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{wishlist.map((property) => <div key={property.id} className={cn("group bg-white rounded-xl border border-neutral-200 overflow-hidden transition-all duration-300", removingId === property.id ? "opacity-50 scale-95" : "hover:shadow-lg hover:-translate-y-1")}><div className="relative aspect-[4/3] overflow-hidden"><Image src={property.image} alt={property.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" /><button onClick={() => void handleRemove(property.id)} className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:scale-110" title={t('wishlists.remove')}><Trash2 size={18} /></button><div className="absolute bottom-3 left-3 px-3 py-1.5 bg-white/95 rounded-lg shadow-sm"><span className="font-bold text-neutral-900">${property.price}</span><span className="text-sm text-neutral-500">/{t('wishlists.priceUnit')}</span></div></div><div className="p-4"><Link href={`/property/${property.slug}`} className="block group/title"><h3 className="font-semibold text-neutral-900 line-clamp-1 group-hover/title:text-accent transition-colors">{property.title}</h3></Link><div className="flex items-center gap-1 text-neutral-500 text-sm mt-1"><MapPin size={14} /><span className="truncate">{property.location}</span></div>{property.reviewCount > 0 && <div className="flex items-center gap-1 mt-2"><Star size={16} className="text-amber-400 fill-amber-400" /><span className="font-medium text-neutral-900">{property.rating}</span><span className="text-sm text-neutral-500">({t('wishlists.reviews', { count: property.reviewCount })})</span></div>}<div className="flex items-center gap-3 mt-3 text-sm text-neutral-600"><div className="flex items-center gap-1"><Home size={14} /><span>{t('wishlists.beds', { count: property.bedrooms })}</span></div><span className="text-neutral-300">•</span><span>{t('wishlists.baths', { count: property.bathrooms })}</span></div><div className="flex gap-2 mt-4 pt-4 border-t border-neutral-100"><Link href={`/property/${property.slug}`} className="flex-1"><Button variant="outline" size="sm" fullWidth>{t('wishlists.viewDetails')}</Button></Link><Link href={`/checkout/${property.id}`} className="flex-1"><Button size="sm" fullWidth>{t('wishlists.bookNow')}</Button></Link></div></div></div>)}</div><div className="mt-12 text-center"><p className="text-neutral-600 mb-4">{t('wishlists.moreOptions')}</p><Link href="/properties"><Button variant="outline">{t('wishlists.browseAll')}<ArrowRight size={18} className="ml-2" /></Button></Link></div></Container></div></main>;
}
