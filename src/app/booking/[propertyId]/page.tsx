import BookingContent from './BookingContent';

// Required for static export - pre-render property booking pages
export function generateStaticParams() {
  // Pre-render booking pages for all properties
  return [
    { propertyId: '1' },
    { propertyId: '2' },
  ];
}

export default function BookingPage() {
  return <BookingContent />;
}
