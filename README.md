# StayNeos Website

StayNeos - Premium Executive Apartment Rentals in Toronto

## 🌐 Live Site
- **Production**: https://stayneos.com
- **Staging**: https://stayneos.pages.dev

## 🚀 Deployment Strategy

### Option 1: GitHub + Cloudflare Pages (Recommended)
This repository is configured with GitHub Actions for automatic deployment to Cloudflare Pages.

**Setup Steps:**
1. Create a new repository on GitHub named `stayneos-website`
2. Push this code to the repository
3. Add `CLOUDFLARE_API_TOKEN` secret in GitHub repository settings
4. Every push to `main` branch will automatically deploy

### Option 2: Direct Cloudflare Pages
Deploy directly via Wrangler CLI:
```bash
npm run build
npx wrangler pages deploy dist --project-name=stayneos
```

## 🛠️ Tech Stack
- Next.js 15 + TypeScript
- Tailwind CSS
- React Context (i18n)
- Cloudflare Workers (OpenNext)

## 🧩 Worker Architecture

The project uses multiple Cloudflare Workers:

| Worker | Purpose | Docs |
|--------|---------|------|
| `stayneos` | Main Next.js app | (this README) |
| `stayneos-payments` | Stripe webhook + payment API | [docs/workers.md](docs/workers.md) |
| `stayneos-booking` | Booking CRUD API | [docs/workers.md](docs/workers.md) |

See [docs/workers.md](docs/workers.md) for full worker documentation, deployment steps, and traffic switch plan.

## 🌍 Features
- Multi-language support (EN/FR/ZH)
- Static export for optimal performance
- 17 optimized property images
- 2 premium Toronto properties listed

## 📝 Environment Variables
```bash
CLOUDFLARE_API_TOKEN=your_token_here
```

## Email configuration

Transactional guest emails use Resend over HTTPS. Configure `RESEND_API_KEY` as a GitHub Actions / Cloudflare Workers secret (do not commit it). `RESEND_FROM_EMAIL` defaults to `reservations@send.neos.rentals` and can be overridden in `wrangler.toml` vars.

## 🚀 Quick Start
```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Deploy main worker
npm run deploy
```

## 📁 Project Structure
```
stayneos-web/
├── .github/workflows/      # CI/CD automation
├── docs/workers.md         # Worker architecture docs
├── messages/               # i18n translations
├── public/images/          # Property photos
├── workers/                # Independent Cloudflare Workers
│   ├── stayneos-payments/  # Stripe webhook + payment API
│   └── stayneos-booking/   # Booking CRUD API
├── src/
│   ├── app/                # Next.js pages
│   ├── components/         # React components
│   └── lib/                # Utilities & i18n
└── dist/                   # Build output
```

## 🔑 API Tokens Required
- Cloudflare API Token with `Cloudflare Pages:Edit` permission
- Account ID: `84e5534ae694a084f23f58020bd73c7b`

## 📞 Contact
- Email: hello.Stayneos@gmail.com
- Website: https://stayneos.com

<!-- Preview deploy test 1778739046 -->
<!-- Preview deploy verified: 2026-05-14T06:13:15Z -->
<!-- preview final verify 2026-05-14T06:23:37Z -->
<!-- preview deploy v3: 2026-05-14T06:33:11Z -->
