import { mockProperties } from '@/lib/data';
import PaymentClient from './PaymentClient';

export function generateStaticParams() {
  return mockProperties.map((property) => ({
    propertyId: property.id,
  }));
}

export default function PaymentPage({ params }: { params: { propertyId: string } }) {
  return <PaymentClient propertyId={params.propertyId} />;
}
