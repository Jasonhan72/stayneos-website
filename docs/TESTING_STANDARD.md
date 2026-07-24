# TESTING_STANDARD.md — Neos Rentals 测试规范 v1.0

> 参考 Uncle Bob 2026 "Agentic Discipline" 方法论（四 Agent 流水线 + 工具强制质量关卡），
> 适配我们的现实：AI Agent 写码、人不逐行 review，质量由**关卡**而非**自觉**保证。
> 调研笔记：`agents/neos/memory/research-unclebob-ai-testing-2026-07-23.md`
> 制定：Neos，2026-07-23

## 核心原则

1. **不靠人读代码把关，靠指标和测试把关。** 人类介入点只有两处：需求/规格审查（前端）+ 最终抽查（末端）。
2. **关卡由 CI 强制执行。** 任何一关不过，不允许合并/部署。Agent 不能说服自己绕过工具。
3. **测试先行。** 新功能先有验收标准（能落 Gherkin 最好，至少是明确的 Given/When/Then 描述），再写测试，最后写最少代码。
4. **覆盖率只是执行证明，不是质量证明。** 质量最终由变异测试验证（Phase 3）。

## 质量关卡（Gate 定义）

### Gate 1 — 类型与静态检查（已有 ✅）
- `npm run typecheck`（tsc --noEmit）必须零错误
- `npm run lint` 必须通过
- **新增**：eslint 开启 `complexity` 规则，圈复杂度 max = 10（警告），15（报错）
  - 超限函数必须拆分，不允许 eslint-disable 豁免

### Gate 2 — 单元/组件测试（已有，需加门槛 ⚠️）
- `npm run test:coverage` 全部通过
- **coverageThreshold（jest.config 强制）**：
  - 起步线（当前实际水平设定，只升不降）：statements/lines ≥ 70%，branches ≥ 60%，functions ≥ 70%
  - 目标线（2026 Q4）：statements/lines ≥ 85%，branches ≥ 75%
  - 核心业务逻辑（`src/lib/booking.ts`、`src/lib/auth/jwt.ts`、validation schemas）：per-file ≥ 90%
- 新增/修改核心逻辑必须带对应单元测试，否则 PR 不合并

### Gate 3 — E2E 关键路径（已有，需接入主链 ⚠️）
- Playwright 6 条现有 spec 为关键路径基线：
  browse-and-book / booking-end-to-end / register-and-login / wishlist / link-integrity / critical-flows
- **接线**：`test.yml`（PR + main push）跑 e2e；deploy-final 部署后跑 smoke 子集验证生产
- e2e 失败 = 阻断合并；生产 smoke 失败 = 自动告警到 #dev-logs

### Gate 4 — 部署验证（已有 ✅）
- deploy-final 的 Verify job：部署后请求生产 URL 校验（跟随 redirect）
- 保持现状，失败即在 #dev-logs 汇报

### Gate 5 — 变异测试（新增，Phase 3 🔬）
- 工具：Stryker (StrykerJS) 针对 `src/lib/**` 核心纯逻辑模块
- 不进 PR 阻断链（太慢），跑**每周定时任务**：mutation score < 80% 时开 issue 指派修复
- 目的：防"为覆盖率而测"的空洞测试（AI 生成测试的最大风险）

### Gate 6 — 结构指标（新增，Phase 3 🔬）
- 模块大小：单文件 > 500 行报警（eslint `max-lines`），理想 ≤ 300
- 依赖结构：`dependency-cruiser` 检查循环依赖 + 分层违规（components 不得 import app routes 等）
- 每周和变异测试一起跑，产出报告

## 角色分工（对应 Uncle Bob 四阶段）

| 阶段 | Uncle Bob | 我们 |
|---|---|---|
| 非形式化需求 | 人写 | Jason / Neos 提需求 |
| 规格化 + 验收标准 | Specifier Agent（人全审） | Neos 出任务书（含验收标准），Jason 可抽查 |
| 编码 + 测试先行 | Coder Agent | Nova/Logic/Byte（必须先写测试） |
| 重构 + 降复杂度 | Refactorer Agent | 同上，由 Gate 1/2 强制 |
| 变异 + 架构审查 | Architect Agent | CI 定时任务（Gate 5/6）+ Neos 看报告 |

## 落地路线

- **Phase 1（立即）**：coverageThreshold 起步线 + eslint complexity/max-lines + e2e 进 test.yml
- **Phase 2（1-2 周）**：新任务书模板强制"验收标准"字段；核心模块 per-file 90% 补齐
- **Phase 3（评估后）**：Stryker 周任务 + dependency-cruiser；视 CI 成本决定范围

## 修订

- v1.0 (2026-07-23)：初版，Neos 制定

