// src/lib/db/prisma.ts
// Prisma Client Singleton - 数据库连接配置
// 确保在开发环境中使用单例模式，避免热重载时创建多个连接

import { PrismaClient } from '@prisma/client';

// PrismaClient 类型声明，用于全局缓存
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// 创建 Prisma 客户端实例
// 在生产环境直接创建，在开发环境使用全局缓存
export const prisma = globalThis.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

// 开发环境下将实例缓存到 globalThis
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// 连接测试函数
export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// 优雅关闭连接
export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect();
  console.log('👋 Database disconnected');
}

export default prisma;
