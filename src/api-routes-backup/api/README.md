# StayNeos v2.0 后端 API 文档

## 技术栈

- **框架**: Next.js 14 (App Router)
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **认证**: NextAuth.js
- **验证**: Zod
- **语言**: TypeScript

## 项目结构

```
src/
├── app/api/              # API 路由
│   ├── auth/            # 认证相关
│   │   ├── [...nextauth]/route.ts  # NextAuth.js 配置
│   │   └── register/route.ts       # 用户注册
│   ├── bookings/        # 预订相关
│   │   └── route.ts     # 预订列表、创建预订
│   ├── health/          # 健康检查
│   │   └── route.ts
│   └── properties/      # 房源相关
│       ├── route.ts     # 房源列表
│       └── [id]/
│           └── route.ts # 房源详情
├── lib/
│   ├── db/              # 数据库配置
│   │   ├── index.ts
│   │   └── prisma.ts    # Prisma 客户端
│   ├── utils/           # 工具函数
│   │   ├── error-handler.ts  # 错误处理
│   │   ├── logger.ts         # 日志
│   │   └── index.ts
│   └── validation/      # 数据验证
│       ├── index.ts
│       └── schemas.ts   # Zod 验证模式
└── prisma/
    └── schema.prisma    # 数据库模型
```

## API 端点

### 认证

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/auth/signin` | 用户登录 |
| POST | `/api/auth/signout` | 用户登出 |
| POST | `/api/auth/register` | 用户注册 |
| GET | `/api/auth/session` | 获取当前会话 |

### 房源

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/properties` | 房源列表（支持筛选、分页） |
| GET | `/api/properties/:id` | 房源详情 |

### 预订

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/bookings` | 预订列表 |
| POST | `/api/bookings` | 创建预订 |

### 系统

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/health` | 健康检查 |

## 响应格式

### 成功响应

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "数据验证失败",
    "details": {
      "email": "请输入有效的邮箱地址"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 查询参数

### 房源列表 (`/api/properties`)

| 参数 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| page | number | 页码 | 1 |
| limit | number | 每页数量（1-50） | 12 |
| city | string | 城市筛选 | - |
| neighborhood | string | 街区筛选 | - |
| propertyType | string | 房源类型 | - |
| minPrice | number | 最低价格 | - |
| maxPrice | number | 最高价格 | - |
| bedrooms | number | 最少卧室数 | - |
| bathrooms | number | 最少卫生间数 | - |
| maxGuests | number | 最少容纳人数 | - |
| checkIn | date | 入住日期 | - |
| checkOut | date | 退房日期 | - |
| isFeatured | boolean | 特色房源 | - |
| sortBy | string | 排序字段 | createdAt |
| sortOrder | asc/desc | 排序方向 | desc |

## 数据库模型

### User（用户）
- 基础用户信息
- 支持 NextAuth.js 多认证方式
- 角色管理（GUEST, HOST, ADMIN, SUPER_ADMIN）

### Property（房源）
- 完整房源信息
- 位置、价格、设施
- 状态管理（DRAFT, PUBLISHED, etc.）

### Booking（预订）
- 预订全流程管理
- 价格明细计算
- 状态跟踪

### Review（评价）
- 多维度评分
- 评论内容
- 关联预订

## 安全特性

- 输入数据 Zod 验证
- 密码 bcrypt 加密
- SQL 注入防护（Prisma）
- 错误信息脱敏

## 日志记录

- API 请求日志
- 错误日志
- 数据库查询日志（开发环境）
- 用户行为日志

## 待办事项

- [ ] 集成真实支付接口
- [ ] 添加邮件通知服务
- [ ] 实现房源搜索（全文搜索）
- [ ] 添加缓存层（Redis）
- [ ] API 速率限制
- [ ] 图片上传服务
