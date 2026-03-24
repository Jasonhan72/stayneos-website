import { render, screen } from '@testing-library/react';
import { BookingPriceCalculator } from '@/components/booking/BookingPriceCalculator';

describe('BookingPriceCalculator', () => {
  it('renders placeholder without dates', () => {
    render(<BookingPriceCalculator basePrice={3000} checkIn="" checkOut="" />);
    expect(screen.getByText(/select dates to see pricing/i)).toBeInTheDocument();
  });

  it('renders compact breakdown with totals', () => {
    render(
      <BookingPriceCalculator
        basePrice={3000}
        checkIn="2026-04-01"
        checkOut="2026-04-29"
        monthlyDiscount={10}
        cleaningFee={100}
        compact
      />
    );
    expect(screen.getByText(/monthly discount/i)).toBeInTheDocument();
    expect(screen.getByText(/taxes/i)).toBeInTheDocument();
    expect(screen.getByText(/total/i)).toBeInTheDocument();
  });
});
