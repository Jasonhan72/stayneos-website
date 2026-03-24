// src/lib/db/prisma.ts
// Prisma Client Singleton - 数据库连接配置

import { PrismaClient } from '@prisma/client';

const isDev = process.env.NODE_ENV !== 'production';
const debugLog = (...args: unknown[]) => {
  if (isDev) {
    console.log(...args);
  }
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    debugLog('✅ Database connected successfully');
    return true;
  } catch (error) {
    if (isDev) {
      console.error('❌ Database connection failed:', error);
    }
    return false;
  }
}

export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect();
  debugLog('👋 Database disconnected');
}

export default prisma;
