import { Metadata } from "next";
import LongTermPageContent from "./LongTermPageContent";

export const metadata: Metadata = {
  title: "Long-Term Rentals Toronto | Extended Stay Discounts | StayNeos",
  description: "Save more with long-term rentals in Toronto. Flexible 3, 6, and 12-month leases with significant discounts. Premium furnished apartments for extended stays.",
};

export default function LongTermPage() {
  return <LongTermPageContent />;
}