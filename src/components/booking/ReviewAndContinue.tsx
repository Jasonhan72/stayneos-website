'use client';

import { useState, useMemo } from 'react';
import { X, Star, ChevronLeft, Diamond } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface ReviewAndContinueProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  onChangeDates: () => void;
  onChangeGuests: () => void;
  property: {
    id: string;
    title: string;
    image: string;
    rating: number;
    reviewCount: number;
    isGuestFavourite?: boolean;
  };
  bookingDetails: {
    checkIn: string;
    checkOut: string;
    guests: number;
    pricePerNight: number;
    cleaningFee: number;
    serviceFee: number;
    tax: number;
    total: number;
    currency?: string;
  };
  cancellationDate?: string;
}

type PaymentOption = 'full' | 'split';

export function ReviewAndContinue({
  isOpen,
  onClose,
  onBack,
  onNext,
  onChangeDates,
  onChangeGuests,
  property,
  bookingDetails,
  cancellationDate = 'Mar 6',
}: ReviewAndContinueProps) {
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('full');
  const [showPriceDetails, setShowPriceDetails] = useState(false);

  const {
    checkIn,
    checkOut,
    guests,
    pricePerNight,
    cleaningFee,
    serviceFee,
    tax,
    total,
    currency = 'CAD'
  } = bookingDetails;

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }, [checkIn, checkOut]);

  const subtotal = nights * pricePerNight;

  const formatDateRange = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${end.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`;
  };

  // Split payment calculation
  const firstPayment = Math.round(total * 0.5);
  const secondPayment = total - firstPayment;
  const secondPaymentDate = 'Mar 21';

  if (!isOpen) return null;

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
        <h1 className="text-2xl font-semibold text-neutral-900">Review and continue</h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        {/* Property Card */}
        <div className="border border-neutral-200 rounded-2xl p-4 mb-6">
          <div className="flex gap-4">
            <div className="relative w-24 h-20 flex-shrink-0 rounded-xl overflow-hidden">
              <Image 
                src={property.image} 
                alt={property.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-neutral-900 line-clamp-2">{property.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Star size={14} className="fill-black" />
                <span className="text-sm">{property.rating} ({property.reviewCount})</span>
                {property.isGuestFavourite && (
                  <span className="text-sm text-neutral-600">Guest favourite</span>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-200 my-4" />

          {/* Dates Row */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-neutral-900">Dates</p>
              <p className="text-sm text-neutral-600">{formatDateRange()}</p>
              <div className="flex items-center gap-1 mt-1">
                <Diamond size={14} className="text-rose-500" />
                <span className="text-sm text-rose-600 font-medium">Rare find</span>
              </div>
            </div>
            <button 
              onClick={onChangeDates}
              className="px-4 py-2 text-sm font-medium text-neutral-900 border border-neutral-300 rounded-lg hover:border-neutral-900 transition-colors"
            >
              Change
            </button>
          </div>

          <div className="border-t border-neutral-200" />

          {/* Guests Row */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-neutral-900">Guests</p>
              <p className="text-sm text-neutral-600">{guests} {guests === 1 ? 'adult' : 'adults'}</p>
            </div>
            <button 
              onClick={onChangeGuests}
              className="px-4 py-2 text-sm font-medium text-neutral-900 border border-neutral-300 rounded-lg hover:border-neutral-900 transition-colors"
            >
              Change
            </button>
          </div>

          <div className="border-t border-neutral-200" />

          {/* Total Price Row */}
          <div className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900">Total price</p>
                <p className="text-sm text-neutral-600">
                  ${total.toLocaleString()} including taxes 
                  <span className="underline">{currency}</span>
                </p>
              </div>
              <button 
                onClick={() => setShowPriceDetails(!showPriceDetails)}
                className="px-4 py-2 text-sm font-medium text-neutral-900 border border-neutral-300 rounded-lg hover:border-neutral-900 transition-colors"
              >
                Details
              </button>
            </div>

            {/* Price Details */}
            {showPriceDetails && (
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600 underline">${pricePerNight.toLocaleString()} x {nights} nights</span>
                  <span className="text-neutral-900">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 underline">Cleaning fee</span>
                  <span className="text-neutral-900">${cleaningFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 underline">Service fee</span>
                  <span className="text-neutral-900">${serviceFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Taxes</span>
                  <span className="text-neutral-900">${tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200">
                  <span className="font-medium text-neutral-900">Total ({currency})</span>
                  <span className="font-semibold text-neutral-900">${total.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-neutral-200" />

          {/* Free Cancellation */}
          <div className="py-3">
            <p className="font-medium text-neutral-900">Free cancellation</p>
            <p className="text-sm text-neutral-600">
              Cancel before {cancellationDate} for a full refund. 
              <span className="underline font-medium">Full policy</span>
            </p>
          </div>
        </div>

        {/* Payment Options */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Choose when to pay</h2>
          
          {/* Pay Now Option */}
          <button
            onClick={() => setPaymentOption('full')}
            className={cn(
              "w-full border rounded-xl p-4 flex items-center justify-between mb-3 transition-colors",
              paymentOption === 'full' 
                ? "border-neutral-900 bg-neutral-50" 
                : "border-neutral-200 hover:border-neutral-300"
            )}
          >
            <span className="font-medium text-neutral-900">Pay ${total.toLocaleString()} {currency} now</span>
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center",
              paymentOption === 'full' ? "border-neutral-900" : "border-neutral-400"
            )}>
              {paymentOption === 'full' && <div className="w-3 h-3 bg-neutral-900 rounded-full" />}
            </div>
          </button>

          {/* Split Payment Option */}
          <button
            onClick={() => setPaymentOption('split')}
            className={cn(
              "w-full border rounded-xl p-4 flex items-center justify-between transition-colors",
              paymentOption === 'split' 
                ? "border-neutral-900 bg-neutral-50" 
                : "border-neutral-200 hover:border-neutral-300"
            )}
          >
            <div className="text-left">
              <p className="font-medium text-neutral-900">Pay part now, part later</p>
              <p className="text-sm text-neutral-600">
                ${firstPayment.toLocaleString()} {currency} now, ${secondPayment.toLocaleString()} {currency} charged on {secondPaymentDate}. No extra fees. <span className="underline">More info</span>
              </p>
            </div>
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
              paymentOption === 'split' ? "border-neutral-900" : "border-neutral-400"
            )}>
              {paymentOption === 'split' && <div className="w-3 h-3 bg-neutral-900 rounded-full" />}
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-4">
        <button
          onClick={onNext}
          className="w-full py-4 bg-neutral-900 text-white font-semibold rounded-xl hover:bg-neutral-800 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default ReviewAndContinue;
