import { Property } from "@/components/property/PropertyCard";

export type StayType = 'NIGHTLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type StayTypeParam = string | StayType | Lowercase<StayType> | null | undefined;

export interface BookingCalculation {
  nights: number;
  months: number;
  stayType: StayType;
  unitCount: number;
  unitRate: number;
  unitLabel: 'night' | 'month' | 'quarter' | 'year';
  basePrice: number;
  ratePerMonth: number;
  tierName: 'Nightly' | 'Monthly' | 'Quarterly' | 'Annual';
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  discount: number;
  discountRate: number;
  discountPercentage: number;
  tax: number;
  total: number;
  isMonthly: boolean;
  meetsMinNights: boolean;
  minNights: number;
  minimumUnits: number;
  currency: string;
}

export function normalizeStayType(value?: StayTypeParam, fallback?: StayTypeParam): StayType {
  const raw = String(value || fallback || '').toLowerCase();
  if (raw === 'monthly' || raw === 'month') return 'MONTHLY';
  if (raw === 'quarterly' || raw === 'quarter') return 'QUARTERLY';
  if (raw === 'yearly' || raw === 'annual' || raw === 'year') return 'YEARLY';
  return 'NIGHTLY';
}

export function stayTypeToQuery(stayType: StayType): string {
  return stayType.toLowerCase();
}

function getNumber(property: Property, keys: string[], fallback = 0): number {
  const record = property as unknown as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && value !== '') {
      const numberValue = Number(value);
      if (Number.isFinite(numberValue) && numberValue > 0) return numberValue;
    }
  }
  return fallback;
}

export function getDefaultStayType(property: Property): StayType {
  const record = property as unknown as Record<string, unknown>;
  return normalizeStayType(record.defaultStayType as StayTypeParam, (property.minNights || 0) >= 28 || property.priceUnit === 'month' ? 'monthly' : 'nightly');
}

export function getStayTypeMinimumUnits(stayType: StayType): number {
  if (stayType === 'QUARTERLY') return 3;
  if (stayType === 'YEARLY') return 12;
  return 1;
}

export function getStayTypeUnitLabel(stayType: StayType): BookingCalculation['unitLabel'] {
  if (stayType === 'NIGHTLY') return 'night';
  if (stayType === 'QUARTERLY') return 'quarter';
  if (stayType === 'YEARLY') return 'year';
  return 'month';
}

/**
 * 计算预订价格
 * @param property 房源信息
 * @param checkIn 入住日期
 * @param checkOut 退房日期
 * @param stayTypeParam 短租/长租类型
 * @returns 预订计算结果
 */
export function calculateBookingPrice(
  property: Property,
  checkIn: string,
  checkOut: string,
  stayTypeParam?: StayTypeParam
): BookingCalculation {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const nights = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const months = Math.max(1, Math.ceil(nights / 30));
  const stayType = normalizeStayType(stayTypeParam, getDefaultStayType(property));

  const monthlyRate = getNumber(property, ['monthlyRate', 'priceMonthly', 'monthlyPrice', 'price'], Number(property.price || 0));
  const nightlyRate = getNumber(property, ['nightlyRate', 'pricePerNight'], Math.max(1, Math.round(monthlyRate / 30)));
  const quarterlyRate = getNumber(property, ['quarterlyRate', 'priceQuarterly', 'quarterlyPrice'], Math.round(monthlyRate * 0.92));
  const yearlyRate = getNumber(property, ['yearlyRate', 'priceAnnual', 'annualPrice'], Math.round(monthlyRate * 0.85));

  const minNights = stayType === 'NIGHTLY' ? (property.minNights || 1) : getStayTypeMinimumUnits(stayType) * 30;
  const minimumUnits = getStayTypeMinimumUnits(stayType);

  let unitCount = nights;
  let unitRate = nightlyRate;
  let unitLabel: BookingCalculation['unitLabel'] = 'night';
  let ratePerMonth = monthlyRate;
  let tierName: BookingCalculation['tierName'] = 'Nightly';
  let subtotal = nights * nightlyRate;
  let cleaningFee = property.cleaningFee || 80;
  let serviceFee = Math.round(subtotal * 0.1);
  let discountRate = 1;
  let discountPercentage = 0;

  if (stayType !== 'NIGHTLY') {
    if (nights >= 30) {
      unitCount = months;
      unitLabel = getStayTypeUnitLabel(stayType);
      cleaningFee = 0;
      serviceFee = 0;

      if (stayType === 'YEARLY') {
        ratePerMonth = yearlyRate;
        tierName = 'Annual';
      } else if (stayType === 'QUARTERLY') {
        ratePerMonth = quarterlyRate;
        tierName = 'Quarterly';
      } else {
        ratePerMonth = monthlyRate;
        tierName = 'Monthly';
        if (property.monthlyDiscount) {
          discountPercentage = property.monthlyDiscount;
          discountRate = (100 - property.monthlyDiscount) / 100;
        }
      }

      unitRate = Math.round(ratePerMonth * discountRate);
      subtotal = unitCount * unitRate;
    }
    // else: nights < 30 on a monthly property → use nightly pricing (already set above)
  }

  const originalSubtotal = (stayType !== 'NIGHTLY' && nights >= 30) ? unitCount * ratePerMonth : subtotal;
  const discount = Math.max(0, originalSubtotal - subtotal);
  const tax = Math.round((subtotal + cleaningFee + serviceFee) * 0.13);
  const total = subtotal + cleaningFee + serviceFee + tax;

  return {
    nights,
    months,
    stayType,
    unitCount,
    unitRate,
    unitLabel,
    basePrice: unitRate,
    ratePerMonth,
    tierName,
    subtotal,
    cleaningFee,
    serviceFee,
    discount,
    discountRate,
    discountPercentage,
    tax,
    total,
    isMonthly: stayType !== 'NIGHTLY',
    meetsMinNights: stayType === 'NIGHTLY' ? nights >= minNights : months >= minimumUnits,
    minNights,
    minimumUnits,
    currency: property.currency || 'CAD',
  };
}

/**
 * 验证预订日期
 */
export function validateBookingDates(
  checkIn: string,
  checkOut: string,
  minNights: number = 1,
  stayTypeParam?: StayTypeParam
): { valid: boolean; error?: string } {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: '请选择有效的日期' };
  }
  
  if (start < today) {
    return { valid: false, error: '入住日期不能是过去' };
  }
  
  if (end <= start) {
    return { valid: false, error: '退房日期必须在入住日期之后' };
  }
  
  const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const stayType = stayTypeParam ? normalizeStayType(stayTypeParam) : 'NIGHTLY';
  if (stayType !== 'NIGHTLY') {
    const months = Math.max(1, Math.ceil(nights / 30));
    const minMonths = getStayTypeMinimumUnits(stayType);
    if (months < minMonths) {
      return { valid: false, error: `最少需要预订 ${minMonths} 个月` };
    }
  } else if (nights < minNights) {
    return { valid: false, error: `最少需要预订 ${minNights} 天` };
  }
  
  return { valid: true };
}

/**
 * 生成预订编号
 */
export function generateBookingNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `STY-${timestamp}-${random}`;
}

/**
 * 格式化日期显示
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 计算剩余支付金额
 */
export function calculateRemainingAmount(total: number, paid: number): number {
  return Math.max(0, total - paid);
}
