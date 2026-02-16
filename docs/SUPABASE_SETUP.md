# Supabase 配置指南

## 1. 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project"
3. 填写项目名称和密码
4. 选择区域 (建议: North America - East)
5. 等待项目创建完成

## 2. 获取连接信息

在项目设置中找到以下信息:

- **Project URL**: `https://[project-ref].supabase.co`
- **Anon Key**: 用于客户端
- **Service Role Key**: 用于服务器端 (保密!)

## 3. 配置环境变量

更新 `.env` 文件:

```bash
# 数据库连接
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE-ROLE-KEY]"
```

## 4. 配置 Row Level Security (RLS)

在 Supabase Dashboard 中执行以下 SQL:

```sql
-- 启用所有表的 RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CleaningTask" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的数据
CREATE POLICY "Users can view own data" ON "User"
  FOR SELECT USING (auth.uid() = id);

-- 预订数据策略
CREATE POLICY "Users can view own bookings" ON "Booking"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings" ON "Booking"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 管理员可以查看所有数据
CREATE POLICY "Admins can view all bookings" ON "Booking"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "User" WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );
```

## 5. 执行数据库迁移

```bash
# 生成 Prisma 客户端
npx prisma generate

# 执行迁移
npx prisma migrate dev --name init

# 或推送到数据库
npx prisma db push
```

## 6. 验证连接

```bash
# 测试数据库连接
npx prisma db pull
```

## 7. 设置 Webhook (可选)

用于预订状态变更通知:

1. 在 Supabase Dashboard -> Database -> Webhooks
2. 创建新 Webhook
3. 配置触发条件: Booking 表, UPDATE 事件
4. 设置目标 URL: `https://your-domain.com/api/webhooks/booking`

## 常见问题

### 连接超时
- 检查防火墙设置
- 确认使用正确的连接字符串格式

### 权限错误
- 验证 Service Role Key 是否正确
- 检查 RLS 策略配置

### 迁移失败
- 确保数据库为空或已有 schema 与 prisma schema 兼容
- 使用 `npx prisma migrate reset` 重置 (会清空数据)
