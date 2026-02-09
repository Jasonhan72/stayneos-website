import { Metadata } from "next";
import { Container, Section } from "@/components/ui";
import { Search, HelpCircle, Phone, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Help Center - StayNeos",
  description: "Find answers to common questions about booking, payments, check-in, and more.",
};

const faqs = [
  {
    category: "Booking",
    questions: [
      { q: "How do I book an apartment?", a: "Simply browse our properties, select your dates, and complete the booking process online. You can also contact us for assistance." },
      { q: "What is the minimum stay?", a: "Our minimum stay is 28 nights. This allows us to offer better rates and ensure a comfortable experience for all guests." },
      { q: "Can I extend my stay?", a: "Yes, subject to availability. Contact us at least 7 days before your current checkout date to request an extension." },
    ],
  },
  {
    category: "Payment",
    questions: [
      { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, MasterCard, American Express) and bank transfers for corporate clients." },
      { q: "When will I be charged?", a: "A deposit is required to secure your booking. The remaining balance is due 14 days before check-in." },
      { q: "What is your cancellation policy?", a: "Cancellations made 30+ days before check-in receive a full refund. 14-30 days: 50% refund. Less than 14 days: no refund." },
    ],
  },
  {
    category: "Check-in & Check-out",
    questions: [
      { q: "How do I check in?", a: "You will receive detailed check-in instructions 48 hours before arrival. Most properties offer self check-in with smart locks." },
      { q: "What time is check-in and check-out?", a: "Standard check-in is 3:00 PM and check-out is 11:00 AM. Early check-in and late check-out may be available upon request." },
      { q: "What do I need to bring?", a: "Just your luggage! All our apartments are fully furnished with linens, towels, kitchenware, and essentials." },
    ],
  },
  {
    category: "During Your Stay",
    questions: [
      { q: "Is housekeeping included?", a: "Yes, weekly housekeeping is included for stays of 30+ days. Additional cleaning can be arranged for an extra fee." },
      { q: "What if something breaks?", a: "Contact our 24/7 support line and we&apos;ll arrange for repairs promptly. Emergency issues are handled within 4 hours." },
      { q: "Can I have guests over?", a: "Yes, you may have occasional guests. Please be respectful of neighbors and note that overnight guests must be registered." },
    ],
  },
];

export default function HelpPage() {
  return (
    <>
      {/* Hero Section */}
      <Section className="bg-gradient-to-br from-primary via-primary-800 to-primary-900 text-white py-16 md:py-24">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Help Center</h1>
            <p className="text-lg text-white/90 mb-8">Find answers to common questions</p>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search for answers..."
                className="w-full pl-12 pr-4 py-4 rounded-full text-neutral-800 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* FAQ Sections */}
      <Section className="py-16">
        <Container>
          <div className="max-w-3xl mx-auto space-y-12">
            {faqs.map((section) => (
              <div key={section.category}>
                <h2 className="text-2xl font-semibold mb-6">{section.category}</h2>
                <div className="space-y-4">
                  {section.questions.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
                      <h3 className="font-semibold mb-2 flex items-start gap-3">
                        <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        {item.q}
                      </h3>
                      <p className="text-neutral-600 pl-8">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Contact Section */}
      <Section className="bg-neutral-50 py-16">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-4">Still need help?</h2>
            <p className="text-neutral-600 mb-8">Our support team is available 24/7 to assist you.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+16478626518"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
              >
                <Phone className="w-5 h-5 text-blue-600" />
                <span>+1 (647) 862-6518</span>
              </a>
              <a
                href="mailto:hello@stayneos.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
              >
                <Mail className="w-5 h-5 text-blue-600" />
                <span>hello@stayneos.com</span>
              </a>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
