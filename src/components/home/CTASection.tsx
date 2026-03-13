import Link from 'next/link';
import { Button, Container } from '@/components/ui';

export function CTASection() {
  return (
    <section className="py-24 bg-primary">
      <Container>
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready for a better extended stay in Toronto?
          </h2>

          <p className="text-lg text-white/90 mb-10">
            Browse available residences or contact StayNeos for tailored relocation and business housing support.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button variant="secondary" size="lg" className="bg-accent text-neutral-900 hover:bg-accent-600 font-semibold">
                Explore properties
              </Button>
            </Link>

            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                Contact StayNeos
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
