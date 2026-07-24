import {
  registerSchema,
  loginSchema,
  createBookingSchema,
  propertyListQuerySchema,
  changePasswordSchema,
  createReviewSchema,
} from '@/lib/validation';

describe('Register schema', () => {
  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'Pass1234',
      name: 'Test User',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'Pass1234',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'Ab1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without uppercase', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'pass1234',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without lowercase', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'PASS1234',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without number', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'Password',
    });
    expect(result.success).toBe(false);
  });
});

describe('Login schema', () => {
  it('accepts valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'anything',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty email', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'password',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('Create booking schema', () => {
  it('accepts valid booking data', () => {
    const result = createBookingSchema.safeParse({
      propertyId: 'clx1234567890abcdefghij',
      checkIn: '2026-05-01T00:00:00.000Z',
      checkOut: '2026-05-29T00:00:00.000Z',
      guests: 2,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid propertyId format', () => {
    const result = createBookingSchema.safeParse({
      propertyId: 'not-a-cuid',
      checkIn: '2026-05-01T00:00:00.000Z',
      checkOut: '2026-05-29T00:00:00.000Z',
      guests: 2,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid dates', () => {
    const result = createBookingSchema.safeParse({
      propertyId: 'clx1234567890abcdefghij',
      checkIn: 'not-a-date',
      checkOut: '2026-05-29T00:00:00.000Z',
      guests: 2,
    });
    expect(result.success).toBe(false);
  });

  it('rejects 0 guests', () => {
    const result = createBookingSchema.safeParse({
      propertyId: 'clx1234567890abcdefghij',
      checkIn: '2026-05-01T00:00:00.000Z',
      checkOut: '2026-05-29T00:00:00.000Z',
      guests: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 10 guests', () => {
    const result = createBookingSchema.safeParse({
      propertyId: 'clx1234567890abcdefghij',
      checkIn: '2026-05-01T00:00:00.000Z',
      checkOut: '2026-05-29T00:00:00.000Z',
      guests: 11,
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional fields', () => {
    const result = createBookingSchema.safeParse({
      propertyId: 'clx1234567890abcdefghij',
      checkIn: '2026-05-01T00:00:00.000Z',
      checkOut: '2026-05-29T00:00:00.000Z',
      guests: 2,
      guestName: 'John Doe',
      guestEmail: 'john@example.com',
      guestPhone: '+1234567890',
      specialRequests: 'Late check-in please',
    });
    expect(result.success).toBe(true);
  });

  it('rejects overly long special requests', () => {
    const result = createBookingSchema.safeParse({
      propertyId: 'clx1234567890abcdefghij',
      checkIn: '2026-05-01T00:00:00.000Z',
      checkOut: '2026-05-29T00:00:00.000Z',
      guests: 2,
      specialRequests: 'x'.repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

describe('Property list query schema', () => {
  it('accepts empty query (defaults)', () => {
    const result = propertyListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(12);
      expect(result.data.sortBy).toBe('createdAt');
      expect(result.data.sortOrder).toBe('desc');
    }
  });

  it('coerces string numbers', () => {
    const result = propertyListQuerySchema.safeParse({ page: '3', limit: '20' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(20);
    }
  });

  it('rejects limit over 50', () => {
    const result = propertyListQuerySchema.safeParse({ limit: '51' });
    expect(result.success).toBe(false);
  });

  it('accepts city filter', () => {
    const result = propertyListQuerySchema.safeParse({ city: 'Toronto' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.city).toBe('Toronto');
    }
  });

  it('accepts isFeatured as string boolean', () => {
    const result = propertyListQuerySchema.safeParse({ isFeatured: 'true' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isFeatured).toBe(true);
    }
  });

  it('accepts sort options', () => {
    const result = propertyListQuerySchema.safeParse({ sortBy: 'price', sortOrder: 'asc' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sortBy).toBe('price');
      expect(result.data.sortOrder).toBe('asc');
    }
  });
});

describe('Change password schema', () => {
  it('accepts valid password change', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldPass1',
      newPassword: 'NewPass123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects weak new password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldPass1',
      newPassword: 'weak',
    });
    expect(result.success).toBe(false);
  });
});

describe('Create review schema', () => {
  it('accepts valid review', () => {
    const result = createReviewSchema.safeParse({
      propertyId: 'clx1234567890abcdefghij',
      rating: 5,
      comment: 'Amazing stay, everything was perfect!',
    });
    expect(result.success).toBe(true);
  });

  it('rejects rating below 1', () => {
    const result = createReviewSchema.safeParse({
      propertyId: 'clx1234567890abcdefghij',
      rating: 0,
      comment: 'Terrible experience unfortunately.',
    });
    expect(result.success).toBe(false);
  });

  it('rejects rating above 5', () => {
    const result = createReviewSchema.safeParse({
      propertyId: 'clx1234567890abcdefghij',
      rating: 6,
      comment: 'Outstanding property and service!',
    });
    expect(result.success).toBe(false);
  });

  it('rejects comment shorter than 10 characters', () => {
    const result = createReviewSchema.safeParse({
      propertyId: 'clx1234567890abcdefghij',
      rating: 4,
      comment: 'Good',
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional sub-ratings', () => {
    const result = createReviewSchema.safeParse({
      propertyId: 'clx1234567890abcdefghij',
      rating: 4,
      cleanliness: 5,
      accuracy: 4,
      location: 5,
      checkIn: 5,
      communication: 4,
      value: 4,
      comment: 'Great place, highly recommended!',
    });
    expect(result.success).toBe(true);
  });
});
