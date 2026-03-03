import { Metadata } from "next";
import ForAgentsPageContent from "./ForAgentsPageContent";

export const metadata: Metadata = {
  title: "Partner with StayNeos - For Agents",
  description: "Partner with StayNeos as a real estate agent. Earn competitive commissions by referring properties, representing tenants, or referring guests to our premium executive apartments.",
};

export default function ForAgentsPage() {
  return <ForAgentsPageContent />;
}
