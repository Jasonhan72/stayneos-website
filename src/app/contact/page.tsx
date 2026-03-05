import { Metadata } from "next";
import ContactPageContent from "./ContactPageContent";

export const metadata: Metadata = {
  title: "Contact Us | StayNeos",
  description: "Contact the StayNeos team for premium executive apartment rental inquiries. Our professional team is ready to help with any questions.",
  keywords: ["Contact Us", "StayNeos", "apartment inquiries", "customer service"],
  openGraph: {
    title: "Contact Us | StayNeos",
    description: "Contact the StayNeos team for premium executive apartment rental inquiries",
    type: "website",
    locale: "en_US",
  },
};

export default function ContactPage() {
  return <ContactPageContent />;
}
