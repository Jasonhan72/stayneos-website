import { Metadata } from "next";
import CorporatePageContent from "./CorporatePageContent";

export const metadata: Metadata = {
  title: "For Business - StayNeos",
  description: "Corporate housing solutions for business travelers, relocating employees, and project teams. Flexible, fully-furnished apartments in Toronto and GTA.",
};

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
