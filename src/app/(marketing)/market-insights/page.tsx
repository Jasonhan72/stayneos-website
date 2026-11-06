import { localizedPageMetadata } from "@/lib/i18n-server";
import { Metadata } from "next";
import MarketInsightsHub from "./MarketInsightsHub";

export async function generateMetadata(): Promise<Metadata> {
  return localizedPageMetadata("market-insights");
}

export default function MarketInsightsPage() {
  return <MarketInsightsHub />;
}
