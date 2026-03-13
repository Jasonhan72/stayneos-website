import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge, Card, Section } from '@/components/ui';

const segments = [
  {
    title: 'Business travel',
    subtitle: 'Corporate-ready',
    description: 'Furnished residences for executives, project teams, and consultants who need a dependable downtown base.',
    cta: 'Explore business stays',
    href: '/for-business',
    image: '/images/cooper-55-dining.jpg',
  },
  {
    title: 'Long-term stays',
    subtitle: '30+ day living',
    description: 'Ideal for renovation gaps, temporary housing, and guests who want home-level comfort for longer periods.',
    cta: 'View long-term options',
    href: '/long-term',
    image: '/images/simcoe-238-living.jpg',
  },
  {
    title: 'Relocation support',
    subtitle: 'Move with certainty',
    description: 'A smoother landing for employees, families, and international arrivals transitioning into Toronto.',
    cta: 'See relocation-ready homes',
    href: '/properties',
    image: '/images/cooper-55-e98a880d.jpg',
  },
];

export function MarketSegmentsSection() {
  return (
    <Section bg="white">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
          Built for different stay scenarios
        </h2>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          NEOS supports relocation, business housing, and longer monthly stays with the same premium standard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {segments.map((segment) => (
          <Card key={segment.title} className="group">
            <div className="aspect-[4/3] overflow-hidden">
              <Image
                src={segment.image}
                alt={segment.title}
                width={800}
                height={600}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="p-6">
              <Badge variant="primary" className="mb-3">{segment.subtitle}</Badge>
              <h3 className="text-xl font-semibold mb-2 text-neutral-900">{segment.title}</h3>
              <p className="text-neutral-600 mb-4">{segment.description}</p>
              <Link
                href={segment.href}
                className="inline-flex items-center text-primary font-medium hover:text-primary-700 transition-colors"
              >
                {segment.cta}
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
