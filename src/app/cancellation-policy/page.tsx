import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cancellation Policy | StayNeos',
  description: 'StayNeos cancellation and refund policy for apartment bookings.',
};

export default function CancellationPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Cancellation Policy</h1>
        
        <div className="prose prose-neutral max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Flexible Cancellation</h2>
            <p className="text-neutral-600">Free cancellation up to 48 hours before check-in. After that, the first night is non-refundable.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Moderate Cancellation</h2>
            <p className="text-neutral-600">Free cancellation up to 5 days before check-in. After that, 50% of the booking total is refunded.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Long-term Stays (28+ nights)</h2>
            <p className="text-neutral-600">Free cancellation up to 30 days before check-in. After check-in, the next 30 days are non-refundable.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Refund Process</h2>
            <p className="text-neutral-600">Refunds are processed within 5-10 business days to the original payment method. Service fees are non-refundable.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Extenuating Circumstances</h2>
            <p className="text-neutral-600">In cases of natural disasters, government travel restrictions, or documented medical emergencies, full refunds may be provided regardless of the cancellation policy. Please contact our support team.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Contact Us</h2>
            <p className="text-neutral-600">For questions about our cancellation policy, please email <a href="mailto:hello@stayneos.com" className="text-primary hover:underline">hello@stayneos.com</a> or call +1 (647) 862-6518.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
