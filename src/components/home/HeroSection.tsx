import Image from 'next/image';
import { Container } from '@/components/ui';
import { HeroSearchBox } from './HeroSearchBox';

const heroCopy = {
  title: 'Premium Furnished Apartments',
  highlight: 'In Downtown Toronto',
  subtitle:
    'Move-in ready homes for monthly stays, relocation, corporate housing, and extended visits.',
  stats: [
    { value: '2+', label: 'Luxury residences' },
    { value: '100%', label: 'Fully managed stays' },
    { value: '24/7', label: 'Guest support' },
  ],
};

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center">
      <div className="absolute inset-0">
        <Image
          src="/images/cooper-55-e98a880d.jpg"
          alt="55 Cooper St lakefront view"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/70 via-neutral-900/50 to-neutral-900/70" />
      </div>

      <Container className="relative z-10 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {heroCopy.title}
            <br />
            <span className="text-accent">{heroCopy.highlight}</span>
          </h1>

          <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            {heroCopy.subtitle}
          </p>

          <HeroSearchBox />

          <div className="flex flex-wrap justify-center gap-8 mt-12 text-white">
            {heroCopy.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
