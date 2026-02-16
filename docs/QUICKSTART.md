# StayNeos API 快速启动指南

## 🚀 5分钟快速启动

### 1. 创建 Supabase 项目
```bash
# 登录 Supabase
npx supabase login

# 创建项目 (地区: us-east-1)
npx supabase projects create neos-booking --region us-east-1 --org-id YOUR_ORG_ID
```

### 2. 配置环境变量
复制 `.env.local` 并填入实际值：
```bash
# 从 Supabase Dashboard 获取:
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE-ROLE-KEY]"
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# 生成随机密钥:
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
```

### 3. 数据库迁移
```bash
# 生成 Prisma 客户端
npm run db:generate

# 执行迁移
npm run db:migrate

# 或推送到数据库 (开发环境)
npm run db:push
```

### 4. 配置 RLS 策略
在 Supabase Dashboard → SQL Editor 执行：
```sql
-- 复制 supabase/rls-policies.sql 内容执行
```

### 5. 启动开发服务器
```bash
npm run dev
```

---

## 📚 可用脚本

```bash
# 环境检查
./scripts/check-env.sh

# API 测试
npx tsx scripts/test-api.ts

# 数据库管理
npm run db:generate    # 生成 Prisma 客户端
npm run db:migrate     # 执行迁移
npm run db:push        # 推送到数据库
npm run db:studio      # 打开 Prisma Studio
npm run db:reset       # 重置数据库
```

---

## 🔗 API 端点

### 公开端点
- `GET /api/availability?propertyId=&startDate=&endDate=`

### 需要认证
- `GET/POST /api/bookings`
- `GET/PATCH/DELETE /api/bookings/:id`
- `GET/POST /api/cleaning-tasks`
- `GET/PATCH/DELETE /api/cleaning-tasks/:id`

---

## 📖 文档

- [API 文档](docs/API.md)
- [Supabase 配置指南](docs/SUPABASE_SETUP.md)
- [Day 1 报告](docs/DAY1_REPORT.md)

---

## ⚠️ 常见问题

### Q: Docker 未运行？
A: 使用远程 Supabase 项目，不需要本地 Docker。

### Q: 如何获取 Supabase 连接信息？
A: 
1. 访问 https://supabase.com/dashboard
2. 选择项目 → Project Settings → API
3. 复制 URL 和 Keys

### Q: 迁移失败？
A: 确保 `DATABASE_URL` 格式正确：
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

---

## 🆘 需要帮助？

联系: Logic (后端工程师) / Nova (CTO)
