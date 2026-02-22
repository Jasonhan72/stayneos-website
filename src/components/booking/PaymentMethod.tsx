'use client';

import { useState } from 'react';
import { X, ChevronLeft, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaymentMethodProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onNext: (method: PaymentMethod) => void;
}

export type PaymentMethod = 'card' | 'paypal' | 'applepay';

// Simple SVG icons for payment methods
const VisaIcon = () => (
  <svg viewBox="0 0 48 16" className="h-4">
    <path fill="#1A1F71" d="M17.68 1.5l-4.2 9.9h-2.9l2-9.9h5.1zm13.5 6.6c0-2.6-3.6-2.7-3.6-3.9 0-.4.3-.8 1.1-.9.4-.1 1.5-.1 2.7.6l.5-2.2c-.7-.3-1.5-.5-2.5-.5-2.6 0-4.5 1.4-4.5 3.3 0 1.4 1 2.2 1.8 2.7.8.5 1.1.8 1.1 1.3 0 .7-.7 1-1.3 1-.9 0-1.8-.3-2.3-.5l-.5 2.3c.6.3 1.7.5 2.8.5 2.8 0 4.7-1.3 4.7-3.7z"/>
    <path fill="#1A1F71" d="M36.8 1.5h-2.5c-.8 0-1.4.2-1.7 1l-4.9 8.9h3l.7-1.9h3.5l.4 1.9h2.6l-2.1-9.9zm-3.2 5.3l1-2.7.6 2.7h-1.6z"/>
    <path fill="#1A1F71" d="M30.5 1.5l-2.8 9.9h-2.7l2.8-9.9h2.7z"/>
    <path fill="#1A1F71" d="M12.5 1.5l-4.2 9.9h-2.9l2-9.9h5.1z"/>
  </svg>
);

const MastercardIcon = () => (
  <svg viewBox="0 0 24 16" className="h-4">
    <circle cx="8" cy="8" r="6" fill="#EB001B"/>
    <circle cx="16" cy="8" r="6" fill="#F79E1B"/>
    <path fill="#FF5F00" d="M12 3.5c1.6 1.2 2.5 3 2.5 4.5s-1 3.3-2.5 4.5c-1.6-1.2-2.5-3-2.5-4.5s1-3.3 2.5-4.5z"/>
  </svg>
);

const AmexIcon = () => (
  <svg viewBox="0 0 48 16" className="h-4">
    <rect width="48" height="16" rx="2" fill="#006FCF"/>
    <text x="4" y="11" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial, sans-serif">AMEX</text>
  </svg>
);

const PaypalIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5">
    <path fill="#003087" d="M7.5 4.5h8.5c4.1 0 6.5 2.1 6 6.5-.3 3.1-2.1 5.5-5.5 5.5h-2c-.5 0-.8.3-.9.8l-.5 3.2c0 .3-.3.5-.5.5h-2.5c-.3 0-.5-.2-.5-.5l1.5-9.5c0-.3.3-.5.5-.5z"/>
    <path fill="#0070E0" d="M5 0h8c3.5 0 5.5 1.5 5 5-.3 2.5-1.8 4.5-5 4.5h-1.5c-.5 0-.8.3-.9.8l-.5 3c0 .3-.3.5-.5.5h-2c-.3 0-.5-.2-.5-.5l1.5-12c0-.2.3-.3.4-.3z"/>
    <path fill="#001C64" d="M5.5 14.5l-1 6c0 .3.2.5.5.5h2c.3 0 .5-.2.5-.5l.5-3.2c.1-.5.4-.8.9-.8h2c3.4 0 5.2-2.4 5.5-5.5.2-1.6-.1-2.9-.8-4H6.5c-.3 0-.5.2-.5.5l-.5 7z"/>
  </svg>
);

const ApplePayIcon = () => (
  <svg viewBox="0 0 48 24" className="h-5">
    <path fill="black" d="M11.6 3.2c.5-.6 1.3-1 2-1 .1 1-.3 2-.8 2.6-.5.6-1.3 1.1-2.1 1 0-.9.3-1.9.9-2.6zm1.6 2.4c1.2 0 2 .6 2.5.6.4 0 1.1-.6 1.9-.6 1.6 0 2.8 1.1 3.5 2.8-1.5.8-2.5 2.2-2.5 3.8 0 2.5 2.1 3.7 2.2 3.7-.1.1-.3.1-.5.1-1.2 0-2.1-.8-2.7-.8-.6 0-1.5.8-2.5.8-.3 0-1.2-.1-2-1-2.1-1.7-3.6-4.8-1.5-7.3 1-1.2 2.5-1.9 4-1.9.5 0 1.3.4 1.8.4.5 0 1.2-.4 2-.4z"/>
    <text x="20" y="14" fontSize="10" fontWeight="600" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fill="black">Pay</text>
  </svg>
);

export function PaymentMethod({
  isOpen,
  onClose,
  onBack,
  onNext,
}: PaymentMethodProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');

  if (!isOpen) return null;

  const paymentOptions = [
    {
      id: 'card' as PaymentMethod,
      label: 'Credit or debit card',
      icons: [<VisaIcon key="visa" />, <MastercardIcon key="mc" />, <AmexIcon key="amex" />],
    },
    {
      id: 'paypal' as PaymentMethod,
      label: 'PayPal',
      icons: [<PaypalIcon key="paypal" />],
    },
    {
      id: 'applepay' as PaymentMethod,
      label: 'Apple Pay',
      icons: [<ApplePayIcon key="apple" />],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-100">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-neutral-900" />
        </button>
        
        <button 
          onClick={onClose}
          className="p-2 -mr-2 hover:bg-neutral-100 rounded-full transition-colors"
        >
          <X size={24} className="text-neutral-900" />
        </button>
      </div>

      {/* Title */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-semibold text-neutral-900">Add a payment method</h1>
      </div>

      {/* Payment Options */}
      <div className="flex-1 px-4">
        <div className="border border-neutral-200 rounded-xl overflow-hidden">
          {paymentOptions.map((option, index) => (
            <button
              key={option.id}
              onClick={() => setSelectedMethod(option.id)}
              className={cn(
                "w-full flex items-center justify-between p-4 transition-colors",
                index !== paymentOptions.length - 1 && "border-b border-neutral-200",
                selectedMethod === option.id && "bg-neutral-50"
              )}
            >
              <div className="flex items-center gap-3">
                {option.id === 'card' ? (
                  <CreditCard size={20} className="text-neutral-700" />
                ) : (
                  option.icons[0]
                )}
                
                <div className="flex flex-col">
                  <span className="font-medium text-neutral-900">{option.label}</span>
                  {option.id === 'card' && (
                    <div className="flex items-center gap-1 mt-0.5">
                      {option.icons}
                    </div>
                  )}
                </div>
              </div>
              
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                selectedMethod === option.id ? "border-neutral-900" : "border-neutral-400"
              )}>
                {selectedMethod === option.id && (
                  <div className="w-3 h-3 bg-neutral-900 rounded-full" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-4">
        <button
          onClick={() => onNext(selectedMethod)}
          className="w-full py-4 bg-neutral-900 text-white font-semibold rounded-xl hover:bg-neutral-800 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default PaymentMethod;
