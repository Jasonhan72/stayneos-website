import { localizedPageMetadata } from "@/lib/i18n-server";
import { Metadata } from "next";
import LongTermPageContent from "./LongTermPageContent";

export async function generateMetadata(): Promise<Metadata> {
  return localizedPageMetadata("long-term");
}

export default function LongTermPage() {
  return <LongTermPageContent />;
}