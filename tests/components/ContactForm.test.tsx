import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { ContactForm } from '@/app/(marketing)/contact/components';

jest.mock('@/lib/inquiry-client', () => ({
  submitInquiry: jest.fn(() => Promise.resolve({ success: true })),
}));

jest.mock('@/lib/i18n', () => ({
  useI18n: () => ({
    t: (key: string, fallback?: string) => {
      const map: Record<string, string> = {
        'contact.form.title': 'Send us a message',
        'contact.form.subtitle': 'We\'ll get back to you within 24 hours',
        'contact.form.name': 'Full Name',
        'contact.form.namePlaceholder': 'Enter your name',
        'contact.form.email': 'Email Address',
        'contact.form.emailPlaceholder': 'Enter your email',
        'contact.form.phoneOptional': 'Phone (optional)',
        'contact.form.phonePlaceholder': '+1 (123) 456-7890',
        'contact.form.subject': 'Subject',
        'contact.form.subjectBooking': 'Booking Inquiry',
        'contact.form.subjectPartnership': 'Partnership',
        'contact.form.subjectSupport': 'Support',
        'contact.form.subjectOther': 'Other',
        'contact.form.message': 'Message',
        'contact.form.messagePlaceholder': 'Tell us how we can help...',
        'contact.form.send': 'Send Message',
        'contact.form.required': 'Required fields',
        'contact.form.privacyNote': 'Your information is secure',
        'contact.form.errorName': 'Name is required',
        'contact.form.errorEmail': 'Email is required',
        'contact.form.errorMessage': 'Message is required',
        'contact.form.minChars': 'Minimum 10 characters',
        'contact.form.submitFailed': 'Submission failed',
        'errors.invalidEmail': 'Invalid email format',
        'contact.success.title': 'Message Sent!',
        'contact.success.message': 'We will get back to you soon.',
        'contact.success.sendNew': 'Send Another Message',
      };
      return map[key] || fallback || key;
    },
    locale: 'en' as const,
  }),
}));

jest.mock('@/lib/inquiry-client', () => ({
  submitInquiry: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('@/lib/google-maps', () => ({
  GOOGLE_MAPS_API_KEY: '',
  googleMapsSearchUrl: () => '#',
  hasUsableGoogleMapsKey: () => false,
}));

describe('ContactForm', () => {
  it('renders form title', () => {
    render(<ContactForm />);
    expect(screen.getByText('Send us a message')).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    render(<ContactForm />);
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tell us how we can help...')).toBeInTheDocument();
  });

  it('renders subject dropdown with options', () => {
    render(<ContactForm />);
    expect(screen.getByText('Booking Inquiry')).toBeInTheDocument();
    expect(screen.getByText('Partnership')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    render(<ContactForm />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Send Message' }));
    });
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Message is required')).toBeInTheDocument();
  });

  it('validates email format', async () => {
    render(<ContactForm />);
    const nameInput = screen.getByPlaceholderText('Enter your name');
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const messageInput = screen.getByPlaceholderText('Tell us how we can help...');
    
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.change(messageInput, { target: { value: 'This is a test message long enough' } });
    });
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Send Message' }).closest('form')!);
    });
    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
  });

  it('validates minimum message length', async () => {
    render(<ContactForm />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Enter your name'), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByPlaceholderText('Tell us how we can help...'), { target: { value: 'Short' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Send Message' }));
    });
    expect(screen.getByText('Minimum 10 characters')).toBeInTheDocument();
  });

  it('submits form with valid data and shows success', async () => {
    const { submitInquiry } = await import('@/lib/inquiry-client');
    render(<ContactForm />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Enter your name'), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByPlaceholderText('Tell us how we can help...'), { target: { value: 'This is a test message that is long enough' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Send Message' }));
    });
    await waitFor(() => {
      expect(screen.getByText('Message Sent!')).toBeInTheDocument();
    });
    expect(submitInquiry).toHaveBeenCalledWith('contact', expect.objectContaining({
      name: 'Test User',
      email: 'test@example.com',
    }));
  });

  it('clears field error when user types', async () => {
    render(<ContactForm />);
    // Submit empty to trigger errors
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Send Message' }));
    });
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    // Type in name field
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Enter your name'), { target: { value: 'John' } });
    });
    // Error for name should be removed
    expect(screen.queryByText('Name is required')).toBeNull();
  });

  it('allows sending another message after success', async () => {
    render(<ContactForm />);
    // Submit valid form
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Enter your name'), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByPlaceholderText('Tell us how we can help...'), { target: { value: 'This is a test message that is long enough' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Send Message' }));
    });
    await waitFor(() => {
      expect(screen.getByText('Message Sent!')).toBeInTheDocument();
    });
    // Click send another
    await act(async () => {
      fireEvent.click(screen.getByText('Send Another Message'));
    });
    // Form should reset
    expect(screen.getByPlaceholderText('Enter your name')).toHaveValue('');
  });
});
