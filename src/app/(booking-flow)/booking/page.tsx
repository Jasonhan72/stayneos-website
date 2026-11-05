import type { Metadata } from 'next';
import { resolveRequestLocale, type ServerLocale } from '@/lib/i18n-server';

const copy: Record<ServerLocale, { title: string; description: string; instruction: string }> = {
  en: { title: 'Booking', description: 'Complete your NEOS booking securely.', instruction: 'Please select a property first to continue booking.' },
  zh: { title: '预订', description: '安全完成您的 NEOS 预订。', instruction: '请先选择房源，然后继续预订。' },
  fr: { title: 'Réservation', description: 'Réservez votre séjour avec NEOS en toute sécurité.', instruction: 'Sélectionnez d’abord un logement pour poursuivre votre réservation.' },
};

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = copy[await resolveRequestLocale()];
  return { title, description, alternates: { canonical: '/booking' } };
}

export default async function BookingPage() {
  const { title, instruction } = copy[await resolveRequestLocale()];
  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center py-24">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-neutral-600">{instruction}</p>
      </div>
    </main>
  );
}
