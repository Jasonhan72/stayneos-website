# StayNeos — Codex 接管状态

核对日期：2026-10-31（America/Toronto）。本文件记录核对证据；实时提交、PR 和 CI 状态以 GitHub 为准。

## 接管范围

- 已将完整 Git 历史接入当前 StayNeos 项目，远程为 `Jasonhan72/stayneos-website`。
- 基线 `bf5b2cba61997d2e64bd6a9778463f9a105a1b39`，与原 OpenClaw checkout 的 main 一致；原目录无未提交修改，保持原样。
- 工作分支 `codex/project-setup`。本次交付为环境 / 文档 / 草稿预览保护，不改业务页面或数据库，不发布生产。
- 4 份原始交接文件在本地原样归档并逐字节校验；因含内部运营信息与机器路径，不进入公开 Git 历史。共享索引见 [交接索引](handoff/openclaw/README.md)。
- 项目规则写入可跟踪的 AGENTS.md；旧人格 / heartbeat 模板没有迁入。

## 持久开发环境

- Node.js 24.22.2、npm 10.9.9 已从临时准备目录转为项目 `.local/toolchain/` 持久保存，未修改全局 Node。
- `bash scripts/local.sh` 选择 Node 24 和 npm，进入仓库根目录，并将 Playwright 浏览器存入忽略的 `.local/ms-playwright/`。
- Chromium / headless shell / FFmpeg 已安装。新 checkout 使用 `.nvmrc` 配置 Node 24；本机工具链与浏览器不提交。
- 依赖按既有 lockfile 安装（1035 packages）；Prisma Client 生成通过，package.json / lockfile 不变。
- 新增 `config/env.local.example`，使用正确的 Stripe public 变量名与空的集成 key；根目录 legacy 模板保持兼容；`.env.local` 仅含本地认证 secret，其他集成 key 留空，权限 0600，Git 忽略。

## 验证结果

- `npm run typecheck` 通过；ESLint 无警告 / 错误。
- Jest：29 套件 / 264 测试全部通过；statements 77.03%、branches 66.93%、functions 69.26%、lines 79.30%，覆盖率门槛通过。
- Next.js 构建通过；既有 jose CompressionStream / DecompressionStream Edge Runtime 警告仍在，不等于 Worker 构建验证。
- 本地 `next start` 已启动，`/`、`/login`、`/properties`、`/api/health`、`/property/1` 均 200，health 为 `ok: true`。
- 本地 Chromium 的浏览 / 移动布局 / 404 smoke：3/3 通过（5.9s）。
- 同样 5 条生产路径经只读 GET 均 200，页面标题符合路由；`https://neos.rentals/` 最终跳转到 `https://www.stayneos.com/`。
- 提交前 TruffleHog 扫描通过；autoreview 使用应用自带 Codex CLI，P0 审查无 accepted/actionable findings。系统全局 Codex CLI 缺二进制，未改动全局安装。
- 上述结果不代表 D1、付款、邮件、退款或消息链路验收通过。本次没有发送邮件、创建订单或扣款。

## GitHub / Cloudflare 接管核对

- GitHub 仓库访问与分支 fetch 正常。main 的 required contexts 为 Typecheck、Tests、Build + Deploy Preview、test，strict=true；管理员保护未启用，E2E 不在 required contexts 中。接管不修改远端保护策略，仍按项目规则检查全部 CI。
- GitHub Secrets 名称包含 Cloudflare deploy token / account、Maps public key、Stripe public / secret key、E2E 账号。名称存在不证明值有效；该次仓库 secret 列表未见 RESEND_API_KEY，Worker 自身是否另有配置尚未核实。
- 当前本机 Wrangler 没有可用登录连接。旧工作区存在 Cloudflare token，但“使用旧生产凭据只读查询 runtime secret 名称”的请求被自动审批拒绝，原因是缺少明确的生产密钥使用授权；请求未执行，未复制 token。
- 原 Stripe 凭据为 live；全链路联调仍需隔离的 D1 / Stripe 测试环境。
- preview workflow 沿用带生产 D1 标识的配置，不能把它当作已经隔离的测试数据库。因此本次新增草稿 PR 不部署的 guard：Typecheck / Tests 仍运行，Build + Deploy Preview 与依赖的远程 E2E 在草稿阶段跳过；转 ready 时重新触发完整预览流程。此保护不取代后续测试环境隔离。

## 已核对的旧任务与差异

- PR #35 与 #36 仍 open、未合并、mergeable=false。#35 改 8 个代码文件；#36 也夹带这些代码并非纯设计资料。main 已合并 #37–#56 期间多项替代实现，旧 PR 不宜直接恢复合并。
- 详情页 gallery / sticky、首页 chips、列表筛选 / 分屏地图已在 main；不能按 5 月快照重复开发。
- 退款 API 已调用 Stripe refunds.create，但没有 amount 分档计算；旧蓝图政策不能视为已实现。
- pre-arrival reminder 仍是返回 false 的 stub；详情页六维评分和固定评论仍含 mock 内容。
- CI Node 20/24 混用；生产 verify 仅副域名；旧 deploy script 保留但禁止本地执行。这些改进与业务问题记录于 [当前任务簿](TASK_BOARD.md)，不混入此次接管实现。

## 待完成的授权与外部条件

1. 明确授权后，通过旧 Cloudflare token 的只读 API 或用户新连接，核对 Worker secret 名称、D1 / R2 / Durable Objects binding；不复制密钥、不修改生产。
2. 准备独立 D1、Stripe 测试 key / webhook 和隔离账号，再验收完整预订与邮件链路。
3. 在预览测试与生产数据隔离明确前，迁移 PR 保持草稿，不绕过 required checks 合并。
