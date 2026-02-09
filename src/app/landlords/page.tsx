import { Metadata } from "next";
import LandlordsPageContent from "./LandlordsPageContent";

export const metadata: Metadata = {
  title: "For Landlords - StayNeos",
  description: "Partner with StayNeos to maximize your rental income. Professional property management services for landlords in Toronto and GTA.",
};

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
