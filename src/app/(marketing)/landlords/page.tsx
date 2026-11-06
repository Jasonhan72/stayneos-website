import { localizedPageMetadata } from "@/lib/i18n-server";
import { Metadata } from "next";
import LandlordsPageContent from "./LandlordsPageContent";

export async function generateMetadata(): Promise<Metadata> {
  return localizedPageMetadata("landlords");
}

// Static data for benefits - just keys, icons resolved in client component
const benefits = [
  { iconKey: "income" },
  { iconKey: "protection" },
  { iconKey: "management" },
  { iconKey: "support" },
  { iconKey: "marketing" },
  { iconKey: "guests" },
];

export default function LandlordsPage() {
  return <LandlordsPageContent benefits={benefits} />;
}
