import { Property } from "@/components/property/PropertyCard";

export interface BookingCalculation {
  nights: number;
  basePrice: number;
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
  currency: string;
}

/**
 * 计算预订价格
 * @param property 房源信息
 * @param checkIn 入住日期
 * @param checkOut 退房日期
 * @returns 预订计算结果
 */
export function calculateBookingPrice(
  property: Property,
  checkIn: string,
  checkOut: string
): BookingCalculation {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  const minNights = property.minNights || 28;
  const meetsMinNights = nights >= minNights;
  const isMonthly = nights >= 28;
  
  // 基础价格
  const basePrice = property.price;
  
  // 月租折扣
  let discountRate = 1;
  let discountPercentage = 0;
  
  if (isMonthly && property.monthlyDiscount) {
    discountPercentage = property.monthlyDiscount;
    discountRate = (100 - property.monthlyDiscount) / 100;
  }
  
  const discountedPrice = Math.round(basePrice * discountRate);
  const subtotal = nights * discountedPrice;
  
  // 清洁费（从属性中获取或使用默认值）
  const cleaningFee = property.cleaningFee || 80;
  
  // 服务费（10%）
  const serviceFee = Math.round(subtotal * 0.1);
  
  // 折扣金额
  const discount = nights * basePrice - subtotal;
  
  // 税费（13% HST）
  const taxableAmount = subtotal + cleaningFee + serviceFee;
  const tax = Math.round(taxableAmount * 0.13);
  
  // 总计
  const total = subtotal + cleaningFee + serviceFee + tax;
  
  return {
    nights,
    basePrice,
    subtotal,
    cleaningFee,
    serviceFee,
    discount,
    discountRate,
    discountPercentage,
    tax,
    total,
    isMonthly,
    meetsMinNights,
    minNights,
    currency: 'CAD',
  };
}

/**
 * 验证预订日期
 */
export function validateBookingDates(
  checkIn: string,
  checkOut: string,
  minNights: number = 28
): { valid: boolean; error?: string } {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 检查日期是否有效
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: '请选择有效的日期' };
  }
  
  // 入住日期不能是过去
  if (start < today) {
    return { valid: false, error: '入住日期不能是过去' };
  }
  
  // 退房日期必须在入住日期之后
  if (end <= start) {
    return { valid: false, error: '退房日期必须在入住日期之后' };
  }
  
  // 计算晚数
  const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  // 检查最低入住天数
  if (nights < minNights) {
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
