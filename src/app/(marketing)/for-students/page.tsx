import { localizedPageMetadata } from "@/lib/i18n-server";
import { Metadata } from "next";
import ForStudentsPageContent from "./ForStudentsPageContent";

export async function generateMetadata(): Promise<Metadata> {
  return localizedPageMetadata("for-students");
}

export default function ForStudentsPage() {
  return <ForStudentsPageContent />;
}
