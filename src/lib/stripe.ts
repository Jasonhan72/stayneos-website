import Stripe from 'stripe';

// Create a mock stripe instance for build time when env vars are not available
const createStripeInstance = (): Stripe => {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('STRIPE_SECRET_KEY is not set - using mock stripe instance');
    // Return a mock object for build time
    return {} as Stripe;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover',
  });
};

export const stripe = createStripeInstance();

export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// Stripe 价格计算辅助函数
export function calculateStripeAmount(amountInCents: number): number {
  // Stripe 使用最小货币单位（分）
  return Math.round(amountInCents);
}

// 格式化金额显示
export function formatAmount(amount: number, currency: string = 'CAD'): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency,
  }).format(amount / 100);
}
