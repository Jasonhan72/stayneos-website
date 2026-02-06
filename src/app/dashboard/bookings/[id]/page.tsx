import BookingDetailClient from './BookingDetailClient';

// Required for static export - Next.js needs this for dynamic routes with output: export
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

// Server Component that wraps the Client Component
export default function BookingDetailPage() {
  return <BookingDetailClient />;
}
