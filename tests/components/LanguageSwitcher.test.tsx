import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

const setLocale = jest.fn();
const push = jest.fn();
const refresh = jest.fn();

jest.mock('@/lib/i18n', () => ({
  useI18n: () => ({ locale: 'en', setLocale }),
}));

jest.mock('next/navigation', () => ({
  usePathname: () => '/about',
  useSearchParams: () => new URLSearchParams('ref=test'),
  useRouter: () => ({ push, refresh }),
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens dropdown and switches language', () => {
    render(<LanguageSwitcher isScrolled />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Français'));
    expect(setLocale).toHaveBeenCalledWith('fr');
    expect(push).toHaveBeenCalledWith('/fr/about?ref=test');
    expect(refresh).toHaveBeenCalled();
  });
});
