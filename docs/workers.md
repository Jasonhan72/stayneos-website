# Worker Architecture

## Overview

StayNeos uses a monorepo with multiple Cloudflare Workers:

| Worker | Status | Purpose | Route |
|--------|--------|---------|-------|
| `stayneos` (main) | ✅ Production | Full Next.js app via OpenNext | `stayneos.com` |
| `stayneos-preview` | ✅ Staging | PR preview deployments | `stayneos-preview.neos-lab.workers.dev` |
| `stayneos-payments-staging` | 🚧 Staging | Stripe webhook + payment API | `stayneos-payments-staging.neos-lab.workers.dev` |
| `stayneos-booking-staging` | 🚧 Staging | Booking CRUD API | `stayneos-booking-staging.neos-lab.workers.dev` |
| `stayneos-payments` | 📋 Planned | Production payments worker | TBD |
| `stayneos-booking` | 📋 Planned | Production booking worker | TBD |

## Shared Resources

All workers share the same resources:

- **D1 Database**: `stayneos-db` (database_id: `f667afae-6f66-4e4a-960a-37096eabdf03`)
- **R2 Bucket**: `stayneos-images`
- **Secrets**: Each worker manages its own secrets via `wrangler secret put`

## Worker Details

### stayneos-payments-staging

**Location**: `workers/stayneos-payments/`

**Endpoints**:
- `GET  /health` — Health check
- `POST /api/payments/webhook` — Stripe webhook receiver
- `POST /api/payments/create-intent` — Create Stripe PaymentIntent

**Secrets required**:
- `STRIPE_SECRET_KEY` — Stripe secret key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `NEXTAUTH_SECRET` — JWT signing secret (for production auth)

**Deploy**:
```bash
cd workers/stayneos-payments
npm ci
npx wrangler deploy                                  # staging
npx wrangler deploy --name stayneos-payments          # production
```

### stayneos-booking-staging

**Location**: `workers/stayneos-booking/`

**Endpoints**:
- `GET    /health` — Health check
- `POST   /api/bookings` — Create booking
- `GET    /api/bookings` — List user's bookings
- `GET    /api/bookings/:id` — Get booking detail
- `PATCH  /api/bookings/:id` — Update booking
- `DELETE /api/bookings/:id` — Cancel booking
- `GET    /api/bookings/:id/review` — Get review
- `POST   /api/bookings/:id/review` — Submit review

**Secrets required**:
- `STRIPE_SECRET_KEY` — Stripe secret key (for refund processing)
- `NEXTAUTH_SECRET` — JWT signing secret (for production auth)

**Deploy**:
```bash
cd workers/stayneos-booking
npm ci
npx wrangler deploy                                 # staging
npx wrangler deploy --name stayneos-booking         # production
```

## CI/CD

### Automatic Staging Deploys

- **Push to `main`**: If files in `workers/stayneos-payments/**` or `workers/stayneos-booking/**` change, the staging workers auto-deploy (`deploy-workers-staging.yml`)
- **PR opened/updated**: `test-workers.yml` runs `wrangler deploy --dry-run` to validate the workers build

### Manual Deploy

Go to GitHub Actions → "Deploy Staging Workers" → "Run workflow"

## Verification

### Health Checks

```bash
# Payments staging
curl https://stayneos-payments-staging.neos-lab.workers.dev/health
# → {"ok":true,"service":"stayneos-payments","ts":"..."}

# Booking staging
curl https://stayneos-booking-staging.neos-lab.workers.dev/health
# → {"ok":true,"service":"stayneos-booking","ts":"..."}
```

### Webhook Verification (Payments)

```bash
# Test that the webhook endpoint exists (will return 400 without valid Stripe signature)
curl -s -o /dev/null -w "%{http_code}" \
  -X POST https://stayneos-payments-staging.neos-lab.workers.dev/api/payments/webhook
# → 400 (MISSING_SIGNATURE) — correct behavior
```

### Booking API Verification (Booking)

```bash
# Test auth requirement
curl -s -o /dev/null -w "%{http_code}" \
  https://stayneos-booking-staging.neos-lab.workers.dev/api/bookings
# → 401 (UNAUTHORIZED) — correct behavior

# Test with user header
curl -s https://stayneos-booking-staging.neos-lab.workers.dev/api/bookings \
  -H "X-StayNeos-User-Id: YOUR_TEST_USER_ID"
```

## Traffic Switch Plan (Future)

### Phase 1: Parallel (Current) ✅
- Staging workers deployed and health-checked
- Main worker routes unchanged
- Stripe webhook still points to `stayneos.com/api/payments/webhook`

### Phase 2: Service Binding Setup (Planned)
1. Add service bindings to main `wrangler.toml`:
   ```toml
   [[services]]
   binding = "PAYMENTS"
   service = "stayneos-payments"

   [[services]]
   binding = "BOOKING"
   service = "stayneos-booking"
   ```
2. Update main worker's `src/worker.ts` to proxy matching routes to the bound services
3. Frontend calls stay the same (still hits `stayneos.com/api/*`)

### Phase 3: Stripe Webhook Switch (Planned)
1. Create new Stripe webhook endpoint pointing to `stayneos-payments.workers.dev`
2. **⚠️ Requires Jason/owner confirmation** — webhook URL change affects production payments
3. Keep old webhook active as fallback for 24h
4. Verify webhook events are received on new endpoint
5. Remove old webhook

### Phase 4: DNS / Route Cutover (Planned)
1. Map custom domains:
   - `payments.stayneos.com` → `stayneos-payments`
   - `bookings.stayneos.com` → `stayneos-booking`
2. Update frontend API client to call new domains
3. Canary: 10% → 50% → 100% traffic

## Migration Checklist

- [x] Create `workers/stayneos-payments/` with wrangler.toml + source
- [x] Create `workers/stayneos-booking/` with wrangler.toml + source
- [x] GitHub Actions workflows for staging deploy + PR validation
- [x] Health check endpoints on staging workers
- [ ] Set secrets on Cloudflare:
  - `stayneos-payments-staging`: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
  - `stayneos-booking-staging`: STRIPE_SECRET_KEY
- [ ] Deploy staging workers and verify health
- [ ] Add service bindings to main worker (Phase 2)
- [ ] Switch Stripe webhook (requires owner confirmation)
- [ ] DNS cutover + canary (Phase 4)
