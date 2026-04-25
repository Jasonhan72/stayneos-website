export type AddressRecord = {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceRecord = {
  id: string;
  bookingId: string | null;
  amount: number;
  currency: string;
  status: string;
  stripeInvoiceId: string | null;
  issuedAt: string;
  paidAt: string | null;
  pdfUrl: string | null;
};

export type UserSessionRecord = {
  id: string;
  device: string;
  ip: string | null;
  userAgent: string | null;
  location: string | null;
  lastActiveAt: string;
  createdAt: string;
  revokedAt: string | null;
  isCurrent: boolean;
};

export type ExportRequestRecord = {
  id: string;
  status: 'pending' | 'processing' | 'ready' | 'expired';
  fileUrl: string | null;
  requestedAt: string;
  completedAt: string | null;
  expiresAt: string | null;
};

export type PreferencesRecord = {
  language: string;
  currency: string;
  theme: string;
  contentDensity: string;
  accessibilityOptions: {
    dateFormat: string;
    firstDayOfWeek: string;
    messageSort: string;
  };
};

export const DEFAULT_PREFERENCES: PreferencesRecord = {
  language: 'en',
  currency: 'CAD',
  theme: 'system',
  contentDensity: 'comfortable',
  accessibilityOptions: {
    dateFormat: 'MMM D, YYYY',
    firstDayOfWeek: 'monday',
    messageSort: 'newest',
  },
};

export function parseAccessibilityOptions(value: unknown): PreferencesRecord['accessibilityOptions'] {
  if (!value || typeof value !== 'string') return DEFAULT_PREFERENCES.accessibilityOptions;
  try {
    const parsed = JSON.parse(value) as Partial<PreferencesRecord['accessibilityOptions']>;
    return {
      dateFormat: typeof parsed.dateFormat === 'string' ? parsed.dateFormat : DEFAULT_PREFERENCES.accessibilityOptions.dateFormat,
      firstDayOfWeek: typeof parsed.firstDayOfWeek === 'string' ? parsed.firstDayOfWeek : DEFAULT_PREFERENCES.accessibilityOptions.firstDayOfWeek,
      messageSort: typeof parsed.messageSort === 'string' ? parsed.messageSort : DEFAULT_PREFERENCES.accessibilityOptions.messageSort,
    };
  } catch {
    return DEFAULT_PREFERENCES.accessibilityOptions;
  }
}

export function normalizePreferences(row?: Record<string, unknown> | null): PreferencesRecord {
  return {
    language: typeof row?.language === 'string' ? row.language : DEFAULT_PREFERENCES.language,
    currency: typeof row?.currency === 'string' ? row.currency : DEFAULT_PREFERENCES.currency,
    theme: typeof row?.theme === 'string' ? row.theme : DEFAULT_PREFERENCES.theme,
    contentDensity: typeof row?.content_density === 'string' ? row.content_density : DEFAULT_PREFERENCES.contentDensity,
    accessibilityOptions: parseAccessibilityOptions(row?.accessibility_options),
  };
}

export function detectDevice(userAgent: string | null | undefined): string {
  if (!userAgent) return 'Unknown device';
  const value = userAgent.toLowerCase();
  if (value.includes('iphone')) return 'iPhone';
  if (value.includes('ipad')) return 'iPad';
  if (value.includes('android')) return 'Android device';
  if (value.includes('mac os')) return 'Mac';
  if (value.includes('windows')) return 'Windows PC';
  if (value.includes('linux')) return 'Linux device';
  return 'Browser session';
}

export function getIpFromRequest(headers: Headers): string | null {
  const direct = headers.get('cf-connecting-ip') || headers.get('x-forwarded-for') || headers.get('x-real-ip');
  if (!direct) return null;
  return direct.split(',')[0]?.trim() || null;
}
