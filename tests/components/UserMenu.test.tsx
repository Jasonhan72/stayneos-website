import { render, screen, fireEvent } from '@testing-library/react';
import { UserMenu } from '@/components/layout/UserMenu';

const logout = jest.fn();
let mockUser: any = null;

jest.mock('@/lib/i18n', () => ({
  useI18n: () => ({ t: (k: string) => ({ 'nav.login': 'Login', 'nav.signup': 'Sign up', 'nav.logout': 'Logout', 'nav.dashboard': 'Dashboard', 'nav.bookings': 'Bookings', 'nav.manageProperties': 'Manage Properties', 'nav.wishlists': 'Wishlists', 'nav.profile': 'Profile' }[k] || k) }),
}));

jest.mock('@/lib/UserContext', () => ({
  useAuth: () => ({ user: mockUser, logout, isLoading: false }),
}));

describe('UserMenu', () => {
  beforeEach(() => {
    logout.mockClear();
    mockUser = null;
  });

  it('shows login/signup when logged out', () => {
    render(<UserMenu />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('shows logout when logged in', () => {
    mockUser = { name: 'Test User', email: 'a@b.com' };
    render(<UserMenu />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByText('Logout'));
    expect(logout).toHaveBeenCalled();
  });
});
