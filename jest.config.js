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
    'src/lib/utils.ts',
    'src/hooks/useCurrency.ts',
    'src/lib/validation/schemas.ts',
    'src/components/booking/BookingCard.tsx',
    'src/components/booking/BookingPriceCalculator.tsx',
    'src/components/booking/AirbnbCalendar.tsx',
    'src/components/layout/UserMenu.tsx',
    'src/components/layout/Navbar.tsx',
    'src/components/layout/Footer.tsx',
    'src/components/property/PropertyCard.tsx',
    'src/components/ui/SearchBar.tsx',
    'src/components/ui/LanguageSwitcher.tsx',
    'src/app/(marketing)/contact/components.tsx',
    'src/app/(marketing)/faq/FAQContent.tsx',
    'src/app/api/auth/login/route.ts',
    'src/app/api/auth/logout/route.ts',
    'src/app/api/auth/session/route.ts',
    'src/app/api/auth/google/route.ts',
    'src/app/api/bookings/route.ts',
    'src/app/api/properties/route.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 65,
      lines: 70,
    },
    './src/lib/booking.ts': {
      statements: 86,
      branches: 89,
      functions: 81,
      lines: 86,
    },
    './src/lib/auth/jwt.ts': {
      statements: 90,
      branches: 0,
      functions: 90,
      lines: 90,
    },
    './src/lib/validation/schemas.ts': {
      statements: 89,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
  coverageDirectory: 'coverage',
};

module.exports = createJestConfig(customJestConfig);
