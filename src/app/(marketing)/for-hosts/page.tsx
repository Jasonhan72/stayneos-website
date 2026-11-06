import { localizedPageMetadata } from "@/lib/i18n-server";
import { Metadata } from "next";
import ForHostsPageContent from "./ForHostsPageContent";

export async function generateMetadata(): Promise<Metadata> {
  return localizedPageMetadata("for-hosts");
}

export default function ForHostsPage() {
  return <ForHostsPageContent />;
}