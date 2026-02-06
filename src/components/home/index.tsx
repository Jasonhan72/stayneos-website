// Blueground 风格首页 - 方形 UI
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Home,
  Briefcase,
  Clock,
  Headphones,
  ArrowRight,
  Star
} from 'lucide-react';
import { Button, Container, Section, Card, Badge } from '@/components/ui';
import DateRangePicker from '@/components/ui/DateRangePicker';

// ============================================================
// Hero Section - 全屏背景 + 搜索框
// ============================================================
export function HeroSection() {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80"
          alt="Luxury apartment"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/70 via-neutral-900/50 to-neutral-900/70" />
      </div>

      {/* Content */}
      <Container className="relative z-10 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            尊享高端行政公寓
            <br />
            <span className="text-accent">感受家的温暖</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            高端行政公寓，专为商务人士打造。灵活租期，拎包入住，24小时管家服务。
          </p>

          {/* Search Box - Blueground Style with Airbnb Date Picker */}
          <div className="bg-white p-4 shadow-2xl max-w-4xl mx-auto">
            {/* Location - Full Width */}
            <div className="mb-3">
              <div className="relative h-14">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <MapPin size={20} />
                </div>
                <input
                  type="text"
                  placeholder="搜索位置"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-full pl-12 pr-4 bg-neutral-50 border border-neutral-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-base"
                />
              </div>
            </div>
            
            {/* Date Range Picker - Full Width */}
            <div className="mb-3">
              <DateRangePicker
                checkIn={checkIn}
                checkOut={checkOut}
                onCheckInChange={setCheckIn}
                onCheckOutChange={setCheckOut}
                minNights={28}
                className="w-full"
              />
            </div>

            {/* Search Button - Full Width */}
            <Link href="/properties" className="block h-14">
              <Button variant="primary" size="lg" className="w-full h-full flex items-center justify-center">
                <Search size={20} className="mr-2" />
                搜索房源
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">2+</div>
              <div className="text-sm text-white/80">精选房源</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-white/80">入住满意度</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-white/80">客服支持</div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ============================================================
// Value Proposition - 四大价值支柱
// ============================================================
const valueProps = [
  {
    icon: Home,
    title: '精选房源',
    description: '只选多伦多最佳地段的高端公寓，每一处都经过严格筛选'
  },
  {
    icon: Briefcase,
    title: '拎包入住',
    description: '精美装修，设施齐全，从第一天起就能享受舒适生活'
  },
  {
    icon: Clock,
    title: '灵活租期',
    description: '28天起租，支持月租、季租，满足不同需求'
  },
  {
    icon: Headphones,
    title: '管家服务',
    description: '24小时专属支持，任何问题都能得到及时解决'
  }
];

export function ValuePropositionSection() {
  return (
    <Section bg="neutral">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
          为什么选择 StayNeos
        </h2>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          我们致力于为每一位客户提供卓越的居住体验
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {valueProps.map((prop) => (
          <div key={prop.title} className="text-center p-8 bg-white border border-neutral-200">
            <div className="w-16 h-16 mx-auto mb-6 bg-primary-100 flex items-center justify-center">
              <prop.icon className="text-primary" size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-neutral-900">{prop.title}</h3>
            <p className="text-neutral-600">{prop.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ============================================================
// Market Segments - 细分市场
// ============================================================
const segments = [
  {
    title: '商务出差',
    subtitle: '企业客户优惠',
    description: '为商务人士提供便捷住宿方案，靠近金融区，交通便利',
    cta: '了解企业方案',
    href: '/business',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80'
  },
  {
    title: '长期居住',
    subtitle: '月租享8折',
    description: '一个月以上享受优惠价格，适合长期项目或搬迁过渡',
    cta: '查看长租房源',
    href: '/properties',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'
  },
  {
    title: '搬迁过渡',
    subtitle: '灵活入住',
    description: '搬家期间的理想选择，无需长期承诺，即刻入住',
    cta: '立即预订',
    href: '/properties',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80'
  }
];

export function MarketSegmentsSection() {
  return (
    <Section bg="white">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
          适合您的居住方案
        </h2>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          无论商务出差、长期项目还是搬迁过渡，我们都有适合您的选择
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

// ============================================================
// Featured Properties - 精选房源
// ============================================================
const featuredProperties = [
  {
    id: '1',
    title: 'Cooper St 豪华湖景公寓',
    location: '5811-55 Cooper St, Toronto',
    price: 680,
    rating: 4.9,
    reviews: 42,
    image: '/images/cooper-55-c5e8357d.jpg',
    badges: ['精选', '3室3卫']
  },
  {
    id: '2',
    title: 'Simcoe St 高层精品公寓',
    location: '3709-238 Simcoe St, Toronto',
    price: 450,
    rating: 4.8,
    reviews: 38,
    image: '/images/simcoe-238-living.jpg',
    badges: ['新上架']
  }
];

export function FeaturedPropertiesSection() {
  return (
    <Section bg="neutral">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            精选房源
          </h2>
          <p className="text-lg text-neutral-600 max-w-xl">
            精选城市核心地段的高端公寓，每一处都是品质生活的体现
          </p>
        </div>
        
        <Link 
          href="/properties"
          className="inline-flex items-center text-primary font-medium hover:text-primary-700 transition-colors mt-4 md:mt-0"
        >
          查看全部房源
          <ArrowRight size={18} className="ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featuredProperties.map((property) => (
          <Card key={property.id} className="group">
            <Link href={`/property/${property.id}`}>
              <div className="aspect-[4/3] overflow-hidden relative">
                <Image
                  src={property.image}
                  alt={property.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                <div className="absolute top-4 left-4 flex gap-2">
                  {property.badges.map((badge) => (
                    <Badge 
                      key={badge}
                      variant={badge === '精选' ? 'primary' : 'default'}
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
                
                <button className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white transition-colors">
                  <Star size={18} className="text-neutral-400" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary transition-colors">
                    {property.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-accent fill-accent" />
                    <span className="text-sm font-medium">{property.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-neutral-500 mb-4">
                  <MapPin size={14} />
                  <span className="text-sm">{property.location}</span>
                </div>
                
                <div className="flex items-baseline justify-between pt-4 border-t border-neutral-200">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-neutral-900">
                      ${property.price}
                    </span>
                    <span className="text-neutral-500">CAD/晚</span>
                  </div>
                  
                  <span className="text-sm text-neutral-400">{property.reviews} 条评价</span>
                </div>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </Section>
  );
}

// ============================================================
// How It Works - 流程说明
// ============================================================
const steps = [
  {
    number: '01',
    title: '搜索房源',
    description: '浏览我们的精选房源，按位置、价格、设施筛选'
  },
  {
    number: '02',
    title: '在线预订',
    description: '选择入住日期，查看实时价格，一键完成预订'
  },
  {
    number: '03',
    title: '拎包入住',
    description: '专业管家迎接，设施齐全，即刻开始享受'
  }
];

export function HowItWorksSection() {
  return (
    <Section bg="white">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
          简单三步，轻松入住
        </h2>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          我们简化了整个流程，让您专注于享受居住体验
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div key={step.number} className="relative">
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-12 left-1/2 w-full h-px bg-neutral-200" />
            )}
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-primary text-white text-3xl font-bold mb-6">
                {step.number}
              </div>
              
              <h3 className="text-xl font-semibold mb-3 text-neutral-900">{step.title}</h3>
              
              <p className="text-neutral-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ============================================================
// CTA Section - 行动号召
// ============================================================
export function CTASection() {
  return (
    <section className="py-24 bg-primary">
      <Container>
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            准备好开启您的品质生活了吗？
          </h2>
          
          <p className="text-lg text-white/90 mb-10">
            立即浏览我们的精选房源，找到您在多伦多的理想居所
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button variant="secondary" size="lg" className="bg-accent text-neutral-900 hover:bg-accent-600 font-semibold">
                开始探索
              </Button>
            </Link>
            
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                联系我们
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
