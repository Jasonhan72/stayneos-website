import { render, screen, fireEvent } from '@testing-library/react';
import { AirbnbCalendar } from '@/components/booking/AirbnbCalendar';

describe('AirbnbCalendar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-01T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

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

  it('prompts for check-out after selecting a check-in date', () => {
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

    expect(onCheckIn).toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Select check-out date' })).toBeInTheDocument();
    expect(screen.getByText(/Check-in:/)).toBeInTheDocument();
    expect(screen.getAllByText('Select check-out date').length).toBeGreaterThanOrEqual(2);
  });

  it('renders booked mobile dates as disabled', () => {
    render(
      <AirbnbCalendar
        checkIn=""
        checkOut=""
        onSelectCheckIn={jest.fn()}
        onSelectCheckOut={jest.fn()}
        bookedRanges={[{ start: '2026-06-26', end: '2026-06-26' }]}
      />
    );

    const bookedButtons = screen.getAllByRole('button', { name: '26' });
    expect(bookedButtons.some((button) => button.hasAttribute('disabled'))).toBe(true);
  });

});
