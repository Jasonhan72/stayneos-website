import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Service Animals Policy | StayNeos',
  description: 'StayNeos policy on service animals and assistance animals.',
};

export default function ServiceAnimalsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Service Animals Policy</h1>
        
        <div className="prose prose-neutral max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Service Animals Welcome</h2>
            <p className="text-neutral-600">StayNeos welcomes service animals in all our properties. A service animal is any dog that is individually trained to do work or perform tasks for a person with a disability.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">No Additional Fees</h2>
            <p className="text-neutral-600">No pet fees or deposits are charged for service animals. Service animals are not considered pets.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Guest Responsibilities</h2>
            <ul className="list-disc pl-6 text-neutral-600 space-y-2">
              <li>Service animals must be under the control of their handler at all times</li>
              <li>Guests are responsible for any damage caused by their service animal</li>
              <li>Service animals must be housebroken</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Emotional Support Animals</h2>
            <p className="text-neutral-600">Emotional support animals that do not meet the definition of a service animal may be subject to our standard pet policy. Please contact us in advance to discuss accommodations.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Contact</h2>
            <p className="text-neutral-600">For questions or to notify us about a service animal, please email <a href="mailto:hello@stayneos.com" className="text-primary hover:underline">hello@stayneos.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
