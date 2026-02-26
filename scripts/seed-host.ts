#!/usr/bin/env ts-node

/**
 * StayNeos Host 种子数据脚本
 * 用途: 创建系统Host账户和初始数据
 * 运行: npx ts-node scripts/seed-host.ts
 */

import { PrismaClient, UserRole, HostStatus, HostLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 系统Host配置
const SYSTEM_HOST_EMAIL = 'hello.stayneos@gmail.com';
const SYSTEM_HOST_NAME = 'StayNeos Official';
const SYSTEM_HOST_PASSWORD = process.env.SYSTEM_HOST_PASSWORD || 'StayNeos2025!';

async function main() {
  console.log('🌱 Starting Host seed data...');
  console.log('================================');

  try {
    // 1. 创建系统管理员用户（如果不存在）
    console.log('\n👤 步骤 1: 创建/更新系统Host用户...');
    
    const hashedPassword = await bcrypt.hash(SYSTEM_HOST_PASSWORD, 10);
    
    const systemUser = await prisma.user.upsert({
      where: { email: SYSTEM_HOST_EMAIL },
      update: {
        role: UserRole.HOST,
        name: SYSTEM_HOST_NAME,
      },
      create: {
        email: SYSTEM_HOST_EMAIL,
        name: SYSTEM_HOST_NAME,
        password: hashedPassword,
        role: UserRole.HOST,
        emailVerified: new Date(),
      },
    });
    
    console.log(`  ✅ 系统用户: ${systemUser.email} (ID: ${systemUser.id})`);

    // 2. 创建系统Host账户
    console.log('\n🏠 步骤 2: 创建系统Host账户...');
    
    const systemHost = await prisma.host.upsert({
      where: { userId: systemUser.id },
      update: {
        displayName: 'StayNeos Official Host',
        status: HostStatus.ACTIVE,
        hostLevel: HostLevel.SUPERHOST,
        isVerified: true,
        verificationDate: new Date(),
        businessEmail: SYSTEM_HOST_EMAIL,
        businessPhone: '+1-800-STAYNEOS',
        timezone: 'America/Toronto',
        preferredLanguages: ['en', 'zh', 'fr'],
      },
      create: {
        userId: systemUser.id,
        displayName: 'StayNeos Official Host',
        tagline: 'Your trusted partner for premium stays in Canada',
        bio: 'StayNeos is a leading property management company specializing in mid-to-long term furnished rentals across Canada. We provide high-quality accommodations for business travelers, relocating families, and digital nomads.',
        status: HostStatus.ACTIVE,
        hostLevel: HostLevel.SUPERHOST,
        isVerified: true,
        verificationDate: new Date(),
        businessEmail: SYSTEM_HOST_EMAIL,
        businessPhone: '+1-800-STAYNEOS',
        timezone: 'America/Toronto',
        preferredLanguages: ['en', 'zh', 'fr'],
      },
    });
    
    console.log(`  ✅ 系统Host: ${systemHost.displayName} (ID: ${systemHost.id})`);

    // 3. 创建示例房产（可选，仅在开发环境）
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n🏢 步骤 3: 创建示例房产 (开发环境)...');
      
      const sampleProperty = await prisma.property.upsert({
        where: { slug: 'sample-downtown-toronto-condo' },
        update: {},
        create: {
          title: 'Sample Downtown Toronto Condo',
          slug: 'sample-downtown-toronto-condo',
          description: 'A beautiful sample property showcasing StayNeos listing capabilities. This modern condo features stunning city views and premium amenities.',
          shortDesc: 'Modern downtown condo with city views',
          address: '123 Bay Street',
          city: 'Toronto',
          neighborhood: 'Financial District',
          state: 'Ontario',
          country: 'Canada',
          postalCode: 'M5H 2Y4',
          latitude: 43.6532,
          longitude: -79.3832,
          propertyType: 'CONDO',
          bedrooms: 2,
          bathrooms: 2,
          maxGuests: 4,
          area: 85,
          floor: 25,
          basePrice: 3500.00,
          currency: 'CAD',
          cleaningFee: 150.00,
          serviceFee: 100.00,
          monthlyDiscount: 10.00,
          weeklyDiscount: 5.00,
          minNights: 28,
          status: 'DRAFT',
          isFeatured: false,
          isInstantBook: true,
        },
      });
      
      console.log(`  ✅ 示例房产: ${sampleProperty.title}`);
    }

    // 4. 输出总结
    console.log('\n================================');
    console.log('✅ Host 种子数据创建完成！');
    console.log('================================');
    console.log('\n📋 系统账户信息:');
    console.log(`  邮箱: ${SYSTEM_HOST_EMAIL}`);
    console.log(`  角色: ${UserRole.HOST}`);
    console.log(`  Host状态: ${HostStatus.ACTIVE}`);
    console.log(`  Host等级: ${HostLevel.SUPERHOST}`);
    console.log('\n🔐 登录凭据:');
    console.log(`  邮箱: ${SYSTEM_HOST_EMAIL}`);
    console.log(`  密码: ${SYSTEM_HOST_PASSWORD === 'StayNeos2025!' ? SYSTEM_HOST_PASSWORD + ' (默认密码，请修改)' : '[已自定义]'} `);
    console.log('\n⚠️  安全提示:');
    console.log('  - 请在生产环境修改默认密码');
    console.log('  - 可通过环境变量 SYSTEM_HOST_PASSWORD 设置密码');
    console.log('  - 建议启用2FA认证');

  } catch (error) {
    console.error('\n❌ 种子数据创建失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行主函数
main();
