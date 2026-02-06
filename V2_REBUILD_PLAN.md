# 🚀 StayNeos v2.0 - Blueground 完整重构计划

## 项目目标
全面复制 Blueground 网站架构和后台系统，调整为方形 UI 风格。

## 架构总览

### 技术栈
```
Frontend: Next.js 14 + TypeScript + Tailwind CSS + React Query
Backend: Next.js API Routes + Prisma + PostgreSQL
Admin: Next.js Admin Dashboard
Storage: Cloudflare R2 (图片) / Local (开发)
Maps: Mapbox GL JS
Auth: NextAuth.js
Payment: Stripe (预留)
```

### 目录结构
```
stayneos-v2/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (site)/             # 前台网站
│   │   │   ├── page.tsx        # 首页
│   │   │   ├── properties/
│   │   │   ├── property/[id]/
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   └── layout.tsx
│   │   ├── (admin)/            # 后台管理
│   │   │   ├── dashboard/
│   │   │   ├── properties/
│   │   │   ├── bookings/
│   │   │   ├── users/
│   │   │   └── layout.tsx
│   │   ├── api/                # API Routes
│   │   │   ├── auth/
│   │   │   ├── properties/
│   │   │   ├── bookings/
│   │   │   └── users/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                 # 基础 UI 组件 (方形风格)
│   │   ├── property/           # 房源相关组件
│   │   ├── booking/            # 预订相关组件
│   │   ├── map/                # 地图组件
│   │   ├── admin/              # 后台组件
│   │   └── layout/             # 布局组件
│   ├── lib/
│   │   ├── db/                 # 数据库配置
│   │   ├── api/                # API 工具
│   │   ├── hooks/              # 自定义 Hooks
│   │   └── utils/              # 工具函数
│   ├── types/                  # TypeScript 类型
│   └── styles/
│       └── globals.css
├── prisma/
│   └── schema.prisma           # 数据库模型
├── public/
│   └── images/
└── docs/
    └── architecture.md
```

---

## UI 设计系统 (方形风格)

### 核心原则
- ❌ 去掉所有圆角
- ✅ 直角边框 (border-radius: 0)
- ✅ 方正布局
- ✅ 简洁线条

### 色彩系统
```css
:root {
  /* 主色 */
  --primary: #003B5C;        /* 深海蓝 */
  --primary-hover: #002A42;
  --primary-light: #E6F0F5;
  
  /* 强调色 */
  --accent: #C9A962;         /* 金色 */
  --accent-hover: #B8984F;
  
  /* 中性色 */
  --neutral-900: #0F172A;
  --neutral-800: #1E293B;
  --neutral-600: #475569;
  --neutral-400: #94A3B8;
  --neutral-200: #E2E8F0;
  --neutral-100: #F1F5F9;
  --neutral-50: #F8FAFC;
  
  /* 状态色 */
  --success: #059669;
  --warning: #D97706;
  --error: #DC2626;
  
  /* 边框 */
  --border: #E2E8F0;
  --border-dark: #CBD5E1;
}
```

