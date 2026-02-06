// scripts/test-api.ts
// API 测试脚本
// 运行: npx ts-node scripts/test-api.ts

import { prisma, testConnection } from '../src/lib/db/prisma';

async function testAPIs() {
  console.log('🧪 开始 API 测试...\n');
  
  // 1. 测试数据库连接
  console.log('1️⃣ 测试数据库连接...');
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('❌ 数据库连接失败');
    process.exit(1);
  }
  console.log('✅ 数据库连接成功\n');
  
  // 2. 查询房源数量
  console.log('2️⃣ 查询房源数量...');
  const propertyCount = await prisma.property.count();
  console.log(`✅ 数据库中共有 ${propertyCount} 个房源\n`);
  
  // 3. 查询用户数量
  console.log('3️⃣ 查询用户数量...');
  const userCount = await prisma.user.count();
  console.log(`✅ 数据库中共有 ${userCount} 个用户\n`);
  
  // 4. 查询预订数量
  console.log('4️⃣ 查询预订数量...');
  const bookingCount = await prisma.booking.count();
  console.log(`✅ 数据库中共有 ${bookingCount} 个预订\n`);
  
  // 5. 测试房源查询
  if (propertyCount > 0) {
    console.log('5️⃣ 测试房源查询...');
    const property = await prisma.property.findFirst({
      include: {
        images: true,
        amenities: true,
      },
    });
    console.log(`✅ 查询到房源: ${property?.title}\n`);
  }
  
  // 断开连接
  await prisma.$disconnect();
  
  console.log('🎉 所有测试通过！');
}

testAPIs().catch((error) => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
