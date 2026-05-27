'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
interface StripePaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function StripePaymentForm({ amount, onSuccess, onError }: StripePaymentFormProps) {
  const { t } = useI18n();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error' | 'processing' | 'auth'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setPaymentStatus("error"); setMessage(error.message || t('payment.failed', 'Payment failed'));
      onError(error.message || 'Payment failed');
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setPaymentStatus('success'); setMessage(t('payment.success', 'Payment successful!'));
      onSuccess();
    } else if (paymentIntent && paymentIntent.status === 'requires_action') {
      // 3D Secure or other authentication required
      setPaymentStatus('auth'); setMessage(t('payment.authRequired', 'Additional authentication required...'));
    } else {
      setPaymentStatus('processing'); setMessage(t('payment.processing', 'Processing payment...'));
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-neutral-200 rounded-xl">
        <PaymentElement 
          options={{
            layout: 'tabs',
            // Disable Stripe Link autofill prompt: it forces an English
            // "Save my info / Mobile number" upsell card-element that
            // does not translate. We only ship card-based checkout.
            wallets: { applePay: 'never', googlePay: 'never' },
            defaultValues: {
              billingDetails: {
                name: '',
                email: '',
              },
            },
          }}
        />
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          paymentStatus === "success" 
            ? 'bg-green-50 text-green-700' 
            : 'bg-red-50 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-4 bg-black hover:bg-neutral-800 disabled:bg-neutral-300 text-white font-medium text-lg rounded-xl transition-colors"
      >
        {isProcessing ? 'Processing...' : `Pay $${amount.toLocaleString()}`}
      </button>
    </form>
  );
}
