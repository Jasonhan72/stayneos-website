import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Booking',
  description: 'Complete your NEOS booking securely.',
  alternates: { canonical: '/booking' },
};

export default function BookingPage() {
  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center py-24">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Booking</h1>
        <p className="text-neutral-600">Please select a property first to continue booking.</p>
      </div>
    </main>
  );
}
