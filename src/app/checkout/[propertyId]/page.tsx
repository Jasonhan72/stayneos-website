import { Suspense } from 'react';
import CheckoutClient from './CheckoutClient';
import { mockProperties } from '@/lib/data';

export function generateStaticParams() {
  return mockProperties.map(p => ({ propertyId: p.id }));
}

function CheckoutPageContent({ params }: { params: { propertyId: string } }) {
  return <CheckoutClient propertyId={params.propertyId} />;
}

export default function CheckoutPage({ params }: { params: { propertyId: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CheckoutPageContent params={params} />
    </Suspense>
  );
}
