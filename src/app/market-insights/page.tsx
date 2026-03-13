import { Metadata } from "next";
import MarketInsightsPageContent from "./MarketInsightsPageContent";

export const metadata: Metadata = {
  title: "Toronto Real Estate Market Insights 2024 | NEOS Market Report",
  description: "Comprehensive Toronto real estate market analysis and trends. Download our latest market insights report with rental rates, occupancy data, and forecasts for executive housing.",
};

export default function MarketInsightsPage() {
  return <MarketInsightsPageContent />;
}