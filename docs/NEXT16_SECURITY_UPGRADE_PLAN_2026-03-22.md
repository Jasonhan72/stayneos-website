# Next.js 高危漏洞处置与 Next.js 16 升级计划（2026-03-22）

## 当前状态
- 当前版本：`next@14.2.35`（已 EOL）
- `npm audit` 报告 1 个 high（Next.js 多条 GHSA）
- 受影响范围（审计输出）：
  - Image Optimizer DoS（remotePatterns）
  - RSC 请求反序列化 DoS
  - rewrites 请求走私
  - next/image 磁盘缓存膨胀

## 已验证的临时缓解（立即生效）
1. `next.config.js` 已启用 `images.unoptimized = true`
   - 实际不使用 Next 内建 Image Optimizer 路径，显著降低 image 相关 2 条漏洞暴露面。
2. `next.config.js` 未配置 `rewrites`
   - 请求走私漏洞触发面受限。
3. 部署目标为 Cloudflare Worker + OpenNext
   - 无传统长期磁盘缓存路径，进一步降低磁盘缓存膨胀风险。

> 结论：当前可作为临时缓解继续运行，但**不能替代升级**。

## 推荐升级路径（目标 Next.js 16）

### Phase 0（当天）
- 在主干保留临时缓解并记录风险（本文件）
- CI gate 保持：`lint`、`build:worker`、`test:all`

### Phase 1（1 天）——兼容性盘点
- 检查与 Next 16 相关的关键依赖：
  - `react/react-dom`（需按 Next 16 官方要求）
  - `eslint-config-next`
  - `@opennextjs/cloudflare`（确认 Next 16 支持矩阵）
  - `next-auth`、`next-intl`、`swr`、`prisma`
- 输出升级分支与影响清单（路由、middleware、edge/runtime API）

### Phase 2（1~2 天）——升级实施（独立分支）
1. 升级核心依赖：
   - `next` -> 16.x
   - `eslint-config-next` -> 16.x
   - 按需升级 `react/react-dom`
2. 处理 breaking changes：
   - App Router 行为变更
   - middleware / headers / cookies API 差异
   - OpenNext 构建兼容调整
3. 回归验证：
   - `npm run lint`
   - `npm run test:all`
   - `npm run build:worker`
   - 冒烟：登录、下单、支付、上传、管理后台

### Phase 3（0.5 天）——灰度与切换
- 预发布环境灰度 24h
- 监控：5xx、P95、登录失败率、上传失败率
- 无异常后主干合并并发布

## 回滚策略
- 保留升级前 lockfile/tag
- 若出现关键链路故障，立即回滚到上一个 Worker 版本
- 回滚后继续保留本临时缓解，并加速修复分支

## 验收标准
- `npm audit` 中 Next.js high 漏洞清零（或仅剩已豁免且有书面风险接受）
- `npm run lint` 通过
- `npm run test:all` 通过
- `npm run build:worker` 通过
