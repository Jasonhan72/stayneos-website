import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

const setLocale = jest.fn();

jest.mock('@/lib/i18n', () => ({
  useI18n: () => ({ locale: 'en', setLocale }),
}));

describe('LanguageSwitcher', () => {
  it('opens dropdown and switches language', () => {
    render(<LanguageSwitcher isScrolled />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Français'));
    expect(setLocale).toHaveBeenCalledWith('fr');
  });
});
