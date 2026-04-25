import { Suspense } from 'react';
import { mockProperties } from '@/lib/data';
import PaymentClient from './PaymentClient';

export function generateStaticParams() {
  return mockProperties.map((property) => ({
    propertyId: property.id,
  }));
}

async function PaymentPageContent({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  return <PaymentClient propertyId={propertyId} />;
}

export default function PaymentPage({ params }: { params: Promise<{ propertyId: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PaymentPageContent params={params} />
    </Suspense>
  );
}
