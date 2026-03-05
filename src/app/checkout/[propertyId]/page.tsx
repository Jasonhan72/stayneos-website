import CheckoutClient from './CheckoutClient';
import { mockProperties } from '@/lib/data';

// Required for static export
export function generateStaticParams() {
  return mockProperties.map(p => ({ propertyId: p.id }));
}

export default function CheckoutPage({ params }: { params: { propertyId: string } }) {
  return <CheckoutClient propertyId={params.propertyId} />;
}
