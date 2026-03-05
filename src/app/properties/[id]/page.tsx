import { redirect } from 'next/navigation';
import { mockProperties } from '@/lib/data';

// Redirect /properties/[id] to /property/[id]
export function generateStaticParams() {
  return mockProperties.map((property) => ({ id: property.id }));
}

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  redirect(`/property/${params.id}`);
}
