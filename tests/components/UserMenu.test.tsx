import { render, screen, fireEvent, act } from '@testing-library/react';
import { UserMenu } from '@/components/layout/UserMenu';

const logout = jest.fn();
let mockUser: any = null;

jest.mock('@/lib/i18n', () => ({
  useI18n: () => ({ t: (k: string) => ({ 'nav.login': 'Login', 'nav.signup': 'Sign up', 'nav.logout': 'Logout', 'nav.dashboard': 'Dashboard', 'nav.bookings': 'Bookings', 'nav.manageProperties': 'Manage Properties', 'nav.wishlists': 'Wishlists', 'nav.profile': 'Profile' }[k] || k), locale: 'en' }),
}));

jest.mock('@/lib/context/UserContext', () => ({
  useAuth: () => ({ user: mockUser, logout, isLoading: false }),
}));

describe('UserMenu', () => {
  beforeEach(() => {
    logout.mockClear();
    mockUser = null;
  });

  it('shows login/signup when logged out', async () => {
    await act(async () => {
      render(<UserMenu />);
    });
    // When logged out, the component renders "Log In" and "Sign Up" links
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByText('Log In')).toBeInTheDocument();
  });

  it('shows logout when logged in', async () => {
    mockUser = { name: 'Test User', email: 'a@b.com' };
    await act(async () => {
      render(<UserMenu />);
    });
    // Click the user menu button (the one with Menu icon)
    const menuButton = screen.getByRole('button', { name: /user menu/i });
    await act(async () => {
      fireEvent.click(menuButton);
    });
    // Now the dropdown should be open with Log out button
    await act(async () => {
      fireEvent.click(screen.getByText('Log out'));
    });
    expect(logout).toHaveBeenCalled();
  });
});
