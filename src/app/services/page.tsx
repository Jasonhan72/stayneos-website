import { Metadata } from "next";
import ServicesPageContent from "./ServicesPageContent";

export const metadata: Metadata = {
  title: "Our Services | NEOS",
  description: "Discover NEOS services: corporate housing, short-term rentals, property management, concierge services, and flexible leasing options.",
  keywords: ["corporate housing", "short-term rentals", "property management", "furnished rentals"],
  openGraph: {
    title: "Our Services | NEOS",
    description: "Corporate housing, short-term rentals, and property management services",
    type: "website",
  },
};

export default function ServicesPage() {
  return <ServicesPageContent />;
}
