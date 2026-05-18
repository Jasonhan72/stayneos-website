'use client';

import { ReactNode } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { STRIPE_PUBLISHABLE_KEY } from '@/lib/stripe';
import { useI18n } from '@/lib/i18n';

// 确保 publishable key 存在
if (!STRIPE_PUBLISHABLE_KEY) {
  if (process.env.NODE_ENV !== 'production') console.warn('Stripe publishable key is not set');
}

// 加载 Stripe
const stripePromise = STRIPE_PUBLISHABLE_KEY
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
}

// Map our internal locale codes to the locales Stripe Elements understands.
// Stripe accepts BCP-47 codes; we only ship en / zh / fr at the moment.
function toStripeLocale(locale: string): 'en' | 'zh' | 'fr-CA' | 'auto' {
  if (locale === 'zh') return 'zh';
  if (locale === 'fr') return 'fr-CA';
  if (locale === 'en') return 'en';
  return 'auto';
}

export default function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const { locale } = useI18n();

  if (!stripePromise) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700">
        支付系统配置错误，请联系客服
      </div>
    );
  }

  const options = clientSecret
    ? {
        clientSecret,
        locale: toStripeLocale(locale),
        appearance: { theme: 'stripe' as const },
      }
    : { locale: toStripeLocale(locale) };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
