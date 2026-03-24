import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider, useI18n } from '@/lib/i18n';

function Demo() {
  const { locale, t, setLocale } = useI18n();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="translated">{t('nav.login', 'Login')}</span>
      <button onClick={() => setLocale('fr')}>switch</button>
    </div>
  );
}

describe('i18n provider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = 'stayneos_locale=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  });

  it('uses initial locale then allows switching', () => {
    render(
      <I18nProvider initialLocale="en">
        <Demo />
      </I18nProvider>
    );

    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    fireEvent.click(screen.getByText('switch'));
    expect(screen.getByTestId('locale')).toHaveTextContent('fr');
  });

  it('falls back to key/default when missing key', () => {
    function Missing() {
      const { t } = useI18n();
      return <span>{t('missing.key', 'Default Text')}</span>;
    }
    render(<I18nProvider><Missing /></I18nProvider>);
    expect(screen.getByText('Default Text')).toBeInTheDocument();
  });
});
