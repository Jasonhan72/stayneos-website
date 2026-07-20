import { render, screen, fireEvent, act, within } from '@testing-library/react';

jest.mock('@/lib/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => ({
      'nav.properties': 'Properties',
      'nav.business': 'For Business',
      'nav.about': 'About Us',
      'nav.partnerWithUs': 'Partner With Us',
      'nav.signup': 'Sign Up',
      'nav.login': 'Log In',
    }[key] || key),
    locale: 'en' as const,
    setLocale: jest.fn(),
  }),
}));

let mockAuth = { user: null, isAuthenticated: false };
jest.mock('@/lib/context/UserContext', () => ({
  useAuth: () => mockAuth,
}));

jest.mock('@/lib/i18n-routes', () => ({
  localizePath: (path: string) => path,
}));

import Navbar from '@/components/layout/Navbar';

describe('Navbar', () => {
  beforeEach(() => {
    mockAuth = { user: null, isAuthenticated: false };
  });

  it('renders logo', () => {
    render(<Navbar />);
    const logos = screen.getAllByAltText('NEOS');
    expect(logos.length).toBeGreaterThan(0);
  });

  it('renders desktop nav links', () => {
    render(<Navbar />);
    expect(screen.getAllByRole('link', { name: 'Properties' }).map((link) => link.getAttribute('href'))).toContain('/properties');
    expect(screen.getAllByRole('link', { name: 'For Business' }).map((link) => link.getAttribute('href'))).toContain('/for-business');
    expect(screen.getAllByRole('link', { name: 'About Us' }).map((link) => link.getAttribute('href'))).toContain('/about');
  });

  it('renders login/signup when logged out', () => {
    render(<Navbar />);
    expect(screen.getByRole('link', { name: 'Sign Up' })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: 'Log In' })).toHaveAttribute('href', '/login');
  });

  it('does not show login when user is authenticated', async () => {
    mockAuth = { user: { name: 'Test', email: 'a@b.com' }, isAuthenticated: true };
    await act(async () => {
      render(<Navbar />);
    });
    // Login/Signup should NOT be visible when authenticated
    expect(screen.queryAllByText('Log In').length).toBe(0);
  });

  it('opens mobile menu on hamburger click', async () => {
    await act(async () => {
      render(<Navbar />);
    });
    // The hamburger menu button
    const menuButtons = screen.getAllByLabelText('Open menu');
    expect(menuButtons.length).toBeGreaterThan(0);
    await act(async () => {
      fireEvent.click(menuButtons[0]);
    });
    const mobileLoginLink = screen.getByRole('link', { name: /Sign Up.*Log In/ });
    expect(mobileLoginLink).toHaveAttribute('href', '/login');
    expect(screen.getAllByRole('link', { name: 'Properties' })).toHaveLength(2);
    const drawer = mobileLoginLink.closest('.fixed');
    expect(drawer).not.toBeNull();
    expect(drawer).toHaveClass('translate-x-0');
    await act(async () => {
      fireEvent.click(within(drawer as HTMLElement).getAllByRole('button')[0]);
    });
    expect(drawer).toHaveClass('translate-x-full');
  });

  it('shows partner with us link', () => {
    render(<Navbar />);
    expect(screen.getByText('Partner With Us')).toBeInTheDocument();
  });
});
