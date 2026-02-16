import CheckoutClient from './CheckoutClient';

// Required for static export
export function generateStaticParams() {
  return [
    { propertyId: '1' },
    { propertyId: '2' },
  ];
}

export default function CheckoutPage({ params }: { params: { propertyId: string } }) {
  return <CheckoutClient propertyId={params.propertyId} />;
}
