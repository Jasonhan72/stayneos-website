import { render, screen, fireEvent, act } from '@testing-library/react';
import PropertyCard, { getLocalizedTitle, getLocalizedDescription, getPropertyPrice, getPropertyLocation } from '@/components/property/PropertyCard';
import type { Property } from '@/components/property/PropertyCard';

jest.mock('@/lib/i18n', () => ({
  useI18n: () => ({
    t: (key: string, defaultValue?: string | Record<string, string | number>, params?: Record<string, string | number>) => {
      // Handle params passed as second argument (matching real t() behavior)
      const p = (!params && typeof defaultValue === 'object' && defaultValue !== null) ? defaultValue : params;
      if (key === 'property.monthlyDiscountLabel') return `${(p as any)?.percent}% off`;
      if (key === 'property.maxGuestsValue') return `${(p as any)?.count} guests`;
      if (key === 'properties.featured') return 'Featured';
      if (key === 'properties.details.reviews') return ' reviews';
      if (key === 'property.hotelEquivalent') return 'Hotel equivalent:';
      return typeof defaultValue === 'string' ? defaultValue : key;
    },
    locale: 'en',
  }),
}));

jest.mock('@/lib/context/WishlistContext', () => ({
  useWishlist: () => ({
    isWishlisted: () => false,
    toggleWishlist: jest.fn(),
  }),
}));

const baseProperty: Property = {
  id: 'prop1',
  title: 'Luxury Downtown Condo',
  titleZh: '豪华市中心公寓',
  titleFr: 'Condo de luxe au centre-ville',
  location: 'Toronto, ON',
  price: 3200,
  priceUnit: 'month',
  reviewCount: 24,
  rating: 4.8,
  images: ['/test-image.jpg'],
  maxGuests: 4,
  area: 950,
  bedrooms: 2,
  bathrooms: 2,
  amenities: ['WiFi', 'Gym'],
  featured: true,
  monthlyDiscount: 15,
  cleaningFee: 120,
  minNights: 28,
};

describe('PropertyCard', () => {
  it('renders property title', () => {
    render(<PropertyCard property={baseProperty} />);
    expect(screen.getByText('Luxury Downtown Condo')).toBeInTheDocument();
  });

  it('renders property location', () => {
    render(<PropertyCard property={baseProperty} />);
    expect(screen.getByText('Toronto, ON')).toBeInTheDocument();
  });

  it('renders price', () => {
    render(<PropertyCard property={baseProperty} />);
    // Price text may include "From $" prefix
    expect(screen.getByText((content) => content.includes('3,200'))).toBeInTheDocument();
  });

  it('renders guest capacity', () => {
    render(<PropertyCard property={baseProperty} />);
    // Guest capacity shown via aria-label on the icon wrapper
    expect(screen.getByLabelText('Max 4 guests')).toBeInTheDocument();
  });

  it('renders area in sqft', () => {
    render(<PropertyCard property={baseProperty} />);
    expect(screen.getByText(/950/)).toBeInTheDocument();
  });

  it('renders featured badge when featured', () => {
    render(<PropertyCard property={baseProperty} />);
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('does not render featured badge when not featured', () => {
    const prop = { ...baseProperty, featured: false, isFeatured: false };
    render(<PropertyCard property={prop} />);
    expect(screen.queryByText('Featured')).toBeNull();
  });

  it('renders monthly discount badge', () => {
    render(<PropertyCard property={baseProperty} />);
    // Discount badge renders with "15% off" text
    expect(screen.getByText('15% off')).toBeInTheDocument();
  });

  it('renders rating when reviewCount > 0 and rating exists', () => {
    render(<PropertyCard property={baseProperty} />);
    expect(screen.getByText('4.8')).toBeInTheDocument();
    // Check review count by label
    expect(screen.getByLabelText('24 reviews')).toBeInTheDocument();
  });

  it('does not render rating when reviewCount is 0', () => {
    const prop = { ...baseProperty, reviewCount: 0, rating: undefined };
    render(<PropertyCard property={prop} />);
    expect(screen.queryByText('4.8')).toBeNull();
  });

  it('navigates to property detail page', () => {
    render(<PropertyCard property={baseProperty} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/property/prop1');
  });

  it('renders wishlist heart button after hydration', async () => {
    await act(async () => {
      render(<PropertyCard property={baseProperty} />);
    });
    const heartBtn = screen.getByLabelText('Favorite Luxury Downtown Condo');
    expect(heartBtn).toBeInTheDocument();
  });
});

describe('PropertyCard helpers', () => {
  const prop: Property = {
    ...baseProperty,
    title: 'English Title',
    titleZh: '中文标题',
    titleFr: 'Titre Français',
    description: 'English desc',
    descriptionZh: '中文描述',
    descriptionFr: 'Description FR',
  };

  it('getLocalizedTitle returns English for en locale', () => {
    expect(getLocalizedTitle(prop, 'en')).toBe('English Title');
  });

  it('getLocalizedTitle returns Chinese for zh locale', () => {
    expect(getLocalizedTitle(prop, 'zh')).toBe('中文标题');
  });

  it('getLocalizedTitle returns French for fr locale', () => {
    expect(getLocalizedTitle(prop, 'fr')).toBe('Titre Français');
  });

  it('getLocalizedTitle falls back to default title', () => {
    const p = { ...prop, titleZh: undefined, titleFr: undefined };
    expect(getLocalizedTitle(p, 'zh')).toBe('English Title');
  });

  it('getLocalizedDescription returns locale-specific description', () => {
    expect(getLocalizedDescription(prop, 'zh')).toBe('中文描述');
    expect(getLocalizedDescription(prop, 'fr')).toBe('Description FR');
    expect(getLocalizedDescription(prop, 'en')).toBe('English desc');
  });

  it('getPropertyPrice handles price field', () => {
    expect(getPropertyPrice({ ...baseProperty, price: 5000 })).toBe(5000);
    expect(getPropertyPrice({ ...baseProperty, price: 0, basePrice: 4000 })).toBe(0);
  });

  it('getPropertyPrice falls back to basePrice', () => {
    const p = { ...baseProperty, price: undefined as any, basePrice: 3500 };
    expect(getPropertyPrice(p)).toBe(3500);
  });

  it('getPropertyPrice returns 0 when no price available', () => {
    const p = { ...baseProperty, price: undefined as any, basePrice: undefined as any };
    expect(getPropertyPrice(p)).toBe(0);
  });

  it('getPropertyLocation returns location field', () => {
    expect(getPropertyLocation({ ...baseProperty, location: 'Vancouver' })).toBe('Vancouver');
  });

  it('getPropertyLocation falls back to city+neighborhood', () => {
    const p = { ...baseProperty, location: '', city: 'Montreal', neighborhood: 'Plateau' };
    expect(getPropertyLocation(p)).toBe('Plateau, Montreal');
  });

  it('getPropertyLocation falls back to city only', () => {
    const p = { ...baseProperty, location: '', city: 'Ottawa', neighborhood: '' };
    expect(getPropertyLocation(p)).toBe('Ottawa');
  });

  it('getPropertyLocation returns empty string when nothing available', () => {
    const p = { ...baseProperty, location: '', city: '' };
    expect(getPropertyLocation(p)).toBe('');
  });
});
