# StayNeos / Neos Rentals — Codex 项目规则

## 项目与上下文

- 多伦多公寓租赁官网与预订系统；仓库 `Jasonhan72/stayneos-website`。
- Next.js 15 App Router、React 19、TypeScript、Cloudflare Workers / OpenNext、D1、Stripe、Resend；独立 booking / payments Workers 位于 `workers/`。
- 生产验证以 `https://www.stayneos.com` 为准。`neos.rentals` 的历史迁移与重定向描述必须现场核实。
- 开始任务先读 `docs/PROJECT_STATUS.md` 与 `docs/TASK_BOARD.md`；环境操作见 `docs/DEVELOPMENT.md`。
- 原始交接包仅在迁移机器的 `docs/handoff/openclaw/` 留存（Git 忽略）；可共享索引为该目录的 README。它是历史证据，不代表当前状态；尤其 5 月任务簿与蓝图不能覆盖更新后的代码、PR 和验证结果。
- 当前工作以本仓库为准；旧 OpenClaw 工作区保留作迁移来源。不要在两个目录同时修改同一任务。
- 默认中文沟通，由 AI 执行命令和排查。只报告实际验证结果，明确区分本地完成、PR 合并、部署完成。

## 开发与验证

- 使用 Node.js 24（`.nvmrc`），npm 与现有 `package-lock.json`。安装：`npm ci --legacy-peer-deps`；生成 Prisma 类型：`npm run db:generate`。
- 本机命令优先用 `bash scripts/local.sh` 包装 npm，以选择持久化的项目 Node 24；例如 `bash scripts/local.sh run dev -- --hostname 127.0.0.1`。其他机器先按 `.nvmrc` 安装 Node 24。
- 代码变更按范围运行 `npm run typecheck`、`npm run lint`、`npm test -- --runInBand`；需要构建验证时运行 `npm run build`。
- Playwright：`npm run test:e2e`。涉及 D1、登录、Stripe 的跳过不等于全链路通过；记录缺失依赖与实际测试数量。
- 保持四种 stay type（short / monthly / quarterly / yearly）在数据库枚举、价格单位、UI、API 和邮件中的映射一致。
- 保留 EN / ZH / FR 界面；预订邮件使用 Resend 的 EN / ZH 模板。
- Google Maps 嵌入使用 Embed API v1 和环境变量 `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`。

## Git 与部署

- 使用 `codex/` 分支和 PR；禁止直接推送 main。提交格式：`type(scope): description`。
- 合并前检查该 PR 当前提交的全部必需 CI；“6 checks”仅为历史描述，以当前 workflow 和分支保护为准。不得绕过失败检查。
- 生产发布只通过 PR 合并更新 main 后触发 GitHub Actions。禁止在本地运行 `npm run deploy`、`wrangler deploy` 或 `wrangler pages deploy`。
- `NEXT_PUBLIC_*` 是构建时注入；生产真值由 GitHub Secrets 提供。不能用本地占位值构建并覆盖生产。
- 发布后的 GET smoke：`/`、`/login`、`/properties`、`/api/health`、`/property/1`，检查最终 HTTP 状态和响应是否符合预期。
- 任务仅要求环境设置或调查时，不因此发布生产。历史“通过后自动发布”约定用于已授权的交付范围，仍须满足 PR / CI。

## 密钥与项目记忆

- 密钥只放在被忽略的环境文件或服务端 secret store；不输出、不硬编码、不提交。交接文档只能记录变量名与来源路径。
- 本地默认无生产支付、邮件或数据库凭据。支付集成验证使用 Stripe 测试环境；没有依赖时如实记录限制。
- `docs/TASK_BOARD.md` 是迁移后的唯一当前任务簿，开始、阻塞、完成时更新；原始快照不改写。
- 当前技术债、验证记录和环境差异写入 `docs/PROJECT_STATUS.md`；业务功能状态需用代码、PR 和实际验证核对。