### 间距系统 (方形网格)
```css
--space-0: 0;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

### 组件规范 (无圆角)

#### Button
```tsx
// 方形按钮，无圆角
<button className="
  px-6 py-3 
  bg-[#003B5C] 
  text-white 
  font-medium
  border-0
  hover:bg-[#002A42]
  transition-colors
  disabled:opacity-50
">
```

#### Card
```tsx
// 方形卡片
<div className="
  bg-white
  border border-[#E2E8F0]
  overflow-hidden
  hover:shadow-lg
  transition-shadow
">
  <div className="aspect-[4/3] overflow-hidden">
    <img className="w-full h-full object-cover" />
  </div>
  <div className="p-4">
    {/* Content */}
  </div>
</div>
```

#### Input
```tsx
// 方形输入框
<input className="
  w-full
  px-4 py-3
  border border-[#E2E8F0]
  focus:border-[#003B5C]
  focus:outline-none
  focus:ring-1
  focus:ring-[#003B5C]
" />
```

#### Image
```tsx
// 方形图片容器
<div className="aspect-square overflow-hidden">
  <img className="w-full h-full object-cover" />
</div>
```

---

## 数据库设计 (Prisma)

### 模型定义

```prisma
// 房源模型
model Property {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  description String   @db.Text
  location    String
  address     String
  city        String
  neighborhood String
  latitude    Float
  longitude   Float
  
  // 房型
  bedrooms    Int
  bathrooms   Int
  maxGuests   Int
  area        Int      // 平方米
  
  // 价格
  basePrice       Decimal  @db.Decimal(10, 2)
  cleaningFee     Decimal? @db.Decimal(10, 2)
  serviceFee      Decimal? @db.Decimal(10, 2)
  monthlyDiscount Decimal? @db.Decimal(4, 2) // 折扣百分比
  minNights       Int      @default(28)
  
  // 状态
  status      PropertyStatus @default(DRAFT)
  isFeatured  Boolean    @default(false)
  
  // 关系
  images      PropertyImage[]
  amenities   PropertyAmenity[]
  bookings    Booking[]
  reviews     Review[]
  
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

// 房源图片
model PropertyImage {
  id          String   @id @default(cuid())
  propertyId  String
  url         String
  alt         String?
  order       Int      @default(0)
  isPrimary   Boolean  @default(false)
  property    Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
}

// 设施
model Amenity {
  id          String   @id @default(cuid())
  name        String   @unique
  icon        String?
  category    AmenityCategory
  properties  PropertyAmenity[]
}

model PropertyAmenity {
  propertyId  String
  amenityId   String
  property    Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  amenity     Amenity  @relation(fields: [amenityId], references: [id], onDelete: Cascade)
  
  @@id([propertyId, amenityId])
}

// 预订
model Booking {
  id          String   @id @default(cuid())
  propertyId  String
  userId      String
  
  checkIn     DateTime
  checkOut    DateTime
  nights      Int
  guests      Int
  
  // 价格明细
  basePrice   Decimal  @db.Decimal(10, 2)
  cleaningFee Decimal? @db.Decimal(10, 2)
  serviceFee  Decimal? @db.Decimal(10, 2)
  discount    Decimal? @db.Decimal(10, 2)
  totalPrice  Decimal  @db.Decimal(10, 2)
  
  status      BookingStatus @default(PENDING)
  
  property    Property @relation(fields: [propertyId], references: [id])
  user        User     @relation(fields: [userId], references: [id])
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// 用户评价
model Review {
  id          String   @id @default(cuid())
  propertyId  String
  userId      String
  bookingId   String?  @unique
  
  rating      Int      // 1-5
  cleanliness Int?
  accuracy    Int?
  location    Int?
  communication Int?
  checkIn     Int?
  value       Int?
  comment     String   @db.Text
  
  property    Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id])
  
  createdAt   DateTime @default(now())
}

// 用户
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  phone         String?
  avatar        String?
  role          UserRole  @default(GUEST)
  
  bookings      Booking[]
  reviews       Review[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// 枚举
enum PropertyStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CHECKED_IN
  CHECKED_OUT
  CANCELLED
}

enum UserRole {
  GUEST
  HOST
  ADMIN
}

enum AmenityCategory {
  BASIC
  KITCHEN
  BATHROOM
  BEDROOM
  BUILDING
  SERVICES
}
```

---

## 前端页面结构

### 前台页面 (Site)

```tsx
// 1. 首页 (Blueground 风格)
/
├── HeroSection         // 全屏背景 + 搜索框
├── ValueProposition    // 四大价值支柱
├── MarketSegments      // 细分市场卡片
├── FeaturedProperties  // 精选房源
├── HowItWorks          // 流程说明
├── Testimonials        // 用户评价
├── TrustSignals        // 信任指标
├── LocationsMap        // 地图展示
└── CTASection          // 行动号召

// 2. 房源列表
/properties
├── SearchHeader        // 搜索栏
├── FilterSidebar       // 筛选面板
├── MapView            // 地图视图
├── PropertyGrid       // 房源网格
└── Pagination         // 分页

// 3. 房源详情
/property/[slug]
├── ImageGallery       // 大图画廊
├── PropertyHeader     // 标题信息
├── QuickInfo          // 快速信息
├── Description        // 详细描述
├── Amenities          // 设施列表
├── LocationMap        // 位置地图
├── Reviews            // 评价
├── HostInfo           // 房东信息
├── BookingCard        // 预订卡片 (Sticky)
└── SimilarProperties  // 相似房源

// 4. 其他页面
/about
/contact
/help
/terms
/privacy
```

### 后台页面 (Admin)

```tsx
// 管理后台
/admin
├── dashboard           // 数据概览
├── properties          // 房源管理
│   ├── list
│   ├── create
│   └── edit/[id]
├── bookings            // 预订管理
├── users               // 用户管理
├── reviews             // 评价管理
├── settings            // 系统设置
└── analytics           // 数据分析
```

---

## API 设计

### RESTful API 结构

```typescript
// 房源 API
GET    /api/properties          // 列表 (支持筛选、分页)
GET    /api/properties/[id]     // 详情
POST   /api/properties          // 创建 (Admin)
PUT    /api/properties/[id]     // 更新 (Admin)
DELETE /api/properties/[id]     // 删除 (Admin)

// 预订 API
GET    /api/bookings            // 我的预订
GET    /api/bookings/[id]       // 预订详情
POST   /api/bookings            // 创建预订
PUT    /api/bookings/[id]       // 更新预订
DELETE /api/bookings/[id]       // 取消预订

// 用户 API
GET    /api/user                // 当前用户
PUT    /api/user                // 更新用户
GET    /api/users               // 用户列表 (Admin)

// 评价 API
GET    /api/reviews             // 评价列表
POST   /api/reviews             // 创建评价
```

---

## 实施计划

### Phase 1: 基础架构 (Day 1-2)
- [ ] 创建项目结构
- [ ] 配置数据库 (Prisma + PostgreSQL)
- [ ] 设置认证 (NextAuth)
- [ ] 配置 Tailwind (方形风格)
- [ ] 创建基础 UI 组件库

### Phase 2: 前台页面 (Day 3-5)
- [ ] 首页重构
- [ ] 房源列表页
- [ ] 房源详情页
- [ ] 搜索功能
- [ ] 地图集成

### Phase 3: 后台系统 (Day 6-7)
- [ ] 管理后台框架
- [ ] 房源管理 CRUD
- [ ] 预订管理
- [ ] 用户管理
- [ ] 数据看板

### Phase 4: 功能完善 (Day 8-10)
- [ ] 预订流程
- [ ] 评价系统
- [ ] 图片上传
- [ ] SEO 优化
- [ ] 性能优化

### Phase 5: 测试部署 (Day 11-12)
- [ ] 功能测试
- [ ] 数据迁移
- [ ] 部署上线
- [ ] 监控配置

---

## 关键设计决策

### 1. 方形 UI 风格
- 所有组件 `border-radius: 0`
- 图片使用 `aspect-square` 或自定义比例
- 按钮、输入框、卡片均为直角

### 2. 响应式断点
```css
sm: 640px   /* 手机 */
md: 768px   /* 平板 */
lg: 1024px  /* 小桌面 */
xl: 1280px  /* 大桌面 */
2xl: 1536px /* 超大屏 */
```

### 3. 图片处理
- 使用 Next.js Image 组件
- 统一方形裁剪
- WebP 格式优先
- 懒加载

### 4. 状态管理
- React Query (服务端状态)
- React Context (全局状态)
- Local State (组件状态)

---

## 文件创建清单

### 立即创建的文件:
1. `tailwind.config.ts` - 方形主题配置
2. `prisma/schema.prisma` - 数据库模型
3. `src/components/ui/` - 基础 UI 组件
4. `src/app/(site)/` - 前台页面
5. `src/app/(admin)/` - 后台页面
6. `src/lib/db/` - 数据库工具
7. `src/types/` - TypeScript 类型

详细实施现在开始...
