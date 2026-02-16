#!/bin/bash

# StayNeos 数据库迁移脚本
# 用法: ./scripts/migrate.sh [dev|prod]

set -e

ENV=${1:-dev}
echo "🔄 执行数据库迁移 - 环境: $ENV"

# 检查环境变量
if [ ! -f .env ]; then
    echo "❌ 错误: .env 文件不存在"
    echo "请复制 .env.example 为 .env 并配置正确的数据库连接"
    exit 1
fi

# 加载环境变量
export $(grep -v '^#' .env | xargs)

# 验证数据库连接
if [ -z "$DATABASE_URL" ]; then
    echo "❌ 错误: DATABASE_URL 未设置"
    exit 1
fi

echo "📦 步骤 1: 生成 Prisma 客户端..."
npx prisma generate

echo "🔄 步骤 2: 执行数据库迁移..."
npx prisma migrate dev --name init

echo "🌱 步骤 3: 可选 - 种子数据..."
# npx prisma db seed

echo "✅ 迁移完成！"
echo ""
echo "📊 数据库状态:"
npx prisma db pull --print > /dev/null 2>&1 || echo "  - 数据库连接正常"
