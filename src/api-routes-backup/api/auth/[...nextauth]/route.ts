// src/app/api/auth/[...nextauth]/route.ts
// NextAuth.js 认证路由配置
// 支持: POST /api/auth/signin, POST /api/auth/signout, GET /api/auth/session 等

import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/utils/logger';

// 扩展 NextAuth 类型
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      image?: string | null;
    };
  }
  
  interface User {
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}

const handler = NextAuth({
  // 使用 Prisma 作为数据适配器
  adapter: PrismaAdapter(prisma) as never,
  
  // 配置认证提供者
  providers: [
    // 邮箱密码登录
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: '邮箱', type: 'email' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
          
          // 查找用户
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          
          if (!user) {
            logger.warn('登录失败：用户不存在', { email: credentials.email });
            return null;
          }
          
          // 验证密码
          if (!user.password) {
            logger.warn('登录失败：用户未设置密码', { email: credentials.email });
            return null;
          }
          const isValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isValid) {
            logger.warn('登录失败：密码错误', { email: credentials.email });
            return null;
          }
          
          logger.info('用户登录成功', { userId: user.id, email: user.email });
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.avatar,
          };
        } catch (error) {
          logger.error('登录授权失败', error as Error);
          return null;
        }
      },
    }),
  ],
  
  // 会话配置
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30天
    updateAge: 24 * 60 * 60, // 24小时更新一次
  },
  
  // JWT 配置
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30天
  },
  
  // 回调函数
  callbacks: {
    // JWT 回调 - 在创建/更新 JWT 时调用
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    
    // Session 回调 - 在获取 session 时调用
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  
  // 页面配置
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
    newUser: '/register',
  },
  
  // 事件监听
  events: {
    async signIn({ user, isNewUser }) {
      logger.info('用户登录事件', { 
        userId: user.id, 
        email: user.email,
        isNewUser,
      });
    },
    async signOut({ token }) {
      logger.info('用户登出事件', { userId: token?.id });
    },
  },
  
  // 调试配置
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };
