import { Check } from 'lucide-react';
import { getServerTranslation, resolveRequestLocale } from '@/lib/i18n-server';

export type BookingStep = 'review' | 'payment' | 'confirm';

interface Props {
  current: BookingStep;
}

const ORDER: BookingStep[] = ['review', 'payment', 'confirm'];

/**
 * Read-only 3-step progress bar shown across the booking flow.
 *   review  → /checkout/[id]
 *   payment → /payment/[id]
 *   confirm → /payment/success
 *
 * Pure server component: renders into SSR HTML before client hydration so
 * the progress bar is visible immediately (no flash). It accepts no event
 * handlers and reads its label translations on the server. Client pages
 * (CheckoutClient, PaymentClient) include it via the route's page.tsx
 * server wrapper, not directly.
 *
 * Clicking a step does NOT navigate — every step has side effects
 * (creating bookings, charging cards) that aren't safe to revisit by URL.
 */
export async function BookingStepIndicator({ current }: Props) {
  const locale = await resolveRequestLocale();
  const idx = ORDER.indexOf(current);

  const labels: Record<BookingStep, string> = {
    review: getServerTranslation(locale, 'booking.stepReview', 'Review'),
    payment: getServerTranslation(locale, 'booking.stepPayment', 'Payment'),
    confirm: getServerTranslation(locale, 'booking.stepConfirm', 'Confirmed'),
  };

  return (
    <ol className="mx-auto mb-6 flex w-full max-w-2xl items-center justify-between px-1 sm:mb-8 sm:px-0">
      {ORDER.map((step, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <li
            key={step}
            className="flex min-w-0 flex-1 items-center last:flex-none"
            aria-current={active ? 'step' : undefined}
          >
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              <span
                className={[
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition sm:h-8 sm:w-8',
                  done
                    ? 'bg-neutral-900 text-white'
                    : active
                    ? 'border-2 border-neutral-900 bg-white text-neutral-900'
                    : 'border border-neutral-300 bg-white text-neutral-400',
                ].join(' ')}
              >
                {done ? <Check size={14} strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={[
                  'truncate text-xs font-medium leading-tight sm:text-sm',
                  done || active ? 'text-neutral-900' : 'text-neutral-400',
                ].join(' ')}
              >
                {labels[step]}
              </span>
            </div>
            {i < ORDER.length - 1 ? (
              <div
                className={[
                  'mx-2 h-px min-w-4 flex-1 transition sm:mx-3 md:mx-4',
                  done ? 'bg-neutral-900' : 'bg-neutral-200',
                ].join(' ')}
                aria-hidden
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
