import { test, expect } from '@playwright/test';

/**
 * booking-end-to-end.spec.ts — BOOK-009
 *
 * Full booking flow: register → property → checkout → Stripe payment →
 * success → dashboard confirmation.
 *
 * Runs against local dev server (127.0.0.1:3000) or CI preview URL
 * (set via PLAYWRIGHT_BASE_URL env var in GitHub Actions workflow).
 *
 * Date range uses a 30-night stay (today+7 → today+37) to satisfy the
 * 30-night minimum for all properties.
 *
 * Known limitations:
 *   - Local dev mode may skip if D1 is unavailable (registration fails)
 *   - Stripe PaymentElement renders cards inside iframes; use frameLocator
 *   - payment_intent.succeeded webhook is async; poll for CONFIRMED status
 *   - Property cards may not render in local dev due to CSP restrictions
 *     in next.config.js (no unsafe-eval for HMR). The test navigates
 *     directly to /property/:id and /checkout/:id as a pragmatic fallback.
 */

const TEST_PASSWORD = 'E2eTestPass1!';
const STRIPE_CARD = {
  number: '4242424242424242',
  expiry: '1230',
  cvc: '123',
  postal: 'M5V 1A1',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Format a Date as YYYY-MM-DD. */
function yyyymmdd(d: Date): string {
  return d.toISOString().split('T')[0];
}

/** Return check-in (today+7) and check-out (today+37 → 30 nights). */
function computeDateRange(): { checkIn: string; checkOut: string } {
  const today = new Date();
  const ci = new Date(today);
  ci.setDate(today.getDate() + 7);
  const co = new Date(today);
  co.setDate(today.getDate() + 37);
  return { checkIn: yyyymmdd(ci), checkOut: yyyymmdd(co) };
}

/**
 * Register a new user.
 * Navigates to /register, fills form, submits, waits for redirect to /.
 * Gracefully skips the test if registration API is unavailable.
 */
async function registerUser(
  page: import('@playwright/test').Page,
  email: string,
): Promise<void> {
  await page.goto('/register', { waitUntil: 'domcontentloaded' });
  // Wait for the register form
  await expect(page.locator('h2')).toContainText(/create account|注册/i, { timeout: 10_000 });

  await page.fill('#firstName', 'E2E');
  await page.fill('#lastName', 'Booking');
  await page.fill('#email', email);
  await page.fill('#password', TEST_PASSWORD);
  await page.fill('#confirmPassword', TEST_PASSWORD);

  await page.getByRole('button', { name: /create account|注册/i }).click();

  // Wait for redirect to home (success) or stay on register (API unavailable)
  try {
    await page.waitForURL(/\/$/, { timeout: 20_000 });
  } catch {
    const stillOnRegister = /\/register/.test(page.url());
    if (stillOnRegister) {
      if (process.env.PLAYWRIGHT_BASE_URL || process.env.E2E_REQUIRE_AUTH) throw new Error('Registration API unavailable in configured preview');
      test.skip(true, 'Registration API unavailable (no D1 locally or on preview)');
      return;
    }
    throw new Error('Unexpected state after registration');
  }

  // Let client-side auth hydrate
  await page.waitForTimeout(1500);
}

/**
 * Log in with existing credentials.
 * Falls back to test.skip if the API is unavailable.
 */
async function loginUser(
  page: import('@playwright/test').Page,
  email: string,
): Promise<void> {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.fill('#email', email);
  await page.fill('#password', TEST_PASSWORD);
  await page.locator('form').filter({ has: page.locator('#password') }).locator('button[type="submit"]').click();

  try {
    await page.waitForURL(/\/$/, { timeout: 15_000 });
  } catch {
    if (process.env.PLAYWRIGHT_BASE_URL || process.env.E2E_REQUIRE_AUTH) throw new Error('Login API unavailable in configured preview');
    test.skip(true, 'Login API unavailable');
    return;
  }
  await page.waitForTimeout(1500);
}

/** Fill the accessible fields in the Stripe Payment Element mounted by PaymentForm. */
async function fillStripePayment(page: import('@playwright/test').Page): Promise<void> {
  const frame = page.frameLocator('.StripeElement iframe').first();
  await frame.getByRole('textbox', { name: 'Card number' }).fill(STRIPE_CARD.number);
  await frame.getByRole('textbox', { name: 'Expiration date' }).fill(STRIPE_CARD.expiry);
  await frame.getByRole('textbox', { name: 'Security code' }).fill(STRIPE_CARD.cvc);
  const postal = frame.getByRole('textbox', { name: /postal|zip/i });
  if (await postal.isVisible()) await postal.fill(STRIPE_CARD.postal);
}

// ─── Tests ──────────────────────────────────────────────────────────────────

test.describe('Booking end-to-end', () => {
  test.setTimeout(120_000);

  test('full booking flow: register → property → checkout → Stripe → success → dashboard', async ({
    page,
  }) => {
    const seed = Date.now();
    const email = `e2e-booking-${seed}@test.stayneos.com`;
    const { checkIn, checkOut } = computeDateRange();
    const propertyId = '1';

    // ── Step 1: Register ──────────────────────────────────────────────────
    await registerUser(page, email);

    // ── Step 2: Navigate to checkout with dates ───────────────────────────
    //
    // We build the full checkout URL directly with query params rather than
    // clicking through the calendar UI.  This is deterministic and matches
    // the approach already used in browse-and-book.spec.ts.
    //
    // The browser-based calendar interaction is covered separately by
    // manual QA; automating it adds fragility from month navigation,
    // disabled-date logic, and layout shifts without providing business-
    // critical coverage.
    const checkoutParams = new URLSearchParams({
      checkIn,
      checkOut,
      guests: '1',
      adults: '1',
      children: '0',
      infants: '0',
      pets: '0',
    });
    await page.goto(`/checkout/${propertyId}?${checkoutParams.toString()}`, {
      waitUntil: 'domcontentloaded',
    });

    // ── Step 3: Verify checkout page rendered ────────────────────────────
    await expect(page).toHaveURL(/\/checkout\//, { timeout: 10_000 });

    const checkoutMain = page.locator('main, [role="main"]').first();
    await expect(checkoutMain).toBeVisible({ timeout: 15_000 });

    // Verify key content: dates and price summary
    await expect(checkoutMain).toContainText(/price summary|价格明细/i);

    // ── Step 4: Review and continue → creates booking → redirects to payment
    //
    // Contact info is pre-filled from the logged-in user context.
    const reviewBtn = page.getByRole('button', {
      name: /review and continue|review|继续/i,
    });
    await expect(reviewBtn).toBeVisible({ timeout: 8_000 });

    // Listen for the API response to verify booking creation
    const bookingResponse = page.waitForResponse(
      (res) => res.url().endsWith('/api/bookings') && res.request().method() === 'POST' && res.status() === 200,
      { timeout: 15_000 },
    );
    await reviewBtn.click();
    const bookingRes = await bookingResponse;
    const bookingData = await bookingRes.json();
    const bookingId = bookingData?.booking?.id;
    const bookingNumber = bookingData?.booking?.bookingNumber;
    console.log(`✅ Booking created: id=${bookingId}, number=${bookingNumber}`);

    expect(bookingId).toBeTruthy();
    expect(bookingNumber).toBeTruthy();

    // Should now be on the payment page
    await expect(page).toHaveURL(
      url => url.pathname.endsWith(`/payment/${propertyId}`) && url.searchParams.get('bookingId') === bookingId,
      { timeout: 15_000 },
    );

    // ── Step 5: Payment — wait for Stripe to initialize ──────────────────
    const payButton = page
      .getByRole('button', { name: /confirm payment|确认支付|pay/i })
      .first();
    await expect(payButton).toBeVisible({ timeout: 25_000 });

    // Let Stripe mount its iframes
    await page.waitForTimeout(2000);

    // ── Step 6: Fill Stripe test card ────────────────────────────────────
    await fillStripePayment(page);

    // ── Step 7: Submit payment ───────────────────────────────────────────
    await payButton.click();

    // After successful payment the app redirects to /payment/success
    await expect(page).toHaveURL(/\/payment\/success/, { timeout: 30_000 });

    // ── Step 8: Verify success page ──────────────────────────────────────
    const successMain = page.locator('main, [role="main"]').first();
    await expect(successMain).toBeVisible({ timeout: 10_000 });

    // Should show a success message (multi-language support)
    await expect(successMain).toContainText(
      /your trip is booked|booking confirmed|payment successful|行程已预订|预订确认|支付成功/i,
    );

    // The booking number should be displayed prominently
    if (bookingNumber) {
      await expect(successMain).toContainText(bookingNumber, { timeout: 5_000 });
    }

    const itinerary = page.locator(`main a[href$="/dashboard/bookings/${bookingId}"]`);
    await itinerary.click();
    await expect(page).toHaveURL(url => url.pathname.endsWith(`/dashboard/bookings/${bookingId}`));
    await expect(page.locator('main')).toContainText(bookingNumber);
    await expect.poll(async () => {
      const response = await page.request.get(`/api/bookings/${bookingId}`);
      return (await response.json()).data?.booking?.status;
    }, { timeout: 30_000 }).toBe('CONFIRMED');
  });

  test('unauthenticated user redirected to login', async ({ page }) => {
    // BOOK-006: When an unauthenticated user attempts to access /checkout,
    // they should be redirected to /login with a callbackUrl.
    //
    // Skip until BOOK-006 (login modal / auth guard on checkout) is merged.
    test.skip(true, 'BOOK-006 login modal not yet merged; unskip when ready');

    const { checkIn, checkOut } = computeDateRange();
    const params = new URLSearchParams({ checkIn, checkOut, guests: '1' });
    await page.goto(`/checkout/1?${params.toString()}`, { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });
});
