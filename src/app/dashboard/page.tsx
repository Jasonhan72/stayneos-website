export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import DashboardPageClient from '@/components/pages/DashboardPageClient';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your NEOS bookings, profile, and saved listings.',
  alternates: { canonical: '/dashboard' },
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}
