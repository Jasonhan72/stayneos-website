export type PricingTier = 'monthly' | 'quarterly' | 'annual';

export type PricingTiers = Record<PricingTier, number>;

export function calculateTierDiscountPercent(monthlyRate: number, tierRate: number): number {
  if (!Number.isFinite(monthlyRate) || !Number.isFinite(tierRate) || monthlyRate <= 0 || tierRate <= 0) {
    return 0;
  }

  return Math.max(0, Math.round(((monthlyRate - tierRate) / monthlyRate) * 100));
}

export function getTierDiscountPercent(tiers: PricingTiers, tier: PricingTier): number {
  if (tier === 'monthly') return 0;
  return calculateTierDiscountPercent(tiers.monthly, tiers[tier]);
}
