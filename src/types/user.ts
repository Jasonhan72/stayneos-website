/**
 * 用户类型定义
 */

import { UserRole } from '@prisma/client';

// 用户信息
export interface User {
  id: string;
  email: string;
  emailVerified?: string;
  name?: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// 用户资料
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
}

// 登录请求
export interface LoginRequest {
  email: string;
  password: string;
}

// 注册请求
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

// 认证响应
export interface AuthResponse {
  user: User;
  token?: string;
}

// 会话信息
export interface Session {
  user: User;
  expires: string;
}
