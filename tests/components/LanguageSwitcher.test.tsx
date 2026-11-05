import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

const changeLanguage = jest.fn();

jest.mock('@/lib/i18n', () => ({
  useI18n: () => ({ locale: 'en' }),
  useSwitchLocale: () => changeLanguage,
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens dropdown and switches language', () => {
    render(<LanguageSwitcher isScrolled />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Français'));
    expect(changeLanguage).toHaveBeenCalledWith('fr');
    expect(screen.queryByText('Français')).not.toBeInTheDocument();
  });
});
