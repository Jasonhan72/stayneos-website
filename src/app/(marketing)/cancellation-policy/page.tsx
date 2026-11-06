import { localizedPageMetadata } from "@/lib/i18n-server";
import { Metadata } from 'next';
import CancellationContent from './CancellationContent';

export async function generateMetadata(): Promise<Metadata> {
  return localizedPageMetadata("cancellation-policy");
}

export const revalidate = 3600;

export default function CancellationPolicyPage() {
  return <CancellationContent />;
}
