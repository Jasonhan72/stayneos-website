import { localizedPageMetadata } from "@/lib/i18n-server";
import { Metadata } from 'next';
import ForbiddenContent from './ForbiddenContent';

export async function generateMetadata(): Promise<Metadata> {
  return localizedPageMetadata("403");
}

export default function ForbiddenPage() {
  return <ForbiddenContent />;
}
