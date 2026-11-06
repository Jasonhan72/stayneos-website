import { localizedPageMetadata } from "@/lib/i18n-server";
import { Metadata } from "next";
import CorporatePageContent from "./CorporatePageContent";

export async function generateMetadata(): Promise<Metadata> {
  return localizedPageMetadata("corporate");
}

// Static data for solutions - just keys
const solutions = [
  { iconKey: "housing" },
  { iconKey: "group" },
  { iconKey: "mobility" },
  { iconKey: "executive" },
];

const benefits = [
  { iconKey: "terms" },
  { iconKey: "inclusive" },
  { iconKey: "location" },
  { iconKey: "support" },
];

export default function CorporatePage() {
  return <CorporatePageContent solutions={solutions} benefits={benefits} />;
}
