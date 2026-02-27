import EditPropertyClient from './EditPropertyClient';

// Server Component Wrapper for Edit Property Page
export function generateStaticParams() {
  return [{ id: 'dummy' }];
}

export default function EditPropertyPage() {
  return <EditPropertyClient />;
}