## 附录 A — Phase 1 存量复杂度豁免清单

> 这些文件在接入 Gate 1 时已存在 `complexity > 15` 的函数。Phase 1 通过 `.eslintrc.json` 集中豁免，禁止在源码里使用 inline `eslint-disable`。新文件和未列入文件继续受 `complexity <= 15` 硬门槛约束；清单文件后续重构到阈值内后，应从 ESLint override 和本附录同时移除。`src/lib/booking.ts` 已在 Phase 1 拆分，不列入豁免。

- Account / booking flow pages: `src/app/(account)/dashboard/bookings/[id]/BookingDetailClient.tsx`, `src/app/(account)/profile/page.tsx`, `src/app/(booking-flow)/checkout/[propertyId]/CheckoutClient.tsx`, `src/app/(booking-flow)/payment/[propertyId]/PaymentClient.tsx`, `src/app/(booking-flow)/payment/success/SuccessClient.tsx`, `src/app/(booking-flow)/property/[id]/PropertyDetailClient.tsx`
- Host pages: `src/app/(host)/host/earnings/EarningsClient.tsx`, `src/app/(host)/host/listings/new/page.tsx`, `src/app/(host)/host/listings/new/review/page.tsx`
- API routes: `src/app/api/account/addresses/[id]/route.ts`, `src/app/api/account/addresses/route.ts`, `src/app/api/ai-concierge/route.ts`, `src/app/api/auth/google/callback/route.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/profile/route.ts`, `src/app/api/auth/register/route.ts`, `src/app/api/bookings/[id]/route.ts`, `src/app/api/bookings/route.ts`, `src/app/api/chat/route.ts`, `src/app/api/conversations/route.ts`, `src/app/api/host/ai-assist/description/route.ts`, `src/app/api/host/ai-assist/title/route.ts`, `src/app/api/host/calendar/route.ts`, `src/app/api/host/earnings/route.ts`, `src/app/api/host/import/url/route.ts`, `src/app/api/host/properties/[id]/route.ts`, `src/app/api/host/properties/route.ts`, `src/app/api/inquiries/route.ts`, `src/app/api/market-posts/route.ts`, `src/app/api/payments/confirm/route.ts`, `src/app/api/properties/[slug]/route.ts`
- Components: `src/components/auth/RegisterForm.tsx`, `src/components/booking/AirbnbCalendar.tsx`, `src/components/booking/BookingCard.tsx`, `src/components/booking/FullscreenCalendar.tsx`, `src/components/booking/ReviewAndContinue.tsx`, `src/components/host/HostCalendar.tsx`, `src/components/host/editor/PropertyEditor.tsx`, `src/components/layout/MobileMenu.tsx`, `src/components/layout/Navbar.tsx`, `src/components/layout/UserMenu.tsx`, `src/components/messages/ChatArea.tsx`, `src/components/messages/ConversationList.tsx`, `src/components/pages/BookingsPageClient.tsx`, `src/components/pages/PropertiesPageClient.tsx`, `src/components/property/BookingSidebar.tsx`, `src/components/property/ListingGallery.tsx`, `src/components/property/PropertyCard.tsx`, `src/components/property/PropertyForm.tsx`, `src/components/ui/SearchBar.tsx`
- Shared libs / middleware: `src/lib/admin/property.ts`, `src/lib/context/UserContext.tsx`, `src/lib/d1.ts`, `src/lib/property-db.ts`, `src/lib/query-understanding.ts`, `src/lib/utils/property-transform.ts`, `src/lib/web-search.ts`, `src/middleware.ts`

## 附录 B — Phase 1 存量文件长度豁免清单

> 本仓库 pre-commit 使用 `--max-warnings=0`，因此 `max-lines` warning 在提交链路中会阻断。以下存量文件已集中豁免 `max-lines`；新文件和未列入文件继续受 500 行 warning 约束。

- `src/app/(booking-flow)/checkout/[propertyId]/CheckoutClient.tsx`, `src/app/(booking-flow)/property/[id]/PropertyDetailClient.tsx`, `src/app/(marketing)/for-business/ForBusinessPageContent.tsx`, `src/app/(marketing)/long-term/LongTermPageContent.tsx`, `src/app/(marketing)/market-insights/MarketInsightsPageContent.tsx`, `src/app/api/chat/route.ts`, `src/components/booking/AirbnbCalendar.tsx`, `src/components/host/editor/PropertyEditor.tsx`, `src/components/pages/BookingsPageClient.tsx`, `src/components/pages/PropertiesPageClient.tsx`, `src/components/property/PropertiesList.tsx`, `src/components/property/PropertyForm.tsx`, `src/lib/web-search.ts`
