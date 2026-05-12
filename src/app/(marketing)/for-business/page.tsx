import { Metadata } from "next";
import ForBusinessPageContent from "./ForBusinessPageContent";

export const metadata: Metadata = {
  title: "Corporate Housing Toronto | Business Relocation | NEOS",
  description: "Corporate furnished apartments for business travel, employee relocation, and insurance housing in downtown Toronto. Net-30 invoicing available.",
};

export const revalidate = 3600;

export default function ForBusinessPage() {
  return <ForBusinessPageContent />;
}
