import { render, screen, fireEvent } from '@testing-library/react';
import { BookingCard } from '@/components/booking/BookingCard';

jest.mock('@/lib/i18n', () => ({
  useI18n: () => ({
    t: (key: string, fallback?: string, params?: Record<string, string | number>) => {
      if (key === 'booking.validation.minNights') {
        return `Minimum ${params?.count ?? ''} nights required`;
      }
      if (key === 'booking.validation.selectDates') return 'Please select dates';
      if (key === 'property.checkAvailability') return 'Check availability';
      if (key === 'property.reserve') return 'Reserve';
      if (key === 'search.guest') return 'guest';
      if (key === 'search.guests') return 'guests';
      if (key === 'booking.checkIn') return 'Check-in';
      if (key === 'booking.checkOut') return 'Checkout';
      if (key === 'booking.addDate') return 'Add date';
      if (key === 'booking.processing') return 'Processing...';
      if (key === 'booking.youWontBeCharged') return "You won't be charged yet";
      if (key === 'common.night') return 'night';
      if (fallback) return fallback;
      return key;
    },
  }),
}));

const push = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

jest.mock('@/components/booking/AirbnbCalendar', () => ({
  AirbnbCalendar: ({ onSelectCheckIn, onSelectCheckOut, onClose }: any) => (
    <div>
      <button onClick={() => onSelectCheckIn('2026-04-01')}>set-in</button>
      <button onClick={() => onSelectCheckOut('2026-04-29')}>set-out</button>
      <button onClick={onClose}>close</button>
    </div>
  ),
}));

describe('BookingCard', () => {
  const property = {
    id: 'prop1',
    title: 'Nice place',
    price: 3000,
    maxGuests: 3,
    minNights: 28,
    monthlyDiscount: 10,
  };

  it('shows validation when reserve without dates', () => {
    render(<BookingCard property={property} />);
    fireEvent.click(screen.getByRole('button', { name: /check availability/i }));
    expect(screen.getByText(/please select dates/i)).toBeInTheDocument();
  });

  it('navigates to checkout when dates are selected', () => {
    render(<BookingCard property={property} />);
    fireEvent.click(screen.getByText(/check-in/i));
    fireEvent.click(screen.getByText('set-in'));
    fireEvent.click(screen.getByText('set-out'));
    fireEvent.click(screen.getByRole('button', { name: /reserve/i }));
    expect(push).toHaveBeenCalledWith(expect.stringContaining('/checkout/prop1?'));
  });
});
