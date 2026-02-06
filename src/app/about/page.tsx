import { Metadata } from 'next';
import Image from 'next/image';
import { Container } from '@/components/ui';
import { 
  Target, 
  Clock, 
  MapPin, 
  Lightbulb, 
  Hotel, 
  FileText, 
  Home, 
  CheckCircle2,
  Headphones,
  BadgeCheck,
  Heart,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export const metadata: Metadata = {
  title: '关于我们 | StayNeos',
  description: '了解 StayNeos 的使命、故事和承诺。我们为商务人士和异地居住者提供多伦多高端行政公寓，让短期租赁变得简单、轻松、无压力。',
  keywords: ['关于 StayNeos', '公司介绍', '使命', '高端公寓', '多伦多'],
  openGraph: {
    title: '关于 StayNeos - 多伦多高端行政公寓',
    description: '了解 StayNeos 的使命、故事和承诺',
    type: 'website',
    locale: 'zh_CN',
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-primary py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
        </div>
        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              关于 StayNeos
            </h1>
            <p className="text-lg md:text-xl text-primary-100 leading-relaxed">
              重新定义高端行政公寓体验，为商务人士和异地居住者提供家的温暖与专业的服务
            </p>
          </div>
        </Container>
      </section>

      {/* 我们的使命 */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="mb-8">
                <span className="text-accent font-semibold tracking-wider text-sm uppercase mb-3 block">
                  OUR MISSION
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">
                  我们的使命
                </h2>
              </div>
              <p className="text-neutral-600 text-lg leading-relaxed mb-8">
                StayNeos 致力于为现代商务人士和异地居住者打造完美的居住解决方案，
                让每一次出行都能享受到家的舒适与便利。
              </p>
              <div className="space-y-6">
                <MissionCard
                  icon={<Target className="w-6 h-6" />}
                  title="高端行政公寓"
                  description="为商务人士和异地居住者提供精选高端行政公寓，满足品质生活需求"
                />
                <MissionCard
                  icon={<Sparkles className="w-6 h-6" />}
                  title="简单轻松无压力"
                  description="让短期租赁变得简单、轻松、无压力，专注于您的工作和生活"
                />
                <MissionCard
                  icon={<Clock className="w-6 h-6" />}
                  title="灵活租期"
                  description="28天起租的灵活租期，支持月租、季租，适应您的行程安排"
                />
                <MissionCard
                  icon={<MapPin className="w-6 h-6" />}
                  title="核心地段"
                  description="精选多伦多核心地段优质房源，交通便利，生活配套完善"
                />
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] relative">
                <Image
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80"
                  alt="Modern luxury apartment"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-accent p-6 md:p-8 max-w-xs">
                <p className="text-3xl md:text-4xl font-bold text-primary mb-2">28+</p>
                <p className="text-primary-700 font-medium">天起灵活租期</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 我们的故事 */}
      <section className="py-20 lg:py-28 bg-neutral-50">
        <Container>
          <div className="text-center mb-16">
            <span className="text-accent font-semibold tracking-wider text-sm uppercase mb-3 block">
              OUR STORY
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              我们的故事
            </h2>
            <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
              从一次商务出差的困境中诞生，StayNeos 致力于解决现代出行者的居住难题
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StoryCard
              icon={<Lightbulb className="w-8 h-8" />}
              step="01"
              title="创始人洞察"
              description="商务出差和异地工作期间找到合适住所的困难——酒店空间狭小、长期租赁手续繁琐，市场缺乏真正为商务人士设计的居住方案。"
              image="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80"
            />
            <StoryCard
              icon={<Hotel className="w-8 h-8" />}
              step="02"
              title="传统酒店的局限"
              description="传统酒店空间小、无厨房、缺乏家的感觉。对于需要长期居住数周甚至数月的商务人士来说，这种体验既不舒适也不经济。"
              image="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80"
            />
            <StoryCard
              icon={<FileText className="w-8 h-8" />}
              step="03"
              title="长期租赁的不便"
              description="传统长期租赁合同复杂、需要购置家具、退租麻烦。对于短期居住需求，这些都不是理想的选择。"
              image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80"
            />
            <StoryCard
              icon={<Home className="w-8 h-8" />}
              step="04"
              title="StayNeos 解决方案"
              description="拎包入住的高端行政公寓——家具家电齐全、灵活租期、核心地段、专业服务。让每一次异地居住都像在家一样舒适。"
              image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80"
              highlighted
            />
          </div>
        </Container>
      </section>

      {/* 为什么选择我们 */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-square relative">
                    <Image
                      src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80"
                      alt="Luxury interior"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="aspect-[4/5] relative">
                    <Image
                      src="https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600&q=80"
                      alt="Modern living room"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="aspect-[4/5] relative">
                    <Image
                      src="https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=600&q=80"
                      alt="Elegant bedroom"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="aspect-square relative">
                    <Image
                      src="https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=600&q=80"
                      alt="Modern kitchen"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="mb-8">
                <span className="text-accent font-semibold tracking-wider text-sm uppercase mb-3 block">
                  WHY CHOOSE US
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">
                  为什么选择我们
                </h2>
              </div>
              <p className="text-neutral-600 text-lg leading-relaxed mb-8">
                我们不仅仅是提供住宿，更是为您打造一个在异地也能安心工作和生活的家。
              </p>
              <div className="space-y-6">
                <WhyChooseCard
                  icon={<CheckCircle2 className="w-6 h-6" />}
                  title="精选房源"
                  description="严格筛选，只选最佳地段。每一处房源都经过我们专业团队的实地考察和质量评估。"
                />
                <WhyChooseCard
                  icon={<Clock className="w-6 h-6" />}
                  title="灵活租期"
                  description="28天起租，支持月租、季租。无论您需要居住多久，我们都能满足您的需求。"
                />
                <WhyChooseCard
                  icon={<Home className="w-6 h-6" />}
                  title="拎包入住"
                  description="家具家电齐全，无需购置。从床品到厨具，从 WiFi 到清洁服务，一切准备就绪。"
                />
                <WhyChooseCard
                  icon={<Headphones className="w-6 h-6" />}
                  title="24/7 管家服务"
                  description="任何问题随时解决。我们的专业团队全天候待命，确保您的居住体验完美无瑕。"
                />
                <WhyChooseCard
                  icon={<BadgeCheck className="w-6 h-6" />}
                  title="透明价格"
                  description="无隐藏费用，所见即所得。我们承诺价格透明，让您的预算更加可控。"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 我们的承诺 */}
      <section className="py-20 lg:py-28 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <Image
            src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1920&q=80"
            alt="Background"
            fill
            className="object-cover"
          />
        </div>
        <Container className="relative z-10">
          <div className="text-center mb-16">
            <span className="text-accent font-semibold tracking-wider text-sm uppercase mb-4 block">
              OUR COMMITMENT
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              我们的承诺
            </h2>
            <p className="text-primary-100 text-lg max-w-2xl mx-auto">
              我们向每一位客户承诺，提供超越期望的居住体验
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CommitmentCard
              icon={<Heart className="w-10 h-10" />}
              title="高品质居住体验"
              description="我们精心挑选每一处房源，确保品质卓越。从家具到设施，从服务到细节，我们追求卓越。"
            />
            <CommitmentCard
              icon={<Home className="w-10 h-10" />}
              title="家的温暖"
              description="让每一次异地居住都像在家一样舒适。我们理解家的意义，致力于为您打造温馨的居住空间。"
            />
            <CommitmentCard
              icon={<TrendingUp className="w-10 h-10" />}
              title="持续优化服务"
              description="我们不断倾听客户反馈，持续优化服务，超越客户期望。您的满意是我们永恒的追求。"
            />
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="bg-accent p-8 md:p-12 lg:p-16 text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-4">
              准备好体验 StayNeos 了吗？
            </h2>
            <p className="text-primary-700 text-lg mb-8 max-w-2xl mx-auto">
              浏览我们的精选房源，找到您在多伦多的理想居所
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/properties"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-semibold hover:bg-primary-700 transition-colors"
              >
                浏览房源
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary font-semibold hover:bg-neutral-100 transition-colors border border-primary"
              >
                联系我们
              </a>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}

// 子组件

function MissionCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 bg-accent/10 flex items-center justify-center text-accent">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-neutral-900 mb-1">{title}</h3>
        <p className="text-neutral-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function StoryCard({
  icon,
  step,
  title,
  description,
  image,
  highlighted = false,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  description: string;
  image: string;
  highlighted?: boolean;
}) {
  return (
    <div className={`group ${highlighted ? 'md:-mt-4' : ''}`}>
      <div className="aspect-[4/3] relative mb-6 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className={`absolute inset-0 ${highlighted ? 'bg-primary/20' : 'bg-gradient-to-t from-black/40 to-transparent'}`} />
        <div className="absolute top-4 left-4">
          <span className={`text-5xl font-bold ${highlighted ? 'text-accent' : 'text-white/80'}`}>
            {step}
          </span>
        </div>
      </div>
      <div className={`w-12 h-12 flex items-center justify-center mb-4 ${highlighted ? 'bg-accent text-primary' : 'bg-primary text-white'}`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-neutral-900 mb-3">{title}</h3>
      <p className="text-neutral-600 leading-relaxed text-sm">{description}</p>
    </div>
  );
}

function WhyChooseCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 p-4 bg-neutral-50 hover:bg-accent/5 transition-colors">
      <div className="flex-shrink-0 w-12 h-12 bg-accent text-primary flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-neutral-900 mb-1">{title}</h3>
        <p className="text-neutral-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function CommitmentCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-primary-800/50 backdrop-blur-sm p-8 border border-primary-700 hover:border-accent/50 transition-colors">
      <div className="text-accent mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      <p className="text-primary-100 leading-relaxed">{description}</p>
    </div>
  );
}
