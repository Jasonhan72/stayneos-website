export type EmailLocale = 'en' | 'zh';
export type EmailStayType = 'NIGHTLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface EmailBooking {
  id: string;
  bookingNumber: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  nights?: number;
  stayType?: EmailStayType | string | null;
  unitCount?: number | null;
  unitRate?: number | null;
  guests?: number;
  guestName?: string | null;
  guestEmail?: string | null;
  totalPrice: number;
  currency: string;
}

export interface EmailProperty {
  id: string;
  slug?: string;
  title: string;
  titleZh?: string | null;
  address?: string | null;
  city?: string | null;
}

export interface TemplateResult {
  subject: string;
  html: string;
  text: string;
}

export function normalizeLocale(locale?: string | null): EmailLocale {
  return locale === 'zh' || locale === 'zh-CN' || locale === 'zh-TW' ? 'zh' : 'en';
}

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://www.stayneos.com').replace(/\/$/, '');
}

export function getSupportEmail(): string {
  return process.env.SUPPORT_EMAIL || 'hello@stayneos.com';
}

export function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatDate(date: string, locale: EmailLocale): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatMoney(amount: number, currency: string, locale: EmailLocale): string {
  return new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : 'en-CA', {
    style: 'currency',
    currency: currency || 'CAD',
  }).format(amount || 0);
}

export function stayTypeLabel(stayType: string | null | undefined, locale: EmailLocale): string {
  const type = String(stayType || 'NIGHTLY').toUpperCase();
  if (locale === 'zh') {
    if (type === 'MONTHLY') return '月租';
    if (type === 'QUARTERLY') return '季租';
    if (type === 'YEARLY') return '年租';
    return '短租';
  }
  if (type === 'MONTHLY') return 'Monthly stay';
  if (type === 'QUARTERLY') return 'Quarterly stay';
  if (type === 'YEARLY') return 'Yearly stay';
  return 'Short stay';
}

export function stayDurationLabel(booking: EmailBooking, locale: EmailLocale): string {
  const type = String(booking.stayType || 'NIGHTLY').toUpperCase();
  const count = Number(booking.unitCount || booking.nights || 0);
  if (locale === 'zh') {
    if (type === 'NIGHTLY') return `${count} 晚`;
    if (type === 'QUARTERLY') return `${count} 个月（季租）`;
    if (type === 'YEARLY') return `${count} 个月（年租）`;
    return `${count} 个月`;
  }
  if (type === 'NIGHTLY') return `${count} ${count === 1 ? 'night' : 'nights'}`;
  if (type === 'QUARTERLY') return `${count} months (quarterly rate)`;
  if (type === 'YEARLY') return `${count} months (yearly rate)`;
  return `${count} ${count === 1 ? 'month' : 'months'}`;
}

export function propertyTitle(property: EmailProperty, locale: EmailLocale): string {
  return locale === 'zh' && property.titleZh ? property.titleZh : property.title;
}

export function renderShell(title: string, body: string): string {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;max-width:640px;margin:0 auto;color:#222;background:#fff;">
      <div style="padding:24px 0;border-bottom:1px solid #eee;">
        <div style="font-size:20px;font-weight:800;letter-spacing:.08em;color:#FF385C;">NEOS RENTALS</div>
      </div>
      <div style="padding:28px 0;">
        <h1 style="margin:0 0 20px;font-size:26px;line-height:1.25;color:#222;">${escapeHtml(title)}</h1>
        ${body}
      </div>
      <div style="padding:20px 0;border-top:1px solid #eee;color:#777;font-size:13px;line-height:1.6;">
        <p style="margin:0 0 4px;">NEOS RENTALS · Toronto furnished rentals</p>
        <p style="margin:0;">Need help? Reply to this email or contact ${escapeHtml(getSupportEmail())}.</p>
      </div>
    </div>
  `;
}

export function detailRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 0;color:#666;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:10px 0;color:#222;font-weight:600;vertical-align:top;">${escapeHtml(value)}</td>
    </tr>
  `;
}
