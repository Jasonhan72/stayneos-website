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
