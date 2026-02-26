#!/bin/bash

# StayNeos Host 数据库迁移脚本
# 用途: 执行Prisma迁移并初始化Host相关数据
# 用法: ./scripts/migrate-host.sh [dev|prod|staging]

set -e

ENV=${1:-dev}
echo "🏠 StayNeos Host Migration Script"
echo "================================="
echo "🔄 环境: $ENV"
echo ""

# 检查.env文件
if [ ! -f .env ]; then
    echo "❌ 错误: .env 文件不存在"
    echo "请复制 .env.example 为 .env 并配置正确的环境变量"
    exit 1
fi

# 加载环境变量
export $(grep -v '^#' .env | xargs)

# 验证必要的环境变量
echo "🔍 检查环境变量..."

if [ -z "$DATABASE_URL" ]; then
    echo "❌ 错误: DATABASE_URL 未设置"
    exit 1
fi
echo "  ✅ DATABASE_URL 已配置"

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "⚠️ 警告: NEXTAUTH_SECRET 未设置 (建议设置以增强安全性)"
fi

echo ""
echo "📦 步骤 1/4: 生成 Prisma 客户端..."
npx prisma generate

echo ""
echo "🔄 步骤 2/4: 执行数据库迁移 (prisma migrate dev)..."
if [ "$ENV" = "prod" ] || [ "$ENV" = "production" ]; then
    echo "  🚀 生产环境: 执行 deploy 迁移..."
    npx prisma migrate deploy
else
    echo "  🛠️ 开发环境: 执行 dev 迁移..."
    npx prisma migrate dev --name "host_migration_$(date +%Y%m%d_%H%M%S)"
fi

echo ""
echo "📤 步骤 3/4: 推送数据库架构 (prisma db push)..."
npx prisma db push

echo ""
echo "🌱 步骤 4/4: 运行种子数据脚本..."
if [ -f "scripts/seed-host.ts" ]; then
    echo "  执行 Host 种子数据..."
    npx ts-node scripts/seed-host.ts
else
    echo "  ⚠️ 种子脚本不存在，跳过..."
fi

echo ""
echo "✅ Host 迁移完成！"
echo ""
echo "📊 数据库状态:"
echo "  - Hosts 表: $(npx prisma db execute --stdin <<<'SELECT COUNT(*) FROM hosts;' 2>/dev/null || echo 'N/A')"
echo "  - Users 表: $(npx prisma db execute --stdin <<<'SELECT COUNT(*) FROM users;' 2>/dev/null || echo 'N/A')"
echo ""
echo "🔧 后续步骤:"
echo "  1. 验证数据库连接: npx prisma studio"
echo "  2. 检查 Host 数据: 登录系统查看"
echo "  3. 如需重置: npx prisma migrate reset"
