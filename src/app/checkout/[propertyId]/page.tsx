import { Suspense } from 'react';
import CheckoutClient from './CheckoutClient';
import { mockProperties } from '@/lib/data';

export function generateStaticParams() {
  return mockProperties.map(p => ({ propertyId: p.id }));
}

async function CheckoutPageContent({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  return <CheckoutClient propertyId={propertyId} />;
}

export default function CheckoutPage({ params }: { params: Promise<{ propertyId: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CheckoutPageContent params={params} />
    </Suspense>
  );
}
