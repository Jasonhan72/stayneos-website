import { Metadata } from "next";
import { Container, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Privacy Policy - StayNeos",
  description: "Learn how StayNeos collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <>
      <Section className="py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
            <p className="text-neutral-600 mb-8">
              Last updated: February 7, 2026
            </p>

            <div className="prose prose-neutral max-w-none">
              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
              <p className="mb-4">
                StayNeos (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you use our website and services.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
              <p className="mb-4">We may collect the following types of information:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Personal Information:</strong> Name, email address, phone number, and payment information.</li>
                <li><strong>Booking Information:</strong> Stay dates, property preferences, and special requests.</li>
                <li><strong>Technical Information:</strong> IP address, browser type, device information, and cookies.</li>
                <li><strong>Communication:</strong> Records of your interactions with our customer support team.</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Process and manage your bookings</li>
                <li>Communicate with you about your stay</li>
                <li>Provide customer support</li>
                <li>Improve our services and website</li>
                <li>Send promotional communications (with your consent)</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">4. Information Sharing</h2>
              <p className="mb-4">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Property owners and managers (as necessary for your stay)</li>
                <li>Service providers (payment processing, customer support)</li>
                <li>Legal authorities (when required by law)</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent (where applicable)</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="mb-4">
                Email: hello@stayneos.com<br />
                Phone: +1 (647) 862-6518<br />
                Address: 20 Upjohn Rd, North York, ON, M3B 2V9
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
