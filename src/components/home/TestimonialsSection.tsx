'use client';

import Image from 'next/image';
import { Star, Quote } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Chen',
    nameZh: '陈莎拉',
    role: 'Business Consultant',
    roleZh: '商务顾问',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    content: 'StayNeos made my 3-month project in Toronto so much easier. The apartment was fully equipped and the location was perfect.',
    contentZh: 'StayNeos 让我在多伦多的3个月项目轻松多了。公寓设施齐全，位置完美。',
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael Roberts',
    nameZh: '迈克尔·罗伯茨',
    role: 'Tech Executive',
    roleZh: '科技公司高管',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    content: 'Best corporate housing experience I\'ve had. The flexible lease terms and 24/7 support made all the difference.',
    contentZh: '这是我体验过的最好的企业住房。灵活的租期和24/7支持让一切都不一样。',
    rating: 5,
  },
  {
    id: 3,
    name: 'Emma Wilson',
    nameZh: '艾玛·威尔逊',
    role: 'Healthcare Professional',
    roleZh: '医疗专业人士',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    content: 'As someone who travels frequently for work, StayNeos has become my go-to. Quality apartments, seamless booking process.',
    contentZh: '作为经常出差的人，StayNeos 已成为我的首选。优质公寓，无缝预订流程。',
    rating: 5,
  },
];

export function TestimonialsSection() {
  const { t, locale } = useI18n();

  const getLocalizedContent = (testimonial: typeof testimonials[0]) => {
    if (locale === 'zh') {
      return {
        name: testimonial.nameZh,
        role: testimonial.roleZh,
        content: testimonial.contentZh,
      };
    }
    return {
      name: testimonial.name,
      role: testimonial.role,
      content: testimonial.content,
    };
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            {t('testimonials.title') || 'What Our Guests Say'}
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {t('testimonials.subtitle') || 'Join thousands of satisfied business travelers'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => {
            const localized = getLocalizedContent(testimonial);
            return (
              <div
                key={testimonial.id}
                className="bg-neutral-50 rounded-2xl p-8 relative"
              >
                <div className="absolute top-6 right-6">
                  <Quote size={32} className="text-primary/20" />
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                <p className="text-neutral-700 mb-6 leading-relaxed">
                  &ldquo;{localized.content}&rdquo;
                </p>

                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={testimonial.avatar}
                      alt={localized.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">{localized.name}</p>
                    <p className="text-sm text-neutral-500">{localized.role}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
