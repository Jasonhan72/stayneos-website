import { Metadata } from "next";
import ContactPageContent from "./ContactPageContent";
import { getOgLocale, getServerTranslation, resolveRequestLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveRequestLocale();
  const title = getServerTranslation(locale, "contact.pageTitle", "Contact Us");
  const description = getServerTranslation(
    locale,
    "contact.pageSubtitle",
    "Contact the NEOS team for premium executive apartment rental inquiries."
  );

  return {
    title,
    description,
    keywords: ["Contact Us", "NEOS", "apartment inquiries", "customer service"],
    openGraph: {
      title,
      description,
      type: "website",
      locale: getOgLocale(locale),
    },
  };
}

export const revalidate = 3600;

export default function ContactPage() {
  return <ContactPageContent />;
}
