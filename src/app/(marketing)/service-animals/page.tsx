import { localizedPageMetadata } from "@/lib/i18n-server";
import { Metadata } from 'next';
import ServiceAnimalsContent from './ServiceAnimalsContent';

export async function generateMetadata(): Promise<Metadata> {
  return localizedPageMetadata("service-animals");
}

export const revalidate = 3600;

export default function ServiceAnimalsPage() {
  return <ServiceAnimalsContent />;
}
