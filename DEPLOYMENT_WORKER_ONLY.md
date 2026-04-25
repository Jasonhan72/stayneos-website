# Worker-Only Deployment (API 单栈)

## 目标
- 生产环境只使用 `src/app/api/*`（Next.js App Router Route Handlers）
- 不再使用 `functions/api/*`（Cloudflare Pages Functions）

## 当前状态
- `functions/` 目录已删除（2026-04-24 收尾）。所有 API 由 App Router + OpenNext Worker 统一处理。
- `wrangler.toml` 使用 `main = ".open-next/worker.js"`。
- `npm run deploy:pages` 已停止使用。

## 构建与部署
1. 构建 Worker 包：
   ```bash
   npm run build:worker
   ```
2. 部署到 Cloudflare Workers：
   ```bash
   npm run deploy
   ```

## 历史背景
- 早期同时存在 Pages Functions (`functions/api/*`) 与 App Router (`src/app/api/*`)，存在鉴权逻辑漂移风险。已统一到 App Router。
- 早期 Next.js 14.2.35 需要 `--dangerouslyUseUnsupportedNextVersion` 才能 build。已升级到 Next 15.5.10，`build:worker` 直接通过，不再需要 flag。
