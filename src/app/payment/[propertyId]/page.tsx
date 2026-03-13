import { Suspense } from 'react';
import { mockProperties } from '@/lib/data';
import PaymentClient from './PaymentClient';

export function generateStaticParams() {
  return mockProperties.map((property) => ({
    propertyId: property.id,
  }));
}

function PaymentPageContent({ params }: { params: { propertyId: string } }) {
  return <PaymentClient propertyId={params.propertyId} />;
}

export default function PaymentPage({ params }: { params: { propertyId: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PaymentPageContent params={params} />
    </Suspense>
  );
}
