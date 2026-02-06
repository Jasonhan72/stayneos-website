'use client';

import { ReactNode } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { STRIPE_PUBLISHABLE_KEY } from '@/lib/stripe';

// 确保 publishable key 存在
if (!STRIPE_PUBLISHABLE_KEY) {
  console.warn('Stripe publishable key is not set');
}

// 加载 Stripe
const stripePromise = STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
}

export default function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  if (!stripePromise) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700">
        支付系统配置错误，请联系客服
      </div>
    );
  }

  const options = clientSecret 
    ? { clientSecret, appearance: { theme: 'stripe' as const } }
    : undefined;

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
