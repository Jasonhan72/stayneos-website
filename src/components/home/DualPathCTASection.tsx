import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, Container, Section } from '@/components/ui';

const paths = [
  {
    title: 'Browse premium furnished apartments',
    description:
      'Explore move-in ready residences designed for executives, families, and longer stays in Toronto.',
    href: '/properties',
    cta: 'View available homes',
  },
  {
    title: 'Plan relocation or business housing',
    description:
      'Get tailored support for project teams, temporary assignments, and managed corporate stays.',
    href: '/for-business',
    cta: 'See business solutions',
  },
];

export function DualPathCTASection() {
  return (
    <Section bg="white" className="py-12">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paths.map((path) => (
            <Card key={path.href} className="p-8 border border-neutral-200 hover:border-primary/40 transition-colors">
              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">{path.title}</h3>
              <p className="text-neutral-600 mb-6">{path.description}</p>
              <Link href={path.href} className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                {path.cta}
                <ArrowRight size={18} />
              </Link>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
