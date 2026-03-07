import { Metadata } from "next";
import ForBusinessPageContent from "./ForBusinessPageContent";

export const metadata: Metadata = {
  title: "Corporate Housing Solutions | StayNeos for Business",
  description: "Enterprise accommodation solutions for business travelers, relocating employees, and project teams. Flexible terms, dedicated account management, and cost-effective corporate housing in Toronto.",
};

export default function ForBusinessPage() {
  return <ForBusinessPageContent />;
}