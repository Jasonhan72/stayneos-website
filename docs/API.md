# StayNeos API 文档

## 基础信息
- 基础URL: `/api`
- 响应格式: JSON
- 认证方式: JWT (NextAuth.js)

## 响应格式

### 成功响应
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "hasMore": true
  }
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": { ... }
  }
}
```

## API 端点

### 1. 房源可用性

#### GET /api/availability
查询房源可用性和价格

**参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| propertyId | string | 是 | 房源ID |
| startDate | string | 是 | 开始日期 (YYYY-MM-DD) |
| endDate | string | 是 | 结束日期 (YYYY-MM-DD) |

**响应:**
```json
{
  "property": { "id": "...", "title": "...", "currency": "CAD" },
  "availability": {
    "allAvailable": true,
    "nights": 30,
    "calendar": [
      { "date": "2024-03-01", "available": true, "price": 100, "isBlocked": false }
    ]
  },
  "pricing": {
    "basePrice": 3000,
    "cleaningFee": 150,
    "serviceFee": 100,
    "discount": 300,
    "totalPrice": 2950,
    "currency": "CAD"
  }
}
```

### 2. 预订管理

#### GET /api/bookings
获取当前用户的预订列表

**参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 状态过滤 |
| upcoming | boolean | 否 | 仅显示即将到来的预订 |
| page | number | 否 | 页码 (默认: 1) |
| limit | number | 否 | 每页数量 (默认: 10, 最大: 50) |

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "bookingNumber": "BK-20240301-001",
      "status": "CONFIRMED",
      "property": { ... },
      "dates": { "checkIn": "2024-03-01", "checkOut": "2024-04-01", "nights": 30 },
      "pricing": { ... }
    }
  ],
  "meta": { "total": 10, "page": 1, "limit": 10, "hasMore": false }
}
```

#### POST /api/bookings
创建新预订

**请求体:**
```json
{
  "propertyId": "...",
  "checkIn": "2024-03-01",
  "checkOut": "2024-04-01",
  "guests": 2,
  "guestName": "张三",
  "guestEmail": "zhangsan@example.com",
  "guestPhone": "+1-xxx-xxx-xxxx",
  "specialRequests": "需要高楼层"
}
```

**响应:** 创建成功的预订详情

#### GET /api/bookings/:id
获取预订详情

**响应:** 包含完整预订信息、支付记录、清洁任务等

#### PATCH /api/bookings/:id
更新预订

**请求体:**
```json
{
  "status": "CANCELLED",
  "specialRequests": "更新后的需求"
}
```

### 3. 清洁任务

#### GET /api/cleaning-tasks
获取清洁任务列表 (管理员/房东)

**参数:**
| 参数 | 类型 | 说明 |
|------|------|------|
| status | string | 状态过滤 |
| type | string | 类型过滤 |
| priority | string | 优先级过滤 |
| overdue | boolean | 仅显示逾期任务 |
| upcoming | boolean | 仅显示即将到来的任务 |

#### POST /api/cleaning-tasks
创建清洁任务

**请求体:**
```json
{
  "bookingId": "...",
  "type": "CHECKOUT_CLEANING",
  "scheduledAt": "2024-04-01T11:00:00Z",
  "priority": "NORMAL",
  "notes": "备注",
  "cleanerId": "...",
  "cleanerName": "清洁员姓名"
}
```

#### GET /api/cleaning-tasks/:id
获取清洁任务详情

#### PATCH /api/cleaning-tasks/:id
更新清洁任务

**请求体:**
```json
{
  "status": "COMPLETED",
  "completedAt": "2024-04-01T14:00:00Z",
  "checklist": { "bedroom": true, "bathroom": true },
  "afterPhotos": ["url1", "url2"]
}
```

## 错误代码

| 代码 | HTTP | 说明 |
|------|------|------|
| BAD_REQUEST | 400 | 请求参数错误 |
| UNAUTHORIZED | 401 | 未授权，请先登录 |
| FORBIDDEN | 403 | 禁止访问，权限不足 |
| NOT_FOUND | 404 | 资源不存在 |
| CONFLICT | 409 | 资源冲突 |
| VALIDATION_ERROR | 422 | 数据验证失败 |
| RATE_LIMIT | 429 | 请求过于频繁 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

## 性能指标

- API 响应时间目标: < 200ms
- 数据库查询优化: 使用 Prisma 的 `select` 和 `include` 精确控制数据加载
- 缓存策略: 可用性数据可缓存 5 分钟

## 安全说明

1. 所有修改操作需要认证
2. 用户只能访问自己的预订数据
3. 管理员可以访问所有数据
4. 使用 Row Level Security (RLS) 进行数据库级保护
