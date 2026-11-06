import { localizedPageMetadata } from "@/lib/i18n-server";
import { Metadata } from "next";
import NeighborhoodsPageContent from "./NeighborhoodsPageContent";

export async function generateMetadata(): Promise<Metadata> {
  return localizedPageMetadata("neighborhoods");
}

export default function NeighborhoodsPage() {
  return <NeighborhoodsPageContent />;
}
