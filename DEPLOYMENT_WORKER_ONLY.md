# Worker-Only Deployment (API 单栈)

## 目标
- 生产环境只使用 `src/app/api/*`（Next.js App Router Route Handlers）
- 不再使用 `functions/api/*`（Cloudflare Pages Functions）

## 当前状态
- `functions/` 已迁移为 `functions_legacy/`，避免被误当成生产 API 入口
- `wrangler.toml` 使用 `main = ".open-next/worker.js"`，API 由 OpenNext Worker 统一处理
- `npm run deploy:pages` 已禁用（会直接失败并提示使用 Worker 部署）

## 构建与部署
1. 构建 Worker 包：
   ```bash
   npm run build:worker
   ```
2. 部署到 Cloudflare Workers：
   ```bash
   npm run deploy
   ```

## 说明（临时兼容策略）
- 当前 `build:worker` 使用：
  `opennextjs-cloudflare build --dangerouslyUseUnsupportedNextVersion`
- 原因：项目 Next.js 版本 `14.2.35` 已超官方支持窗口。
- 后续建议：升级到受支持 Next.js 主版本后移除该参数。
