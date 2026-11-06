import { localizedPageMetadata } from "@/lib/i18n-server";
import { Metadata } from 'next';
import HelpContent from './HelpContent';

export async function generateMetadata(): Promise<Metadata> {
  return localizedPageMetadata("help");
}

export const revalidate = 3600;

export default function HelpPage() {
  return <HelpContent />;
}
