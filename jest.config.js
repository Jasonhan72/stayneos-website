const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/tests/**/*.test.ts', '<rootDir>/tests/**/*.test.tsx'],
  modulePathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/.open-next/'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/tests/e2e/'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/lib/booking.ts',
    'src/lib/auth/jwt.ts',
    'src/lib/i18n.tsx',
    'src/components/booking/BookingCard.tsx',
    'src/components/booking/BookingPriceCalculator.tsx',
    'src/components/booking/AirbnbCalendar.tsx',
    'src/components/layout/UserMenu.tsx',
    'src/components/ui/LanguageSwitcher.tsx',
    'src/app/api/auth/login/route.ts',
    'src/app/api/auth/logout/route.ts',
    'src/app/api/auth/session/route.ts',
    'src/app/api/auth/google/route.ts',
    'src/app/api/bookings/route.ts',
    'src/app/api/properties/route.ts',
  ],
  coverageDirectory: 'coverage',
};

module.exports = createJestConfig(customJestConfig);
