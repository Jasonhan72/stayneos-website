import { Metadata } from "next";
import { Container, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "FAQ - StayNeos",
  description: "Frequently asked questions about StayNeos booking, payments, cancellations, and more.",
};

export default function FAQPage() {
  const faqs = [
    {
      category: "Booking & Reservations",
      questions: [
        {
          q: "How do I make a reservation?",
          a: "You can make a reservation by browsing our properties, selecting your dates, and clicking 'Reserve'. You'll need to create an account or log in to complete your booking."
        },
        {
          q: "What is the minimum stay requirement?",
          a: "Our minimum stay is typically 28 nights. However, some properties may have different requirements. Check the specific property listing for details."
        },
        {
          q: "Can I book for someone else?",
          a: "Yes, you can book on behalf of someone else. During checkout, you'll have the option to specify the guest's information."
        },
        {
          q: "How do I know if my booking is confirmed?",
          a: "Once your payment is processed, you'll receive a confirmation email with your booking details and check-in instructions."
        }
      ]
    },
    {
      category: "Payment & Pricing",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards (Visa, MasterCard, American Express), Google Pay, and bank transfers for corporate clients."
        },
        {
          q: "When will I be charged?",
          a: "Your card will be charged at the time of booking to secure your reservation. For longer stays, we may offer payment plans."
        },
        {
          q: "Are there any additional fees?",
          a: "Our pricing includes all taxes and cleaning fees. You'll see the total price before confirming your booking. Optional services like parking or early check-in may have additional charges."
        },
        {
          q: "Is my payment secure?",
          a: "Yes, we use Stripe for payment processing, which is PCI DSS compliant. Your payment information is never stored on our servers."
        }
      ]
    },
    {
      category: "Cancellation Policy",
      questions: [
        {
          q: "What is your cancellation policy?",
          a: "Full refund for cancellations 30+ days before check-in. 50% refund for cancellations 14-30 days before check-in. No refund for cancellations less than 14 days before check-in."
        },
        {
          q: "Can I modify my booking dates?",
          a: "Yes, date changes are subject to availability and may incur additional fees. Please contact our support team as soon as possible."
        },
        {
          q: "What if I need to cancel due to an emergency?",
          a: "We understand emergencies happen. Contact our support team, and we'll review your case individually. Travel insurance is recommended for such situations."
        }
      ]
    },
    {
      category: "Check-in & Check-out",
      questions: [
        {
          q: "What are the standard check-in and check-out times?",
          a: "Standard check-in is at 3:00 PM and check-out is at 11:00 AM. Early check-in and late check-out may be available upon request."
        },
        {
          q: "How do I get the keys?",
          a: "Check-in instructions, including key pickup or access codes, will be sent to your email 24 hours before your arrival."
        },
        {
          q: "What if I arrive late at night?",
          a: "Most of our properties offer self-check-in with key lockboxes or smart locks. Instructions will be provided in your confirmation email."
        }
      ]
    },
    {
      category: "Property & Amenities",
      questions: [
        {
          q: "Are the apartments fully furnished?",
          a: "Yes, all our apartments come fully furnished with quality furniture, kitchen appliances, linens, and toiletries."
        },
        {
          q: "Is Wi-Fi included?",
          a: "Yes, high-speed Wi-Fi is included in all our properties at no additional charge."
        },
        {
          q: "Are pets allowed?",
          a: "Pet policies vary by property. Look for the 'Pet-friendly' tag on listings, or contact us to inquire about specific properties."
        },
        {
          q: "Is smoking allowed?",
          a: "All our properties are non-smoking. Smoking is strictly prohibited and may result in additional cleaning fees."
        }
      ]
    },
    {
      category: "Support & Contact",
      questions: [
        {
          q: "How can I contact customer support?",
          a: "You can reach us via WhatsApp, phone at +1 (647) 862-6518, or email at hello@stayneos.com. Our support team is available 24/7."
        },
        {
          q: "What if I have an issue during my stay?",
          a: "We have a dedicated support team available 24/7. For urgent maintenance issues, we provide emergency contact numbers."
        },
        {
          q: "Do you offer corporate housing solutions?",
          a: "Yes, we specialize in corporate housing with flexible terms, centralized billing, and dedicated account management. Contact us for corporate rates."
        }
      ]
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <Section className="py-16 md:py-20 bg-neutral-50">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-neutral-600">
              Find answers to common questions about booking, payments, and your stay with StayNeos.
            </p>
          </div>
        </Container>
      </Section>

      {/* FAQ Content */}
      <Section className="py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto space-y-16">
            {faqs.map((category, idx) => (
              <div key={idx}>
                <h2 className="text-2xl font-bold mb-6 pb-4 border-b border-neutral-200">
                  {category.category}
                </h2>
                <div className="space-y-6">
                  {category.questions.map((item, qIdx) => (
                    <div key={qIdx} className="bg-white rounded-lg p-6 shadow-sm border border-neutral-100">
                      <h3 className="text-lg font-semibold mb-3 text-neutral-900">
                        {item.q}
                      </h3>
                      <p className="text-neutral-600 leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Contact CTA */}
      <Section className="py-16 bg-primary">
        <Container>
          <div className="max-w-2xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Still have questions?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Our team is here to help you 24/7. Reach out to us anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/16478626518"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-primary font-semibold rounded-full hover:bg-neutral-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Us
              </a>
              <a
                href="mailto:hello@stayneos.com"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Us
              </a>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
