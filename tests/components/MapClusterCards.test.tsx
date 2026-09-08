import { render, screen, fireEvent } from '@testing-library/react';
import MapClusterCards, {
  propertyPrice,
  propertyImage,
  propertyLocation,
  type ClusterCardProperty,
} from '@/components/property/MapClusterCards';

const base: ClusterCardProperty = {
  id: '1',
  slug: 'cooper-55',
  title: 'Luxury Downtown Condo',
  location: 'Toronto, ON',
  priceMonthly: 3200,
  images: ['/img/cooper.jpg'],
  rating: 4.8,
  bedrooms: 2,
  bathrooms: 2,
};

const properties: ClusterCardProperty[] = [
  base,
  { ...base, id: '2', slug: 'simcoe-238', title: 'Modern Simcoe Suite', priceMonthly: 4100 },
  { ...base, id: '3', slug: 'wellesley-22', title: 'Wellesley Garden Flat', priceMonthly: 2800 },
];

describe('MapClusterCards', () => {
  it('renders a card for each property', () => {
    render(<MapClusterCards properties={properties} onClose={jest.fn()} />);
    expect(screen.getByText('Luxury Downtown Condo')).toBeInTheDocument();
    expect(screen.getByText('Modern Simcoe Suite')).toBeInTheDocument();
    expect(screen.getByText('Wellesley Garden Flat')).toBeInTheDocument();
  });

  it('shows the total count in the header', () => {
    render(<MapClusterCards properties={properties} onClose={jest.fn()} />);
    expect(screen.getByText(/3 stays in this area/)).toBeInTheDocument();
  });

  it('uses singular wording for a single stay', () => {
    render(<MapClusterCards properties={[base]} onClose={jest.fn()} />);
    expect(screen.getByText(/1 stay in this area/)).toBeInTheDocument();
  });

  it('renders prices', () => {
    render(<MapClusterCards properties={[base]} onClose={jest.fn()} />);
    expect(screen.getByText('$3,200')).toBeInTheDocument();
  });

  it('links each card to its property detail page', () => {
    render(<MapClusterCards properties={properties} onClose={jest.fn()} />);
    const links = screen.getAllByRole('link');
    expect(links.map((l) => l.getAttribute('href'))).toEqual([
      '/property/cooper-55',
      '/property/simcoe-238',
      '/property/wellesley-22',
    ]);
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = jest.fn();
    render(<MapClusterCards properties={properties} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close cluster cards'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders left/right scroll controls', () => {
    render(<MapClusterCards properties={properties} onClose={jest.fn()} />);
    expect(screen.getByLabelText('Scroll left')).toBeInTheDocument();
    expect(screen.getByLabelText('Scroll right')).toBeInTheDocument();
  });

  it('renders nothing when there are no properties', () => {
    const { container } = render(<MapClusterCards properties={[]} onClose={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('calls onSelect when a card is clicked', () => {
    const onSelect = jest.fn();
    render(<MapClusterCards properties={[base]} onSelect={onSelect} onClose={jest.fn()} />);
    fireEvent.click(screen.getByText('Luxury Downtown Condo'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});

describe('MapClusterCards helpers', () => {
  it('propertyPrice prefers priceMonthly then price', () => {
    expect(propertyPrice({ ...base, priceMonthly: 3200, price: 100 })).toBe(3200);
    expect(propertyPrice({ ...base, priceMonthly: undefined, price: 4200 })).toBe(4200);
    expect(propertyPrice({ ...base, priceMonthly: undefined, price: undefined })).toBe(0);
  });

  it('propertyImage falls back to a placeholder', () => {
    expect(propertyImage(base)).toBe('/img/cooper.jpg');
    expect(propertyImage({ ...base, images: undefined })).toBe('/images/cooper-55-c5e8357d.jpg');
  });

  it('propertyLocation falls back to address', () => {
    expect(propertyLocation(base)).toBe('Toronto, ON');
    expect(propertyLocation({ ...base, location: undefined, address: '123 Main St' })).toBe('123 Main St');
    expect(propertyLocation({ ...base, location: undefined, address: undefined })).toBe('');
  });
});
