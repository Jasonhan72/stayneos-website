import { localizedPageMetadata } from "@/lib/i18n-server";
import { Metadata } from 'next';
import PrivacyContent from './PrivacyContent';

export async function generateMetadata(): Promise<Metadata> {
  return localizedPageMetadata("privacy");
}

export default function PrivacyPage() {
  return <PrivacyContent />;
}
