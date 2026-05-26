import { Suspense } from 'react';
import PaymentClient from './PaymentClient';
import { BookingStepIndicator } from '@/components/booking/BookingStepIndicator';

export const dynamic = 'force-dynamic';

async function PaymentPageContent({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  return (
    <>
      <div className="bg-white border-b border-neutral-100 py-4">
        <div className="px-4">
          <BookingStepIndicator current="payment" />
        </div>
      </div>
      <PaymentClient propertyId={propertyId} />
    </>
  );
}

export default function PaymentPage({ params }: { params: Promise<{ propertyId: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PaymentPageContent params={params} />
    </Suspense>
  );
}
