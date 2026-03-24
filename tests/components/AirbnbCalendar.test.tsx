import { render, screen, fireEvent } from '@testing-library/react';
import { AirbnbCalendar } from '@/components/booking/AirbnbCalendar';

describe('AirbnbCalendar', () => {
  it('selects check-in and check-out dates', () => {
    const onCheckIn = jest.fn();
    const onCheckOut = jest.fn();

    render(
      <AirbnbCalendar
        checkIn=""
        checkOut=""
        onSelectCheckIn={onCheckIn}
        onSelectCheckOut={onCheckOut}
        className="test-inline"
      />
    );

    const dayButtons = screen.getAllByRole('button').filter((b) => /^\d+$/.test(b.textContent || '') && !b.hasAttribute('disabled'));
    fireEvent.click(dayButtons[0]);
    fireEvent.click(dayButtons[1]);

    expect(onCheckIn).toHaveBeenCalled();
    expect(onCheckOut).toHaveBeenCalled();
  });
});
