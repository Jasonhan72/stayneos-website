import { render, screen } from '@testing-library/react';
import Footer from '@/components/layout/Footer';

jest.mock('@/lib/i18n', () => ({
  useI18n: () => ({
    t: (key: string, fallback?: string) => {
      const map: Record<string, string> = {
        'footer.about': 'About Us',
        'footer.properties': 'Properties',
        'footer.companyTitle': 'Company',
        'footer.servicesTitle': 'Services',
        'footer.supportTitle': 'Support',
        'footer.corporate': 'For Business',
        'footer.description': 'NEOS provides premium serviced apartments.',
        'footer.corporateOffice': 'Corporate Office: 20 Upjohn Rd, North York, ON, M3B 2V9',
      };
      return map[key] || fallback || key;
    },
    locale: 'en' as const,
  }),
}));

jest.mock('@/lib/i18n-routes', () => ({
  localizePath: (path: string) => path,
}));

describe('Footer', () => {
  it('renders logo', () => {
    render(<Footer />);
    const logoNames = screen.getAllByAltText('NEOS');
    // Desktop has 1 logo in footer
    expect(logoNames.length).toBeGreaterThanOrEqual(1);
  });

  it('renders contact email', () => {
    render(<Footer />);
    expect(screen.getByText('support@stayneos.com')).toBeInTheDocument();
  });

  it('renders phone number', () => {
    render(<Footer />);
    expect(screen.getByText('+1 (647) 446-7987')).toBeInTheDocument();
  });

  it('renders office address', () => {
    render(<Footer />);
    expect(screen.getByText(/20 Upjohn Rd/i)).toBeInTheDocument();
  });

  it('renders section headings', () => {
    render(<Footer />);
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('renders key links', () => {
    render(<Footer />);
    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('For Business')).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(<Footer />);
    // Social icons use aria-label
    const facebookLinks = screen.getAllByLabelText('Facebook');
    const instaLinks = screen.getAllByLabelText('Instagram');
    expect(facebookLinks.length).toBeGreaterThan(0);
    expect(instaLinks.length).toBeGreaterThan(0);
  });

  it('renders copyright with current year', () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    const copyrightEl = screen.getByText(new RegExp(String(year)));
    expect(copyrightEl).toBeInTheDocument();
  });
});
