import SuccessClient from './SuccessClient';
import { BookingStepIndicator } from '@/components/booking/BookingStepIndicator';

export const dynamic = 'force-dynamic';

export default function PaymentSuccessPage() {
  return (
    <>
      <div className="bg-white border-b border-neutral-100 py-4">
        <div className="px-4">
          <BookingStepIndicator current="confirm" />
        </div>
      </div>
      <SuccessClient />
    </>
  );
}
