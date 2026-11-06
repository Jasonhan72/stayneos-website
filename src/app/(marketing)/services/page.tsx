import { localizedPageMetadata } from "@/lib/i18n-server";
import { Metadata } from "next";
import ServicesPageContent from "./ServicesPageContent";

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await localizedPageMetadata("services");
  return { ...metadata, keywords: ["corporate housing", "short-term rentals", "property management", "furnished rentals"], openGraph: { ...metadata, type: "website" } };
}

export default function ServicesPage() {
  return <ServicesPageContent />;
}
