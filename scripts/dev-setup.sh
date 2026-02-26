#!/bin/bash

# StayNeos 开发环境一键启动脚本
# 用途: 快速启动完整的开发环境
# 用法: ./scripts/dev-setup.sh

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 打印带颜色的信息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo "🚀 StayNeos 开发环境启动脚本"
echo "=============================="
echo ""

# 检查必要工具
echo "🔍 检查必要工具..."

if ! command_exists node; then
    print_error "Node.js 未安装"
    echo "请访问 https://nodejs.org/ 安装 Node.js 20+"
    exit 1
fi

if ! command_exists npm; then
    print_error "npm 未安装"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_warning "Node.js 版本过低 (需要 20+)，当前: $(node --version)"
fi

print_success "Node.js: $(node --version)"
print_success "npm: $(npm --version)"

# 检查 Supabase CLI
if ! command_exists supabase; then
    print_warning "Supabase CLI 未安装"
    echo "正在安装 Supabase CLI..."
    npm install -g supabase
fi
print_success "Supabase CLI: $(supabase --version)"

# 检查 .env 文件
if [ ! -f .env ]; then
    print_warning ".env 文件不存在"
    if [ -f .env.example ]; then
        print_info "从 .env.example 创建 .env..."
        cp .env.example .env
        print_warning "请编辑 .env 文件配置您的数据库连接"
    else
        print_error ".env.example 也不存在"
        exit 1
    fi
fi

# 安装依赖
echo ""
print_info "步骤 1/5: 安装 npm 依赖..."
if [ -d "node_modules" ]; then
    print_info "node_modules 已存在，跳过安装"
else
    npm ci --legacy-peer-deps
    print_success "依赖安装完成"
fi

# 启动 Supabase
echo ""
print_info "步骤 2/5: 启动 Supabase 本地服务..."
if supabase status >/dev/null 2>&1; then
    print_success "Supabase 已经在运行"
else
    print_info "正在启动 Supabase..."
    supabase start
    print_success "Supabase 启动完成"
fi

# 显示 Supabase 状态
print_info "Supabase 状态:"
supabase status 2>/dev/null | grep -E "(API URL|DB URL|Studio URL)" || true

# 生成 Prisma 客户端
echo ""
print_info "步骤 3/5: 生成 Prisma 客户端..."
npx prisma generate
print_success "Prisma 客户端生成完成"

# 执行数据库迁移
echo ""
print_info "步骤 4/5: 执行数据库迁移..."
if [ -f "scripts/migrate-host.sh" ]; then
    chmod +x scripts/migrate-host.sh
    ./scripts/migrate-host.sh dev
else
    print_warning "migrate-host.sh 不存在，使用默认迁移..."
    npx prisma migrate dev --name init
fi
print_success "数据库迁移完成"

# 启动开发服务器
echo ""
print_info "步骤 5/5: 启动 Next.js 开发服务器..."
echo ""
print_success "🎉 开发环境准备就绪！"
echo ""
echo "=============================="
echo "📱 应用访问地址:"
echo "  - 本地:    http://localhost:3000"
echo "  - 网络:    http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "🗄️  数据库:"
echo "  - Prisma Studio: npx prisma studio"
echo "  - Supabase Studio: http://127.0.0.1:54323"
echo ""
echo "📧 系统账户:"
echo "  - 邮箱: hello.stayneos@gmail.com"
echo "  - 密码: (见种子数据脚本或环境变量)"
echo ""
echo "⌨️  常用命令:"
echo "  - 停止 Supabase: supabase stop"
echo "  - 查看日志: supabase logs"
echo "  - 重置数据库: npx prisma migrate reset"
echo "=============================="
echo ""

# 启动 Next.js 开发服务器
print_info "正在启动 Next.js 开发服务器..."
npm run dev
