'use client';

import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui';
import { Loader2, CreditCard, Shield } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  currency: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function PaymentForm({ amount, currency, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
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
        setErrorMessage(error.message || '支付失败，请重试');
        onError(error.message || '支付失败');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess();
      } else {
        setErrorMessage('支付状态未知，请稍后查看订单状态');
        onError('支付状态未知');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '支付处理失败';
      setErrorMessage('支付处理失败，请重试');
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // 格式化金额显示
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 安全提示 */}
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 text-sm">
        <Shield size={16} />
        <span>您的支付信息已加密保护</span>
      </div>

      {/* Stripe Payment Element */}
      <div className="border border-neutral-200 rounded-lg p-4">
        <PaymentElement 
          options={{
            layout: 'tabs',
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
            处理中...
          </>
        ) : (
          <>
            <CreditCard className="mr-2" size={20} />
            确认支付 {formatAmount(amount, currency)}
          </>
        )}
      </Button>

      {/* 支付说明 */}
      <p className="text-xs text-neutral-500 text-center">
        点击&quot;确认支付&quot;即表示您同意我们的服务条款和隐私政策。
        <br />
        您的卡将在入住后24小时内被扣款。
      </p>
    </form>
  );
}
