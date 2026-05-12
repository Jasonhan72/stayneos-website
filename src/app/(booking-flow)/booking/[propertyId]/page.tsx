import { Suspense } from 'react';
import { mockProperties } from '@/lib/data';
import BookingContent from './BookingContent';

export function generateStaticParams() {
  return mockProperties.map(p => ({ propertyId: p.id }));
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}
