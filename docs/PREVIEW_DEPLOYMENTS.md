# Preview Deployments

## Overview

Every pull request to `main` automatically gets a **preview deployment** — a live, working copy of the site running on Cloudflare Workers. You can see exactly how your changes look in production before merging.

## How It Works

```
PR opened/updated → Typecheck → Tests → Build → Deploy to preview worker → PR Comment
```

1. **Open a PR** targeting `main`
2. GitHub Actions runs: typecheck → unit tests → build
3. If all pass, the app is deployed to the **`stayneos-preview`** Cloudflare Worker
4. A bot comment appears on the PR with the **preview URL**
5. Every subsequent push updates the preview automatically

## Where to Find the Preview URL

The preview URL is posted as a **sticky comment** on the PR (stays at the top, updates on each push).

Typical URL format:
```
https://stayneos-preview.<subdomain>.workers.dev
```

## Merge Requirements

Before merging to `main`:
- ✅ All status checks must pass (typecheck, tests, preview deploy)
- ✅ At least 1 approval required
- ✅ Branch must be up to date with `main`

## Preview vs Production

| | Preview | Production |
|---|---|---|
| Worker | `stayneos-preview` | `stayneos` |
| Domain | `*.workers.dev` | `neos.rentals` / `www.stayneos.com` |
| Data | Shared D1 / R2 | Shared D1 / R2 |
| Auth | Prod OAuth (redirects to prod) | Full auth flow |

> **Note:** Preview shares the same database and storage as production. Be careful with destructive operations in preview.

## Manual Preview Deploy

```bash
# Build locally
npm run build
npx opennextjs-cloudflare build

# Deploy to preview worker
npx wrangler deploy --name stayneos-preview
```

## Workflow Files

- `.github/workflows/preview.yml` — PR preview deployment
- `.github/workflows/deploy-final.yml` — Production deployment (main only)
- `.github/workflows/ci.yml` — CI quality gates
- `.github/workflows/test.yml` — Test suite
