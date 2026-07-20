import { render, screen, fireEvent, act, within } from '@testing-library/react';

const push = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

// SearchBar uses dynamic import for AirbnbCalendar; mock it
jest.mock('@/components/booking', () => ({
  AirbnbCalendar: ({ onSelectCheckIn, onSelectCheckOut, onClose }: any) => (
    <div data-testid="mock-calendar">
      <button onClick={() => onSelectCheckIn('2026-05-01')}>set-checkin</button>
      <button onClick={() => onSelectCheckOut('2026-06-01')}>set-checkout</button>
      <button onClick={onClose}>close-calendar</button>
    </div>
  ),
}));

import SearchBar from '@/components/ui/SearchBar';

describe('SearchBar', () => {
  beforeEach(() => {
    push.mockClear();
  });

  it('renders search bar with location input', async () => {
    await act(async () => {
      render(<SearchBar />);
    });
    expect(screen.getByRole('search')).toBeInTheDocument();
    // Has location placeholder text
    const locationPlaceholders = screen.getAllByText('搜索目的地');
    expect(locationPlaceholders.length).toBeGreaterThan(0);
  });

  it('opens location dropdown on click', async () => {
    await act(async () => {
      render(<SearchBar />);
    });
    const locButtons = screen.getAllByLabelText('选择位置');
    await act(async () => {
      fireEvent.click(locButtons[0]);
    });
    expect(screen.getAllByText('热门城市')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Toronto')[0]).toBeInTheDocument();
  });

  it('selects a location from dropdown', async () => {
    await act(async () => {
      render(<SearchBar />);
    });
    const locationButton = screen.getAllByLabelText('选择位置')[0];
    await act(async () => {
      fireEvent.click(locationButton);
    });
    await act(async () => {
      fireEvent.click(screen.getAllByText('Toronto')[0]);
    });
    expect(within(locationButton).getByText('Toronto')).toBeInTheDocument();
    expect(screen.queryByRole('listbox', { name: '热门位置' })).not.toBeInTheDocument();
  });

  it('opens guests dropdown and adjusts guest count', async () => {
    await act(async () => {
      render(<SearchBar />);
    });
    const guestButtons = screen.getAllByLabelText('选择人数');
    expect(within(guestButtons[0]).getByText('2 位房客')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(guestButtons[0]);
    });
    expect(screen.getByText('成人')).toBeInTheDocument();

    const incBtns = screen.getAllByLabelText('增加房客数量');
    expect(incBtns.length).toBeGreaterThan(0);

    // Click increase button — was 2, should become 3
    await act(async () => {
      fireEvent.click(incBtns[0]);
    });
    expect(within(guestButtons[0]).getByText('3 位房客')).toBeInTheDocument();
  });

  it('searches with selected params', async () => {
    await act(async () => {
      render(<SearchBar />);
    });
    await act(async () => {
      fireEvent.click(screen.getAllByLabelText('选择位置')[0]);
    });
    await act(async () => {
      fireEvent.click(screen.getAllByText('Toronto')[0]);
    });
    await act(async () => {
      fireEvent.click(screen.getAllByLabelText('选择入住日期')[0]);
    });
    await act(async () => {
      fireEvent.click(screen.getByText('set-checkin'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('set-checkout'));
    });
    await act(async () => {
      fireEvent.click(screen.getAllByLabelText('选择人数')[0]);
    });
    await act(async () => {
      fireEvent.click(screen.getAllByLabelText('增加房客数量')[0]);
    });
    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: '搜索房源' })[0]);
    });
    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith(
      '/properties?city=Toronto&checkIn=2026-05-01&checkOut=2026-06-01&guests=3'
    );
  });

  it('renders mobile layout with compact view', async () => {
    await act(async () => {
      render(<SearchBar />);
    });
    // Both desktop and mobile search buttons
    const searchButtons = screen.getAllByLabelText('搜索房源');
    expect(searchButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('opens date picker modal', async () => {
    await act(async () => {
      render(<SearchBar />);
    });
    // Click a date button
    const checkInBtns = screen.getAllByLabelText('选择入住日期');
    await act(async () => {
      fireEvent.click(checkInBtns[0]);
    });
    // Calendar modal should be visible
    expect(screen.getByTestId('mock-calendar')).toBeInTheDocument();
  });
});
