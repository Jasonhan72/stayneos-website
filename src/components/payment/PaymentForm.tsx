'use client';

import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui';
import { Loader2, CreditCard, Shield } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface PaymentFormProps {
  amount: number;
  currency: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function PaymentForm({ amount, currency, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { t, locale } = useI18n();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || t('payment.errorPaymentFailed', 'Payment failed. Please try again.'));
        onError(error.message || t('payment.errorPaymentFailed', 'Payment failed. Please try again.'));
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess();
      } else {
        setErrorMessage(t('payment.errorUnknownStatus', 'Payment status is unknown. Please check your booking later.'));
        onError(t('payment.errorUnknownStatus', 'Payment status is unknown. Please check your booking later.'));
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('payment.errorProcessingFailed', 'Payment processing failed.');
      setErrorMessage(t('payment.errorProcessingFailedRetry', 'Payment processing failed. Please try again.'));
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // 格式化金额显示
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : locale === 'fr' ? 'fr-CA' : 'en-CA', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 安全提示 */}
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 text-sm">
        <Shield size={16} />
        <span>{t('payment.secureInfo', 'Your payment information is encrypted and protected')}</span>
      </div>

      {/* Stripe Payment Element */}
      <div className="border border-neutral-200 rounded-lg p-4">
        <PaymentElement 
          options={{
            layout: 'tabs',
            // Disable Stripe Link autofill prompt for the same reason as
            // StripePaymentForm: Link's "Save info / Mobile number" card
            // ships in English regardless of the Elements locale.
            wallets: { applePay: 'never', googlePay: 'never' },
            defaultValues: {
              billingDetails: {
                name: '',
                email: '',
                phone: '',
                address: {
                  country: 'CA',
                },
              },
            },
          }}
        />
      </div>

      {/* 错误信息 */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      {/* 支付按钮 */}
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        isLoading={isProcessing}
        className="w-full py-4 text-lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin mr-2" size={20} />
            {t('booking.processing', 'Processing...')}
          </>
        ) : (
          <>
            <CreditCard className="mr-2" size={20} />
            {t('payment.confirmPayAmount', 'Confirm payment {amount}', {
              amount: formatAmount(amount, currency),
            })}
          </>
        )}
      </Button>

      {/* 支付说明 */}
      <p className="text-xs text-neutral-500 text-center">
        {t(
          'payment.termsNotice',
          'By confirming payment, you agree to our Terms of Service and Privacy Policy.'
        )}
        <br />
        {t(
          'payment.chargeTiming',
          'Your card will be charged according to the booking payment schedule.'
        )}
      </p>
    </form>
  );
}
