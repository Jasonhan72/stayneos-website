#!/bin/bash
# ===========================================
# 开发环境检查脚本
# 检查 Day 1 任务完成情况
# ===========================================

echo "🔍 StayNeos 开发环境检查"
echo "==========================================="
echo ""

# 检查 Node.js
echo "📦 Node.js 版本:"
node --version || echo "❌ Node.js 未安装"
echo ""

# 检查 npm
echo "📦 npm 版本:"
npm --version || echo "❌ npm 未安装"
echo ""

# 检查 Supabase CLI
echo "📦 Supabase CLI 版本:"
npx supabase --version || echo "❌ Supabase CLI 未安装 (运行: npm install -g supabase)"
echo ""

# 检查环境变量文件
echo "📄 环境变量文件:"
if [ -f .env.local ]; then
    echo "✅ .env.local 存在"
else
    echo "⚠️  .env.local 不存在 (已创建模板，请复制并填写)"
fi

if [ -f .env ]; then
    echo "✅ .env 存在"
else
    echo "⚠️  .env 不存在 (如需生产环境配置)"
fi
echo ""

# 检查 Prisma Schema
echo "📄 Prisma Schema:"
if [ -f prisma/schema.prisma ]; then
    echo "✅ prisma/schema.prisma 存在"
    # 统计模型数量
    MODEL_COUNT=$(grep -c "^model " prisma/schema.prisma || echo "0")
    echo "   定义了 $MODEL_COUNT 个模型"
else
    echo "❌ prisma/schema.prisma 不存在"
fi
echo ""

# 检查 API 路由
echo "📄 API 路由:"
API_ROUTES=(
    "src/app/api/availability/route.ts"
    "src/app/api/bookings/route.ts"
    "src/app/api/bookings/[id]/route.ts"
    "src/app/api/cleaning-tasks/route.ts"
    "src/app/api/cleaning-tasks/[id]/route.ts"
)

for route in "${API_ROUTES[@]}"; do
    if [ -f "$route" ]; then
        echo "✅ $route"
    else
        echo "❌ $route 缺失"
    fi
done
echo ""

# 检查 Supabase 配置
echo "📄 Supabase 配置:"
if [ -d supabase ]; then
    echo "✅ supabase/ 目录存在"
    if [ -f supabase/config.toml ]; then
        echo "✅ supabase/config.toml 存在"
        PROJECT_ID=$(grep "project_id" supabase/config.toml | cut -d'"' -f2)
        echo "   项目 ID: $PROJECT_ID"
    fi
    if [ -f supabase/rls-policies.sql ]; then
        echo "✅ supabase/rls-policies.sql 存在"
    fi
else
    echo "⚠️  supabase/ 目录不存在 (运行: npx supabase init)"
fi
echo ""

# 检查文档
echo "📄 文档文件:"
DOCS=(
    "docs/API.md"
    "docs/SUPABASE_SETUP.md"
    "docs/BACKEND_SETUP_REPORT.md"
)
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo "✅ $doc"
    else
        echo "⚠️  $doc 不存在"
    fi
done
echo ""

# 尝试生成 Prisma 客户端
echo "🔧 Prisma 客户端状态:"
if [ -d node_modules/@prisma/client ]; then
    echo "✅ Prisma Client 已生成"
else
    echo "⚠️  Prisma Client 未生成 (运行: npm run db:generate)"
fi
echo ""

echo "==========================================="
echo "📋 下一步操作:"
echo "==========================================="
echo ""
echo "1. 创建 Supabase 项目:"
echo "   npx supabase projects create neos-booking --region us-east-1"
echo ""
echo "2. 配置环境变量 (.env.local):"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - DATABASE_URL"
echo ""
echo "3. 执行数据库迁移:"
echo "   npm run db:migrate"
echo ""
echo "4. 配置 RLS 策略 (在 Supabase Dashboard SQL Editor 执行):"
echo "   supabase/rls-policies.sql"
echo ""
echo "5. 启动开发服务器:"
echo "   npm run dev"
echo ""
