import { Metadata } from "next";
import MarketInsightsHub from "./MarketInsightsHub";

export const metadata: Metadata = {
  title: "Toronto Market Insights & Reports | NEOS Knowledge Hub",
  description: "Toronto real estate market reports, TRREB data analysis, rental trends, and investment insights. Updated regularly with the latest data.",
};

export default function MarketInsightsPage() {
  return <MarketInsightsHub />;
}
