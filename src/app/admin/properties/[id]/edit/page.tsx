import EditPropertyClient from './EditPropertyClient';
import { mockProperties } from '@/lib/data';

// Server Component Wrapper for Edit Property Page
export function generateStaticParams() {
  return mockProperties.map(p => ({ id: p.id }));
}

export default function EditPropertyPage() {
  return <EditPropertyClient />;
}
