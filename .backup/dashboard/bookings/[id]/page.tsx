import BookingDetailClient from './BookingDetailClient';
import { mockProperties } from '@/lib/data';

// Required for static export - generate from mock data
export async function generateStaticParams() {
  // Generate IDs based on mock properties (bookings reference property IDs)
  return mockProperties.map(p => ({ id: p.id }));
}

// Server Component that wraps the Client Component
export default function BookingDetailPage() {
  return <BookingDetailClient />;
}
