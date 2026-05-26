import { Metadata } from "next";
import ForAgentsPageContent from "./ForAgentsPageContent";
import { getServerTranslation, resolveRequestLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveRequestLocale();
  return {
    title: getServerTranslation(locale, "agents.hero.title", "Partner with NEOS"),
    description: getServerTranslation(
      locale,
      "agents.hero.subtitle",
      "Partner with NEOS as a real estate agent."
    ),
  };
}

export default function ForAgentsPage() {
  return <ForAgentsPageContent />;
}
