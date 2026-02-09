import { Metadata } from "next";
import { Container, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Terms of Service - StayNeos",
  description: "Please read these Terms of Service carefully before using StayNeos website and services.",
};

export default function TermsPage() {
  return (
    <>
      <Section className="py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
            <p className="text-neutral-600 mb-8">
              Last updated: February 7, 2026
            </p>

            <div className="prose prose-neutral max-w-none">
              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Agreement to Terms</h2>
              <p className="mb-4">
                By accessing or using StayNeos services, you agree to be bound by these Terms of Service. 
                If you disagree with any part of these terms, you may not access our services.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">2. Services Description</h2>
              <p className="mb-4">
                StayNeos provides a platform for booking furnished apartments and corporate housing. 
                We act as an intermediary between property owners and guests.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">3. Booking and Payment</h2>
              <p className="mb-4"><strong>3.1 Reservations:</strong> All bookings are subject to availability and confirmation.</p>
              <p className="mb-4"><strong>3.2 Payment:</strong> Full payment or deposit is required to secure a booking. 
              Accepted payment methods include major credit cards and bank transfers for corporate clients.</p>
              <p className="mb-4"><strong>3.3 Minimum Stay:</strong> The minimum booking period is 28 nights unless otherwise specified.</p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">4. Cancellation Policy</h2>
              <p className="mb-4"><strong>4.1 Guest Cancellations:</strong></p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>30+ days before check-in: Full refund</li>
                <li>14-30 days before check-in: 50% refund</li>
                <li>Less than 14 days before check-in: No refund</li>
              </ul>
              <p className="mb-4"><strong>4.2 Modifications:</strong> Date changes are subject to availability and may incur additional fees.</p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Guest Responsibilities</h2>
              <p className="mb-4">By booking with StayNeos, you agree to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Treat the property with care and respect</li>
                <li>Comply with building rules and regulations</li>
                <li>Not exceed the maximum occupancy stated</li>
                <li>Report any damages or issues promptly</li>
                <li>Not engage in illegal activities on the premises</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Property Rules</h2>
              <p className="mb-4"><strong>6.1 Smoking:</strong> All properties are non-smoking unless explicitly stated otherwise.</p>
              <p className="mb-4"><strong>6.2 Pets:</strong> Pets are only allowed in pet-friendly properties with prior approval.</p>
              <p className="mb-4"><strong>6.3 Parties and Events:</strong> No parties or events without prior written consent.</p>
              <p className="mb-4"><strong>6.4 Noise:</strong> Guests must respect quiet hours (10 PM - 8 AM) and neighbors.</p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">7. Liability and Insurance</h2>
              <p className="mb-4">
                StayNeos maintains liability insurance, but guests are responsible for their personal belongings. 
                We recommend obtaining travel insurance for your stay.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
              <p className="mb-4">
                StayNeos shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
                arising out of or relating to your use of our services.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">9. Governing Law</h2>
              <p className="mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the Province of Ontario, Canada.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">10. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. 
                Your continued use of our services constitutes acceptance of the modified Terms.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Information</h2>
              <p className="mb-4">
                For questions about these Terms, please contact us:
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
