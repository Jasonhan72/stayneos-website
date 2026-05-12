import { Suspense } from 'react';
import CheckoutClient from './CheckoutClient';
import { BookingStepIndicator } from '@/components/booking/BookingStepIndicator';
import { mockProperties } from '@/lib/data';

export function generateStaticParams() {
  return mockProperties.map(p => ({ propertyId: p.id }));
}

async function CheckoutPageContent({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  return (
    <>
      {/* SSR-rendered progress bar — visible immediately, before client hydration */}
      <div className="bg-white border-b border-neutral-100 py-4">
        <div className="px-4">
          <BookingStepIndicator current="review" />
        </div>
      </div>
      <CheckoutClient propertyId={propertyId} />
    </>
  );
}

export default function CheckoutPage({ params }: { params: Promise<{ propertyId: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CheckoutPageContent params={params} />
    </Suspense>
  );
}
