# 本地开发与发布

## 工具链

项目使用 Node.js 24（`.nvmrc`）和已有 npm lockfile。迁移机器的 Node 24 / npm 10 已持久化在 Git 忽略的 `.local/toolchain/`，不再依赖临时目录，也不覆盖系统 Node。

在任何目录调用本仓库的 `scripts/local.sh` 都会进入项目根目录。它优先使用项目本地工具链，也支持已安装 Node 24 的系统；版本不符会失败并说明原因。Playwright 浏览器默认存入 `.local/ms-playwright/`，可以用 `PLAYWRIGHT_BROWSERS_PATH` 覆盖。

```sh
bash scripts/local.sh ci --legacy-peer-deps
bash scripts/local.sh run db:generate
bash scripts/local.sh exec -- playwright install chromium
bash scripts/local.sh run dev -- --hostname 127.0.0.1
```

新 checkout 不包含机器本地运行时，先安装 `.nvmrc` 指定的 Node 24，再执行以上命令。生产 / preview CI 使用 Node 24，旧 Test Suite workflow 仍使用 Node 20；统一 CI 属于独立后续任务。

## 环境文件

新增 `config/env.local.example` 与当前代码使用的变量名对齐；根目录 `.env.example` 作为 legacy 模板保留，不用于新本地环境。仅在 `.env.local` 不存在时复制模板，并为 `NEXTAUTH_SECRET` 生成随机本地值（模板注释提供命令）。不要覆盖已有环境文件。密钥文件保持权限 0600，不提交。

本次迁移已生成本地认证 secret；Google Maps、Stripe、Resend 默认留空。Stripe 前端读取 `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`，支付联调必须使用测试环境。Resend 留空时邮件客户端跳过实际发送；填写有效 key 后会产生真实邮件。

当前数据库依赖 Cloudflare D1 binding `DB`，不是 `DATABASE_URL`。后者与 `DIRECT_URL` 仅留给旧 Prisma 工具；`npm run db:generate` 生成类型不连接生产数据库。`next dev` / `next start` 不提供 D1 / Durable Objects binding，不足以验证登录、预订和消息后端。

## 验证

```sh
bash scripts/local.sh run typecheck
bash scripts/local.sh run lint
bash scripts/local.sh test -- --runInBand
bash scripts/local.sh run build
bash scripts/local.sh run test:e2e -- tests/e2e/critical-flows.spec.ts --project=chromium --grep 'home -> properties|mobile responsive|404 page' --workers=1
```

浏览器 smoke 使用本地 3000 端口。若已有其他项目占用该端口，应先查明并指定独立端口 / 配置，避免误测。完整 e2e 另需隔离的 D1、测试账号和 Stripe 测试凭据；跳过不算通过，不能将写入测试指向生产。

首次安装、Prisma 二进制和 Next.js 的 Google 字体构建可能需要网络。`build` 只验证 Next.js；Cloudflare OpenNext Worker 构建与发布另行核对。

## 发布

`codex/*` 分支 → PR → 当前提交的 CI 通过 → 合并 main → GitHub Actions。接管设置的 PR 不自动代表生产部署完成。草稿 PR 只做检查、不部署预览；转 ready 会触发完整预览与 E2E，在测试数据隔离核实前不要转 ready。

禁止本地 `npm run deploy`、`wrangler deploy` 或 `wrangler pages deploy`。历史 deploy script 仍在 package.json，但不作为本地入口；生产公开 key 由 GitHub Secrets 在构建时注入。

部署后对 `https://www.stayneos.com` 的 `/`、`/login`、`/properties`、`/api/health`、`/property/1` 执行 GET smoke，核对最终状态和内容。现有生产 workflow 仍只检查副域名，改进另列任务。

## 交接与凭据

[原始交接索引](handoff/openclaw/README.md)列明本地留存资料；新 checkout 的工作规则以 AGENTS、当前任务簿和本指南为准。

GitHub Actions 已有部署与公开构建变量名称；secret 名称存在不证明值有效或 Worker 已绑定。生产 runtime secrets 与 D1 的账户级核对仍需要授权的 Cloudflare 连接。本次没有复制、轮换或写入生产凭据。
