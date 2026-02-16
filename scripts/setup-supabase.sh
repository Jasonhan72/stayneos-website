#!/bin/bash
# ===========================================
# Supabase 项目创建和配置脚本
# 项目名: neos-booking
# 地区: us-east-1 (North Virginia)
# ===========================================

set -e

echo "🏗️  StayNeos Supabase 项目配置脚本"
echo "==========================================="
echo ""

# 检查 Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI 未安装"
    echo "安装命令: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI 已安装"
echo ""

# 步骤 1: 登录 Supabase
echo "📋 步骤 1: 登录 Supabase"
echo "-------------------------------------------"
echo "如果未登录，请运行:"
echo "  npx supabase login"
echo ""

# 步骤 2: 创建项目
echo "📋 步骤 2: 创建项目 'neos-booking'"
echo "-------------------------------------------"
echo "由于需要交互式输入密码，请手动执行以下命令:"
echo ""
echo "  npx supabase projects create neos-booking --region us-east-1 --org-id YOUR_ORG_ID"
echo ""
echo "或使用 Supabase Dashboard:"
echo "  https://supabase.com/dashboard"
echo ""

# 步骤 3: 获取连接信息
echo "📋 步骤 3: 获取连接信息"
echo "-------------------------------------------"
echo "项目创建后，在 Dashboard 中获取以下信息:"
echo ""
echo "  1. Project Settings → General → Reference ID"
echo "  2. Project Settings → API → Project URL"
echo "  3. Project Settings → API → anon/public"
echo "  4. Project Settings → API → service_role/secret"
echo "  5. Project Settings → Database → Connection string"
echo ""

# 步骤 4: 更新环境变量
echo "📋 步骤 4: 更新环境变量"
echo "-------------------------------------------"
echo "将获取的信息填入 .env 文件:"
echo ""
cat <<'EOF'
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE-ROLE-KEY]"
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
EOF
echo ""

# 步骤 5: 执行迁移
echo "📋 步骤 5: 执行数据库迁移"
echo "-------------------------------------------"
echo "环境变量配置完成后，执行:"
echo ""
echo "  npm run db:migrate"
echo ""
echo "或:"
echo ""
echo "  npx prisma migrate dev --name init"
echo ""

# 步骤 6: 配置 RLS
echo "📋 步骤 6: 配置 Row Level Security"
echo "-------------------------------------------"
echo "在 Supabase Dashboard 中执行 SQL Editor 中的 SQL:"
echo "  文件位置: supabase/rls-policies.sql"
echo ""

echo "==========================================="
echo "📖 详细说明请参考: docs/SUPABASE_SETUP.md"
echo "==========================================="
