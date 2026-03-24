'use client';

import Image from 'next/image';
import { Container } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import {
  Target, Clock, MapPin, Lightbulb, Hotel, FileText, Home,
  CheckCircle2, Headphones, BadgeCheck, Heart, Sparkles, TrendingUp
} from 'lucide-react';

export default function AboutContent() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-primary py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image src="/images/cooper-55-e98a880d.jpg" alt="Toronto skyline view from a NEOS property" fill className="object-cover" priority={true} />
        </div>
        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">{t('aboutPage.title')}</h1>
            <p className="text-lg md:text-xl text-primary-100 leading-relaxed">{t('aboutPage.heroSubtitle')}</p>
          </div>
        </Container>
      </section>

      {/* Mission */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="mb-8">
                <span className="text-accent font-semibold tracking-wider text-sm uppercase mb-3 block">{t('aboutPage.missionLabel')}</span>
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">{t('aboutPage.missionTitle')}</h2>
              </div>
              <p className="text-neutral-600 text-lg leading-relaxed mb-8">{t('aboutPage.missionDesc')}</p>
              <div className="space-y-6">
                <MissionCard icon={<Target className="w-6 h-6" />} title={t('aboutPage.missionItem1Title')} description={t('aboutPage.missionItem1Desc')} />
                <MissionCard icon={<Sparkles className="w-6 h-6" />} title={t('aboutPage.missionItem2Title')} description={t('aboutPage.missionItem2Desc')} />
                <MissionCard icon={<Clock className="w-6 h-6" />} title={t('aboutPage.missionItem3Title')} description={t('aboutPage.missionItem3Desc')} />
                <MissionCard icon={<MapPin className="w-6 h-6" />} title={t('aboutPage.missionItem4Title')} description={t('aboutPage.missionItem4Desc')} />
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] relative">
                <Image src="/images/cooper-55-c5e8357d.jpg" alt="Living room in a NEOS furnished suite" fill className="object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-accent p-6 md:p-8 max-w-xs">
                <p className="text-3xl md:text-4xl font-bold text-primary mb-2">28+</p>
                <p className="text-primary-700 font-medium">{t('aboutPage.daysFlexible')}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Story */}
      <section className="py-20 lg:py-28 bg-neutral-50">
        <Container>
          <div className="text-center mb-16">
            <span className="text-accent font-semibold tracking-wider text-sm uppercase mb-3 block">{t('aboutPage.storyLabel')}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">{t('aboutPage.storyTitle')}</h2>
            <p className="text-neutral-600 text-lg max-w-2xl mx-auto">{t('aboutPage.storyDesc')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StoryCard icon={<Lightbulb className="w-8 h-8" />} step="01" title={t('aboutPage.story1Title')} description={t('aboutPage.story1Desc')} image="/images/cooper-55-dining.jpg" />
            <StoryCard icon={<Hotel className="w-8 h-8" />} step="02" title={t('aboutPage.story2Title')} description={t('aboutPage.story2Desc')} image="/images/simcoe-238-living.jpg" />
            <StoryCard icon={<FileText className="w-8 h-8" />} step="03" title={t('aboutPage.story3Title')} description={t('aboutPage.story3Desc')} image="/images/wellesley-1607-kitchen.jpg" />
            <StoryCard icon={<Home className="w-8 h-8" />} step="04" title={t('aboutPage.story4Title')} description={t('aboutPage.story4Desc')} image="/images/cooper-55-b16f7ae9.jpg" highlighted />
          </div>
        </Container>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-square relative"><Image src="/images/simcoe-238-kitchen.jpg" alt="Kitchen in a NEOS furnished suite" fill className="object-cover" /></div>
                  <div className="aspect-[4/5] relative"><Image src="/images/cooper-55-a12c07ee.jpg" alt="Living space in a NEOS property" fill className="object-cover" /></div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="aspect-[4/5] relative"><Image src="/images/wellesley-1607-bedroom.jpg" alt="Bedroom in a NEOS furnished suite" fill className="object-cover" /></div>
                  <div className="aspect-square relative"><Image src="/images/wellesley-1607-bath.jpg" alt="Bathroom in a NEOS furnished suite" fill className="object-cover" /></div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="mb-8">
                <span className="text-accent font-semibold tracking-wider text-sm uppercase mb-3 block">{t('aboutPage.whyLabel')}</span>
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">{t('aboutPage.whyTitle')}</h2>
              </div>
              <p className="text-neutral-600 text-lg leading-relaxed mb-8">{t('aboutPage.whyDesc')}</p>
              <div className="space-y-6">
                <WhyChooseCard icon={<CheckCircle2 className="w-6 h-6" />} title={t('aboutPage.why1Title')} description={t('aboutPage.why1Desc')} />
                <WhyChooseCard icon={<Clock className="w-6 h-6" />} title={t('aboutPage.why2Title')} description={t('aboutPage.why2Desc')} />
                <WhyChooseCard icon={<Home className="w-6 h-6" />} title={t('aboutPage.why3Title')} description={t('aboutPage.why3Desc')} />
                <WhyChooseCard icon={<Headphones className="w-6 h-6" />} title={t('aboutPage.why4Title')} description={t('aboutPage.why4Desc')} />
                <WhyChooseCard icon={<BadgeCheck className="w-6 h-6" />} title={t('aboutPage.why5Title')} description={t('aboutPage.why5Desc')} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Commitment */}
      <section className="py-20 lg:py-28 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <Image src="/images/cooper-55-cff56997.jpg" alt="Interior detail from a NEOS property" fill className="object-cover" />
        </div>
        <Container className="relative z-10">
          <div className="text-center mb-16">
            <span className="text-accent font-semibold tracking-wider text-sm uppercase mb-4 block">{t('aboutPage.commitLabel')}</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">{t('aboutPage.commitTitle')}</h2>
            <p className="text-primary-100 text-lg max-w-2xl mx-auto">{t('aboutPage.commitDesc')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CommitmentCard icon={<Heart className="w-10 h-10" />} title={t('aboutPage.commit1Title')} description={t('aboutPage.commit1Desc')} />
            <CommitmentCard icon={<Home className="w-10 h-10" />} title={t('aboutPage.commit2Title')} description={t('aboutPage.commit2Desc')} />
            <CommitmentCard icon={<TrendingUp className="w-10 h-10" />} title={t('aboutPage.commit3Title')} description={t('aboutPage.commit3Desc')} />
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="bg-accent p-8 md:p-12 lg:p-16 text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-4">{t('aboutPage.ctaTitle')}</h2>
            <p className="text-primary-700 text-lg mb-8 max-w-2xl mx-auto">{t('aboutPage.ctaDesc')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/properties" className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-semibold hover:bg-primary-700 transition-colors">{t('aboutPage.ctaBrowse')}</a>
              <a href="/contact" className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary font-semibold hover:bg-neutral-100 transition-colors border border-primary">{t('aboutPage.ctaContact')}</a>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}

function MissionCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 bg-accent/10 flex items-center justify-center text-accent">{icon}</div>
      <div>
        <h3 className="font-semibold text-neutral-900 mb-1">{title}</h3>
        <p className="text-neutral-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function StoryCard({ icon, step, title, description, image, highlighted = false }: { icon: React.ReactNode; step: string; title: string; description: string; image: string; highlighted?: boolean }) {
  return (
    <div className={`group ${highlighted ? 'md:-mt-4' : ''}`}>
      <div className="aspect-[4/3] relative mb-6 overflow-hidden">
        <Image src={image} alt={title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className={`absolute inset-0 ${highlighted ? 'bg-primary/20' : 'bg-gradient-to-t from-black/40 to-transparent'}`} />
        <div className="absolute top-4 left-4"><span className={`text-5xl font-bold ${highlighted ? 'text-accent' : 'text-white/80'}`}>{step}</span></div>
      </div>
      <div className={`w-12 h-12 flex items-center justify-center mb-4 ${highlighted ? 'bg-accent text-primary' : 'bg-primary text-white'}`}>{icon}</div>
      <h3 className="text-xl font-semibold text-neutral-900 mb-3">{title}</h3>
      <p className="text-neutral-600 leading-relaxed text-sm">{description}</p>
    </div>
  );
}

function WhyChooseCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4 p-4 bg-neutral-50 hover:bg-accent/5 transition-colors">
      <div className="flex-shrink-0 w-12 h-12 bg-accent text-primary flex items-center justify-center">{icon}</div>
      <div>
        <h3 className="font-semibold text-neutral-900 mb-1">{title}</h3>
        <p className="text-neutral-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function CommitmentCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-primary-800/50 backdrop-blur-sm p-8 border border-primary-700 hover:border-accent/50 transition-colors">
      <div className="text-accent mb-6">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      <p className="text-primary-100 leading-relaxed">{description}</p>
    </div>
  );
}
