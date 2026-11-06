import { localizedPageMetadata } from "@/lib/i18n-server";
import { Metadata } from 'next';
import TermsContent from './TermsContent';

export async function generateMetadata(): Promise<Metadata> {
  return localizedPageMetadata("terms");
}

export default function TermsPage() {
  return <TermsContent />;
}
