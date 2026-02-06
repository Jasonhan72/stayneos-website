// src/app/api/health/route.ts
// GET /api/health - 健康检查端点
// 用于监控系统和服务状态

import { NextResponse } from 'next/server';
import { prisma, testConnection } from '@/lib/db/prisma';
import { logger } from '@/lib/utils/logger';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: {
      status: 'connected' | 'disconnected';
      responseTime?: number;
    };
    api: {
      status: 'operational' | 'degraded';
    };
  };
  system: {
    nodeVersion: string;
    platform: string;
    uptime: number;
  };
}

export async function GET() {
  const startTime = Date.now();
  
  // 检查数据库连接
  const dbStartTime = Date.now();
  const isDbConnected = await testConnection().catch(() => false);
  const dbResponseTime = Date.now() - dbStartTime;
  
  // 构建健康状态
  const health: HealthStatus = {
    status: isDbConnected ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    services: {
      database: {
        status: isDbConnected ? 'connected' : 'disconnected',
        responseTime: dbResponseTime,
      },
      api: {
        status: 'operational',
      },
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
    },
  };
  
  // 如果数据库断开，记录错误日志
  if (!isDbConnected) {
    logger.error('健康检查：数据库连接失败');
  }
  
  // 关闭测试连接（如果之前打开了）
  if (isDbConnected) {
    await prisma.$disconnect().catch(() => {
      // 忽略断开连接错误
    });
  }
  
  const totalTime = Date.now() - startTime;
  
  return NextResponse.json(health, {
    status: isDbConnected ? 200 : 503,
    headers: {
      'X-Response-Time': `${totalTime}ms`,
    },
  });
}
