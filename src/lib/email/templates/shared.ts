export type EmailLocale = 'en' | 'zh';

export interface EmailBooking {
  id: string;
  bookingNumber: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  nights?: number;
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
