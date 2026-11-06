export const marketCategories = [
  { key: "all", labelKey: "marketHub.catAll", default: "All" },
  { key: "market-report", labelKey: "marketHub.catReport", default: "Market Reports" },
  { key: "trreb", labelKey: "marketHub.catTrreb", default: "TRREB Data" },
  { key: "rental-trends", labelKey: "marketHub.catRental", default: "Rental Trends" },
  { key: "neighborhood", labelKey: "marketHub.catNeighborhood", default: "Neighborhoods" },
  { key: "investment", labelKey: "marketHub.catInvestment", default: "Investment" },
  { key: "news", labelKey: "marketHub.catNews", default: "Industry News" },
];

export function categoryLabel(category: string, t: (key: string, fallback: string) => string) {
  const match = marketCategories.find(item => item.key === category);
  return match ? t(match.labelKey, match.default) : category.replace(/-/g, " ");
}
