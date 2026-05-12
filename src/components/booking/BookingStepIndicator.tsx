'use client';

import { Check } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export type BookingStep = 'review' | 'payment' | 'confirm';

interface Props {
  current: BookingStep;
}

const ORDER: BookingStep[] = ['review', 'payment', 'confirm'];

/**
 * 3-step progress bar shown across the booking flow.
 *   review  → /checkout/[id]
 *   payment → /payment/[id]
 *   confirm → /payment/success
 *
 * Read-only — clicking a step does NOT navigate (the user has to use the
 * back button or the action inside each step). This is intentional: every
 * step has side effects (creating bookings, charging cards) that aren't
 * safe to revisit by URL alone.
 */
export function BookingStepIndicator({ current }: Props) {
  const { t } = useI18n();
  const idx = ORDER.indexOf(current);

  const labels: Record<BookingStep, string> = {
    review: t('booking.stepReview', 'Review'),
    payment: t('booking.stepPayment', 'Payment'),
    confirm: t('booking.stepConfirm', 'Confirmed'),
  };

  return (
    <ol className="mx-auto mb-8 flex w-full max-w-2xl items-center justify-between">
      {ORDER.map((step, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <li
            key={step}
            className="flex flex-1 items-center last:flex-none"
            aria-current={active ? 'step' : undefined}
          >
            <div className="flex items-center gap-2">
              <span
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition',
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
                  'text-sm font-medium',
                  done || active ? 'text-neutral-900' : 'text-neutral-400',
                ].join(' ')}
              >
                {labels[step]}
              </span>
            </div>
            {i < ORDER.length - 1 ? (
              <div
                className={[
                  'mx-3 h-px flex-1 transition md:mx-4',
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
