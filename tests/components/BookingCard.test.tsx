import { render, screen, fireEvent } from '@testing-library/react';
import { BookingCard } from '@/components/booking/BookingCard';

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
