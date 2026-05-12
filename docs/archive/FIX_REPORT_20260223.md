# StayNeos Web 修复报告

## 修复日期
2026-02-23

## 修复内容

### 1. 内页文字错误修复 ✅

**问题发现：**
- `properties/page.tsx` 列表页中面积单位使用 `t('property.sqft')`，但详情页使用硬编码 `m²`
- `PropertyListCard` 中 "BA"（卫生间）是硬编码英文
- 翻译文件中缺少 `bathroomsShort` 和 `areaUnit` 键

**修复内容：**
1. 统一面积单位显示为 `t('property.areaUnit')` = "m²"
2. 统一卫生间单位显示为 `t('property.bathroomsShort')`
   - 中文："卫"
   - 英文："BA" 
   - 法文："SdB"
3. 更新三个翻译文件（zh.json, en.json, fr.json）
   - 添加 `property.bathroomsShort`
   - 添加 `property.areaUnit`

**修改文件：**
- `/src/app/properties/page.tsx`
- `/src/app/properties/[id]/PropertyDetailClient.tsx`
- `/messages/zh.json`
- `/messages/en.json`
- `/messages/fr.json`

### 2. 付款流程补全 ✅

**问题发现：**
- 缺少 Cloudflare Pages Functions 的支付 API 路由
- 数据库 schema 缺少 payments 表和 stripe_payment_intent_id 字段
- 支付流程：选择日期 → 填写信息 → 创建预订 → 创建 Payment Intent → Stripe 支付 → 成功/失败页面

**修复内容：**
1. 创建支付 API 路由 `/functions/api/payments/create-intent.js`
   - 创建 Stripe Payment Intent
   - 更新预订状态为 PROCESSING
   - 创建支付记录

2. 创建 Webhook 处理 `/functions/api/payments/webhook.js`
   - 处理 `payment_intent.succeeded` 事件
   - 处理 `payment_intent.payment_failed` 事件
   - 处理 `charge.refunded` 事件
   - 发送支付确认邮件

3. 更新数据库 schema `/functions/api/schema.sql`
   - 添加 `stripe_payment_intent_id` 字段到 bookings 表
   - 创建 payments 表
   - 添加相关索引

**支付流程完整链路：**
1. 用户选择日期和客人 → `/booking/[propertyId]`
2. 确认客人信息 → 点击"Confirm & Pay"
3. 创建预订 → POST `/api/bookings/create`
4. 创建 Payment Intent → POST `/api/payments/create-intent`
5. Stripe 支付表单 → 输入信用卡信息
6. 支付成功 → `/payment/success`
7. 支付失败 → `/payment/cancel`

**修改文件：**
- `/functions/api/payments/create-intent.js` (新建)
- `/functions/api/payments/webhook.js` (新建)
- `/functions/api/schema.sql`

### 3. 首页日历组件 ✅

**状态：** 无需修复

**分析结果：**
- 首页 (`/components/home/index.tsx`) 使用 `DateRangePicker`
- 房源详情页 (`/app/properties/[id]/PropertyDetailClient.tsx`) 使用 `DateRangePicker`
- 两者使用同一组件，样式和交互已经统一

**组件特性：**
- Airbnb 风格双月日历视图
- 支持选择入住/退房日期
- 支持月租优惠提示
- 支持多语言（中/英/法）
- 响应式设计（移动端单月视图）

## 构建状态
✅ 构建成功，无错误

```
✓ Generating static pages (46/46)
⚠ 仅有 ESLint 警告（img 标签、hook 依赖等），无功能错误
```

## 部署注意事项

### Stripe 配置
需要在 Cloudflare Dashboard 设置以下 Secrets：
```
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### 数据库迁移
需要执行 schema.sql 中的更新：
```sql
-- 添加 stripe_payment_intent_id 列到现有 bookings 表
ALTER TABLE bookings ADD COLUMN stripe_payment_intent_id TEXT;

-- 创建 payments 表
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'CAD',
    stripe_payment_intent_id TEXT,
    payment_method TEXT DEFAULT 'CREDIT_CARD',
    status TEXT DEFAULT 'PENDING',
    metadata TEXT,
    error_message TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_id ON bookings(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_id ON payments(stripe_payment_intent_id);
```

### Webhook 配置
在 Stripe Dashboard 配置 Webhook Endpoint：
- URL: `https://stayneos.com/api/payments/webhook`
- Events: 
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `charge.refunded`

## 测试建议

1. **文字显示测试**
   - 切换语言（中/英/法）
   - 检查房源列表和详情页面积单位显示
   - 检查卫生间单位显示

2. **支付流程测试**
   - 使用 Stripe 测试卡号：4242 4242 4242 4242
   - 测试完整预订流程
   - 检查支付成功/失败页面
   - 检查邮件通知

3. **日历功能测试**
   - 检查日期选择功能
   - 验证月租优惠显示
   - 移动端响应式测试
