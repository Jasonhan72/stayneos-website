# StayNeos Web Code Review Report (Auth + i18n)

审核范围：
- Repo: `/Users/neos/.openclaw/workspace/stayneos-web`
- Auth 最近 5 次相关 commit：`86b9e67`, `05ab265`, `3a00c4c`, `51545cb`, `6aa183b`
- i18n 全面检查：`src/lib/i18n.tsx`、`messages/{en,zh,fr}.json`、`src/app/**`、关键组件与 API 文案

---

## 🔴 严重问题（必须修复）

### 1) Middleware 未校验 JWT 签名（可伪造登录/权限）
- 文件：`src/middleware.ts`
- 问题：`verifyToken()` 仅做 `split('.') + atob(payload)` 和 `exp` 检查，没有 `jwt.verify(secret)`。
- 风险：攻击者可自行构造 payload（例如 `{"role":"ADMIN"}`）并通过受保护路由检查，属于高危认证绕过。
- 关联架构项：`middleware 的认证逻辑是否健壮` → 当前不健壮。
- 修复建议：
  - 在 middleware 使用 `jsonwebtoken` 或 `jose` 做签名校验。
  - 明确限制算法（如 `HS256`）并校验 `iss/aud`（若已定义）。
  - 失败时统一视为未登录并清理无效 token cookie。

### 2) Auth Cookie `httpOnly: false`（XSS 可直接窃取 token）
- 文件：
  - `src/app/api/auth/login/route.ts`
  - `src/app/api/auth/register/route.ts`
  - `src/app/api/auth/google/callback/route.ts`
  - `src/app/api/auth/logout/route.ts`
- 问题：`stayneos_auth_token` 被设置为 `httpOnly: false`。
- 风险：任何 XSS 都可读写 token，导致会话劫持。
- 修复建议：
  - 立即改为 `httpOnly: true`。
  - 前端不要再从 JS 读取 auth cookie；需要用户信息请走 `/api/auth/session`。
  - 配合 `secure: true`（生产）+ `sameSite=lax/strict`。

### 3) Google OAuth state 校验被“缺 cookie 时跳过”
- commit：`05ab265`
- 文件：`src/app/api/auth/google/callback/route.ts`
- 问题：当 `oauth_state` cookie 丢失时直接 `skip CSRF check`。
- 风险：OAuth CSRF / Login CSRF，攻击者可将受害者绑定到错误会话。
- 修复建议：
  - state 缺失应失败（拒绝登录），不要降级放行。
  - 若 Cloudflare 环境 cookie 不稳定，改为：
    - 使用 `state` + 服务端短期存储（KV/D1）
    - 或 `nonce` + PKCE + server-side state store。

### 4) 密码重置 token 明文落库 + 明文写日志（生产不可接受）
- 文件：`src/app/api/auth/forgot-password/route.ts`
- 问题：
  - reset token 以明文存入 `User.resetToken`
  - 日志打印完整 reset URL（包含 token）
- 风险：日志泄露即账号接管；数据库只读泄露也可直接复用 token。
- 修复建议：
  - 只存 token 哈希（如 SHA-256(token)）并按哈希比对。
  - 严禁输出完整 reset URL/token 到日志。
  - 加入单次使用、频率限制、尝试次数限制。

### 5) 前端登录/注册表单通过 `dangerouslySetInnerHTML` 内嵌大量文案，绕过 i18n
- 文件：
  - `src/app/(auth)/login/page.tsx`
  - `src/app/(auth)/register/page.tsx`
- 问题：核心 auth 页面大量硬编码英文字符串在 HTML 字符串中，无法走 `t()`。
- 风险：语言切换对登录注册页基本失效；后续维护极易产生中英文混用。
- 修复建议：
  - 移除 raw HTML SSR 方案，改回可控 React 组件。
  - 所有 UI 文案接入 `useI18n().t()`。

---

## 🟡 建议改进

