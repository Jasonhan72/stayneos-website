import { Metadata } from "next";
import ForHostsPageContent from "./ForHostsPageContent";

export const metadata: Metadata = {
  title: "List Your Property - For Hosts | StayNeos",
  description: "List your furnished property on StayNeos and earn steady income with zero vacancy. Professional property management, guaranteed rent, and hassle-free hosting.",
};

export default function ForHostsPage() {
  return <ForHostsPageContent />;
}