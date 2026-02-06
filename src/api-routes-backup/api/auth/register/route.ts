// src/app/api/auth/register/route.ts
// POST /api/auth/register - 用户注册

import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { registerSchema } from '@/lib/validation/schemas';
import { createSuccessResponse, handleError, Errors } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 解析请求体
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = registerSchema.parse(body);
    const { email, password, name, phone } = validatedData;
    
    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      throw Errors.CONFLICT('该邮箱已被注册');
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // 创建用户（包含密码）
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        phone: phone || null,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    
    // 记录日志
    const duration = Date.now() - startTime;
    logger.apiRequest('POST', '/api/auth/register', duration, 201);
    logger.info('新用户注册成功', { userId: user.id, email: user.email });
    
    return createSuccessResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      message: '注册成功，请登录',
    });
    
  } catch (error) {
    logger.error('用户注册失败', error as Error);
    return handleError(error);
  }
}
