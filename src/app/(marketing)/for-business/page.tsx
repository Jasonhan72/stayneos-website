import { localizedPageMetadata } from "@/lib/i18n-server";
import { Metadata } from "next";
import ForBusinessPageContent from "./ForBusinessPageContent";

export async function generateMetadata(): Promise<Metadata> {
  return localizedPageMetadata("for-business");
}

export const revalidate = 3600;

export default function ForBusinessPage() {
  return <ForBusinessPageContent />;
}
