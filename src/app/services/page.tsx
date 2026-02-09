import { Metadata } from "next";
import { Container, Section } from "@/components/ui";
import { Building2, Home, Briefcase, Shield, Clock, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Services - StayNeos",
  description: "Discover our premium services for corporate housing, short-term rentals, and property management.",
};

const services = [
  {
    icon: Building2,
    title: "Corporate Housing",
    description: "Fully furnished apartments for business travelers and relocating employees. Flexible lease terms from 1 month to 1 year.",
    features: ["All utilities included", "High-speed WiFi", "Housekeeping service", "24/7 support"],
  },
  {
    icon: Home,
    title: "Short-term Rentals",
    description: "Premium furnished apartments for short stays. Perfect for vacations, temporary relocations, or home renovations.",
    features: ["Minimum 28 nights", "Fully equipped kitchen", "Premium locations", "Instant booking"],
  },
  {
    icon: Briefcase,
    title: "Property Management",
    description: "Full-service property management for landlords. We handle everything from marketing to maintenance.",
    features: ["Professional photography", "Tenant screening", "Rent collection", "Maintenance coordination"],
  },
  {
    icon: Shield,
    title: "Concierge Services",
    description: "Personalized concierge services to make your stay exceptional. From airport transfers to grocery delivery.",
    features: ["Airport pickup", "Grocery delivery", "Restaurant reservations", "Local recommendations"],
  },
  {
    icon: Clock,
    title: "Flexible Leasing",
    description: "Lease terms that fit your schedule. No long-term commitments or hidden fees.",
    features: ["Month-to-month options", "No hidden fees", "Easy renewal", "Early termination available"],
  },
  {
    icon: Globe,
    title: "Global Network",
    description: "Access to premium furnished apartments in major cities across North America and beyond.",
    features: ["Toronto", "Vancouver", "Montreal", "New York", "San Francisco"],
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero Section */}
      <Section className="bg-gradient-to-br from-primary via-primary-800 to-primary-900 text-white py-20 md:py-28">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Premium furnished apartment solutions for every need. 
              From corporate housing to short-term stays, we&apos;ve got you covered.
            </p>
          </div>
        </Container>
      </Section>

      {/* Services Grid */}
      <Section className="py-16 md:py-24">
        <Container>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.title}
                className="bg-white rounded-2xl p-8 shadow-lg border border-neutral-100 hover:shadow-xl transition-shadow"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <service.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-neutral-600 mb-6 leading-relaxed">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-neutral-600">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="bg-neutral-50 py-16">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-neutral-600 mb-8">
              Contact us today to learn more about our services and find your perfect home.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </Container>
      </Section>
    </>
  );
}
