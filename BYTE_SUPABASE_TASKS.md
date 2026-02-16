# Byte 任务追踪 - Supabase 迁移

**状态**: 🟡 等待 Logic 完成后端基础  
**更新日期**: 2026-02-10  
**CEO 决策**: ✅ Supabase 方案已批准

---

## 📋 任务清单

### Phase 1: 等待 Logic 完成 (当前)
- [ ] Logic 完成后端基础架构
- [ ] Supabase Schema 设计完成
- [ ] API 端点实现完成
- [ ] 通知 Byte 开始对接

### Phase 2: API 路由修复
- [ ] 修复 `availability/route.ts` - Decimal 类型转换
- [ ] 修复 `bookings/route.ts` - Prisma where 类型问题
- [ ] 迁移 `_api/*` 路由到 Supabase 客户端直接调用
- [ ] 清理静态导出模式下的 API 路由问题

### Phase 3: Supabase API 对接
- [ ] 安装 Supabase 客户端依赖
- [ ] 配置 Supabase 连接
- [ ] 创建 Supabase 类型定义
- [ ] 迁移 Prisma 查询到 Supabase
- [ ] 实现乐观更新策略
- [ ] 添加 React Query / SWR 缓存

### Phase 4: 预订组件重构
- [ ] BookingCard 组件优化
- [ ] 加载状态动画
- [ ] 错误边界处理
- [ ] 移动端手势支持
- [ ] Lighthouse 性能优化

---

## 🔍 当前代码问题分析

### 1. Decimal 类型问题
**位置**: `src/app/_api/bookings/route.ts`  
**问题**: Prisma Decimal 类型需要显式转换为 number
```typescript
const basePrice = Number(property.basePrice);
const discountPercentage = Number(property.monthlyDiscount);
```

**解决方案**: 迁移到 Supabase 后使用 numeric 类型，前端统一处理

### 2. Prisma where 类型问题
**位置**: `src/app/_api/bookings/route.ts`  
**问题**: 动态 where 条件类型复杂
```typescript
const where: { userId: string; status?: string | { in: string[] }; checkIn?: { gte: Date } } = { userId: user.id };
// @ts-expect-error - Prisma types are complex
where,
```

**解决方案**: Supabase 使用更灵活的查询语法

### 3. 静态导出模式限制
**位置**: `src/app/_api/*`, `src/app/api/*`  
**问题**: `output: 'export'` 模式下 API 路由无法运行

**解决方案**: 
- 选项 A: 迁移到 Cloudflare Functions
- 选项 B: 客户端直接调用 Supabase
- 选项 C: 使用 Next.js SSR 模式

**推荐**: 选项 B - 客户端直接调用 Supabase (符合 CEO 决策)

---

## 🏗️ Supabase 迁移计划

### 技术选型
- **Supabase Client**: `@supabase/supabase-js`
- **数据获取**: `TanStack Query (React Query)` v5
- **服务端**: Cloudflare Functions (如需保留部分 API)

### 架构变更
```
Before:
Frontend → Next.js API Routes → Prisma → Database

After:
Frontend → Supabase Client → Supabase API → Database
              ↓
       (Cloudflare Functions - 如需)
```

### 需要修改的文件

#### API 层 (迁移到 Supabase)
| 文件 | 状态 | 备注 |
|------|------|------|
| `src/app/_api/bookings/route.ts` | 待修改 | POST/GET 迁移 |
| `src/app/_api/bookings/[id]/route.ts` | 待修改 | GET/PATCH 迁移 |
| `src/app/_api/payments/create-intent/route.ts` | 待修改 | Stripe 保留，其他迁移 |
| `src/app/api/availability/route.ts` | 待修改 | 完全迁移 |

#### 组件层 (使用 Supabase Hooks)
| 文件 | 状态 | 备注 |
|------|------|------|
| `src/components/booking/BookingCard.tsx` | 待修改 | 使用新 API |
| `src/app/booking/[propertyId]/BookingContent.tsx` | 待修改 | 使用新 API |
| `src/app/dashboard/bookings/page.tsx` | 待修改 | 使用新 API |
| `src/app/dashboard/bookings/[id]/BookingDetailClient.tsx` | 待修改 | 使用新 API |

#### 新增文件
| 文件 | 用途 |
|------|------|
| `src/lib/supabase.ts` | Supabase 客户端配置 |
| `src/lib/supabase-server.ts` | 服务端 Supabase 配置 |
| `src/hooks/use-bookings.ts` | 预订相关 Hooks |
| `src/hooks/use-availability.ts` | 可用性查询 Hooks |
| `src/types/supabase.ts` | Supabase 类型定义 |

---

## 📦 依赖安装清单

```bash
# Supabase
npm install @supabase/supabase-js

# TanStack Query (推荐)
npm install @tanstack/react-query @tanstack/react-query-devtools

# 或使用 SWR
npm install swr
```

---

## ⚠️ 注意事项

1. **环境变量**: 需要添加 Supabase URL 和 Anon Key
2. **认证**: NextAuth 与 Supabase Auth 整合
3. **实时功能**: 考虑使用 Supabase Realtime 替代轮询
4. **Row Level Security**: 确保 RLS 策略正确配置

---

**等待 Logic 通知中...** 🚀
