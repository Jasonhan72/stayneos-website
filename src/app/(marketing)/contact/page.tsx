import { Metadata } from "next";
import ContactPageContent from "./ContactPageContent";

export const metadata: Metadata = {
  title: "Contact Us | NEOS",
  description: "Contact the NEOS team for premium executive apartment rental inquiries. Our professional team is ready to help with any questions.",
  keywords: ["Contact Us", "NEOS", "apartment inquiries", "customer service"],
  openGraph: {
    title: "Contact Us | NEOS",
    description: "Contact the NEOS team for premium executive apartment rental inquiries",
    type: "website",
    locale: "en_US",
  },
};

export const revalidate = 3600;

export default function ContactPage() {
  return <ContactPageContent />;
}