### Auth 安全与质量
- `src/app/api/auth/register/route.ts`
  - `catch` 返回 `{ error: errorMessage }`，可能暴露内部细节；建议生产环境只返回通用错误码。
  - 多处 `console.log`（如请求 body、用户创建流程），建议降级并脱敏。
- `src/app/api/auth/login/route.ts` / `register/route.ts`
  - 同时支持 JSON + form-urlencoded 本身可行，但现在实现分支重复较多；建议抽成统一 parse + validate 层。
- `src/app/api/auth/google/callback/route.ts`
  - `secure: true` 固定开启，开发环境可能不便本地测试；建议按环境控制。
- `src/app/auth-callback/page.tsx`
  - 现流程已改为 Google callback 直接写 `stayneos_auth_token` 并跳 `/dashboard`，该页面读取的是 `auth_token/auth_user` 旧 cookie，已与现实现不一致。建议删除或重写，避免“僵尸页面”误导。
- `src/app/api/auth/reset-password/route.ts`
  - 缺少密码复杂度策略（仅 >=6）。建议至少长度 + 常见弱密码拦截。
  - 缺少速率限制（forgot/reset 都应加）。

### i18n 机制与一致性
- `src/lib/i18n.tsx`
  - `setCookie` 未设置 `Secure`（locale 虽非敏感，但生产建议加）。
  - 有较多 `console.log` 调试输出，建议在生产关闭。
- 翻译文件完整性（`messages/en.json`, `zh.json`, `fr.json`）
  - key 数量：`en=2514`, `zh=2275`, `fr=2275`
  - `zh/fr` 相对 `en` 各缺失 **247** keys；`en` 相对 `zh/fr` 各缺失 **8** keys。
  - 典型不一致：`business.*` 与 `longterm.*` 命名结构不一致（如 `business.title` vs `business.hero.title`）。
- 多页面硬编码文案仍存在（不仅 auth）
  - 例：`src/components/layout/LanguageCurrencySelector.tsx` 的 “Language/Currency”
  - 例：`src/app/profile/preferences/page.tsx` 大量英文硬编码
  - 例：`src/app/(auth)/forgot-password/ForgotPasswordForm.tsx` 英文硬编码
  - 例：`src/app/(auth)/reset-password/ResetPasswordForm.tsx` 中英混用
- API 返回消息语言未跟随用户语言
  - Auth API 里中文、英文混杂（例如 register 同时出现英文与中文 message），且未读取 locale。
  - 建议：后端按 `x-locale` / `Accept-Language` 返回一致语言，或返回稳定错误码由前端本地化。

---

## 🟢 已确认正常

- 密码哈希：`bcrypt.hash(..., 10)` / `bcrypt.compare(...)` 已使用，基本正确。
- SQL 注入：主要 DB 读写使用 `prepare().bind()` 参数化，未见直接字符串拼接注入点（当前范围内）。
- 基本认证流程：login/register/google callback 都会签发 JWT 且设置统一 cookie 名 `stayneos_auth_token`。
- forgot-password 防枚举：无论邮箱是否存在，接口返回统一成功语义，方向正确。
- locale cookie 基础逻辑：middleware 首次访问会写入 `stayneos_locale`，并通过 `x-locale` 透传到服务端组件，机制方向正确。

---

## 结论（优先级）

P0（立即修复）：
1. middleware JWT 签名校验缺失
2. auth cookie 非 HttpOnly
3. OAuth state 缺失时放行
4. reset token 明文日志/明文存储

P1（本周修复）：
1. auth 页面去除 raw HTML + 全量接入 i18n
2. 翻译 key 对齐（en/zh/fr）
3. API 错误消息统一语言策略
4. 删除或重构 `auth-callback` 旧页面

P2（持续优化）：
1. Auth 输入校验与错误处理抽象复用
2. forgot/reset 增加 rate limit、审计与监控
3. 生产日志脱敏与降噪

