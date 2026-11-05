# StayNeos Website

StayNeos - Premium Executive Apartment Rentals in Toronto

## Codex workspace

Start with [project status](docs/PROJECT_STATUS.md), [current tasks](docs/TASK_BOARD.md),
and the [development guide](docs/DEVELOPMENT.md). Project rules live in [AGENTS.md](AGENTS.md).
The [migration archive index](docs/handoff/openclaw/README.md) summarizes the original documents, which remain local to the migration machine.

## 🌐 Live Site
- **Production**: https://stayneos.com
- **Staging**: https://stayneos.pages.dev

## 🚀 Deployment Strategy

Use a feature branch and PR. Merge only after required CI checks pass; updates to
`main` trigger GitHub Actions to build OpenNext and deploy to Cloudflare Workers.
Never push directly to `main` or deploy from a local machine with Wrangler / `npm run deploy`.
Production `NEXT_PUBLIC_*` values are injected from GitHub Secrets at build time.

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

See [docs/workers.md](docs/workers.md) for worker architecture and the historical traffic switch plan.
For current deployment rules, follow [AGENTS.md](AGENTS.md) and [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## 🌍 Features
- Multi-language support (EN/FR/ZH)
- App Router rendered through OpenNext on Cloudflare Workers
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
# Use Node.js 24 (see .nvmrc), then install locked dependencies
npm ci --legacy-peer-deps
npm run db:generate

# Development
npm run dev

# Build
npm run build

# Validate locally; release through a PR and GitHub Actions
npm run typecheck
npm test -- --runInBand
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
