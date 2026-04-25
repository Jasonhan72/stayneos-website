// src/lib/auth/admin.ts
// Admin权限验证工具

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { UserRole } from '@prisma/client';

export interface AdminPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * 验证Admin权限
 * 返回当前admin用户信息或null
 */
export async function verifyAdmin(): Promise<AdminPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('stayneos_auth_token')?.value || 
                  cookieStore.get('auth-token')?.value;
    
    if (!token) return null;

    const payload = await verifyToken(token) as unknown as AdminPayload | null;
    if (!payload) return null;
    
    // 验证是否为admin角色
    const adminRoles: UserRole[] = [UserRole.ADMIN, UserRole.SUPER_ADMIN];
    if (!adminRoles.includes(payload.role)) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

/**
 * 验证Admin权限并返回401响应
 * 在API路由中使用
 */
export async function requireAdmin(): Promise<{ 
  success: true; 
  user: AdminPayload;
} | { 
  success: false; 
  response: Response;
}> {
  const admin = await verifyAdmin();
  
  if (!admin) {
    return {
      success: false,
      response: new Response(
        JSON.stringify({ error: 'Unauthorized', message: '需要管理员权限' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }
  
  return { success: true, user: admin };
}

/**
 * 获取当前用户（不限于admin）
 */
export async function getCurrentUser(): Promise<AdminPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('stayneos_auth_token')?.value || 
                  cookieStore.get('auth-token')?.value;
    
    if (!token) return null;

    return await verifyToken(token) as unknown as AdminPayload | null;
  } catch {
    return null;
  }
}
