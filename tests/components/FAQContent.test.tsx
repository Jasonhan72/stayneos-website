import { render, screen } from '@testing-library/react';
import FAQContent from '@/app/(marketing)/faq/FAQContent';

jest.mock('@/lib/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'faqPage.title': 'Frequently Asked Questions',
        'faqPage.subtitle': 'Find answers to common questions',
        'faqPage.cat_booking': 'Booking',
        'faqPage.cat_payment': 'Payment',
        'faqPage.cat_cancellation': 'Cancellation',
        'faqPage.cat_checkin': 'Check-in',
        'faqPage.cat_property': 'Property',
        'faqPage.cat_support': 'Support',
        'faqPage.bq1': 'How do I book?',
        'faqPage.ba1': 'You can book through our website.',
        'faqPage.bq2': 'What is the minimum stay?',
        'faqPage.ba2': 'Minimum 28 nights.',
        'faqPage.bq3': 'Can I view before booking?',
        'faqPage.ba3': 'Yes, virtual tours available.',
        'faqPage.bq4': 'Do you require a deposit?',
        'faqPage.ba4': 'A deposit of one month is required.',
        'faqPage.pq1': 'What payment methods?',
        'faqPage.pa1': 'We accept credit cards and bank transfers.',
        'faqPage.pq2': 'When is payment due?',
        'faqPage.pa2': 'Payment is due upon booking.',
        'faqPage.pq3': 'Are there hidden fees?',
        'faqPage.pa3': 'No hidden fees.',
        'faqPage.pq4': 'Can I pay monthly?',
        'faqPage.pa4': 'Yes, monthly payments available.',
        'faqPage.cq1': 'What is the cancellation policy?',
        'faqPage.ca1': 'Flexible cancellation up to 7 days before.',
        'faqPage.cq2': 'How do I cancel?',
        'faqPage.ca2': 'Cancel through your dashboard.',
        'faqPage.cq3': 'Will I get a refund?',
        'faqPage.ca3': 'Full refund within cancellation window.',
        'faqPage.chq1': 'What time is check-in?',
        'faqPage.cha1': 'Check-in is at 3 PM.',
        'faqPage.chq2': 'Can I check in early?',
        'faqPage.cha2': 'Early check-in available upon request.',
        'faqPage.chq3': 'How does key exchange work?',
        'faqPage.cha3': 'We use smart locks.',
        'faqPage.prq1': 'Are pets allowed?',
        'faqPage.pra1': 'Some properties allow pets.',
        'faqPage.prq2': 'Is parking included?',
        'faqPage.pra2': 'Parking varies by property.',
        'faqPage.prq3': 'What amenities are included?',
        'faqPage.pra3': 'WiFi and utilities included.',
        'faqPage.prq4': 'Is the property furnished?',
        'faqPage.pra4': 'All properties fully furnished.',
        'faqPage.sq1': 'How to contact support?',
        'faqPage.sa1': 'Email or WhatsApp.',
        'faqPage.sq2': 'What are business hours?',
        'faqPage.sa2': '9 AM to 6 PM ET.',
        'faqPage.sq3': 'Can I switch properties?',
        'faqPage.sa3': 'Yes, subject to availability.',
        'faqPage.b2bq1': 'B2B Q1?',
        'faqPage.b2ba1': 'B2B A1.',
        'faqPage.b2bq2': 'B2B Q2?',
        'faqPage.b2ba2': 'B2B A2.',
        'faqPage.b2bq3': 'B2B Q3?',
        'faqPage.b2ba3': 'B2B A3.',
        'faqPage.b2bq4': 'B2B Q4?',
        'faqPage.b2ba4': 'B2B A4.',
        'faqPage.b2bq5': 'B2B Q5?',
        'faqPage.b2ba5': 'B2B A5.',
        'faqPage.b2bq6': 'B2B Q6?',
        'faqPage.b2ba6': 'B2B A6.',
        'faqPage.b2bq7': 'B2B Q7?',
        'faqPage.b2ba7': 'B2B A7.',
        'faqPage.b2bq8': 'B2B Q8?',
        'faqPage.b2ba8': 'B2B A8.',
        'faqPage.stillHaveQuestions': 'Still have questions?',
        'faqPage.teamHelp': 'Our team is here to help.',
        'faqPage.whatsappUs': 'WhatsApp Us',
        'faqPage.emailUs': 'Email Us',
      };
      return map[key] || key;
    },
    locale: 'en' as const,
  }),
}));

describe('FAQContent', () => {
  it('renders page title', () => {
    render(<FAQContent />);
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    render(<FAQContent />);
    expect(screen.getByText('Find answers to common questions')).toBeInTheDocument();
  });

  it('renders all category headings', () => {
    render(<FAQContent />);
    expect(screen.getByText('Booking')).toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
    expect(screen.getByText('Cancellation')).toBeInTheDocument();
    expect(screen.getByText('Check-in')).toBeInTheDocument();
    expect(screen.getByText('Property')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('renders booking questions and answers', () => {
    render(<FAQContent />);
    expect(screen.getByText('How do I book?')).toBeInTheDocument();
    expect(screen.getByText('You can book through our website.')).toBeInTheDocument();
    expect(screen.getByText('What is the minimum stay?')).toBeInTheDocument();
    expect(screen.getByText('Minimum 28 nights.')).toBeInTheDocument();
  });

  it('renders payment questions', () => {
    render(<FAQContent />);
    expect(screen.getByText('What payment methods?')).toBeInTheDocument();
    expect(screen.getByText('We accept credit cards and bank transfers.')).toBeInTheDocument();
  });

  it('renders still have questions section', () => {
    render(<FAQContent />);
    expect(screen.getByText('Still have questions?')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp Us')).toBeInTheDocument();
    expect(screen.getByText('Email Us')).toBeInTheDocument();
  });

  it('renders WhatsApp link', () => {
    render(<FAQContent />);
    const whatsappLink = screen.getByText('WhatsApp Us');
    expect(whatsappLink).toHaveAttribute('href', 'https://wa.me/16474467987');
  });

  it('renders email link', () => {
    render(<FAQContent />);
    const emailLink = screen.getByText('Email Us');
    expect(emailLink).toHaveAttribute('href', 'mailto:support@stayneos.com');
  });
});
