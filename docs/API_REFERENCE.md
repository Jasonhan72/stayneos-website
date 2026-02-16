# NEOS Booking API - 快速参考

**版本**: v1.0  
**更新**: Feb 9, 2026  
**负责人**: Nova (CTO)

---

## 基础信息

**Base URL**: `https://stayneos.com/api`

**响应格式**:
```json
{
  "success": true,
  "data": { ... },
  "error": {          // 仅在失败时出现
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": { ... }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## API 列表

### 1. 可用性查询

**GET** `/api/availability`

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| propertyId | string | ✅ | 房源ID |
| checkIn | string | ✅ | 入住日期 (YYYY-MM-DD) |
| checkOut | string | ✅ | 退房日期 (YYYY-MM-DD) |
| guests | number | ❌ | 入住人数 |

**成功响应** (200):
```json
{
  "success": true,
  "available": true,
  "property": {
    "id": "cl...",
    "title": "豪华公寓",
    "basePrice": 8000,
    "currency": "CAD",
    "image": "https://..."
  },
  "dates": {
    "checkIn": "2024-03-01",
    "checkOut": "2024-03-31",
    "nights": 30
  },
  "pricing": {
    "nights": 30,
    "basePrice": 8000,
    "subtotal": 192000,
    "cleaningFee": 500,
    "serviceFee": 19200,
    "discount": 48000,
    "discountRate": 0.8,
    "discountPercentage": 20,
    "tax": 25076,
    "total": 193776,
    "isMonthly": true,
    "isWeekly": false
  }
}
```

**失败响应** (200, available: false):
```json
{
  "success": false,
  "available": false,
  "error": {
    "code": "DATES_UNAVAILABLE",
    "message": "所选日期已被预订"
  }
}
```

**错误码**:
- `PROPERTY_NOT_FOUND` - 房源不存在
- `PROPERTY_UNAVAILABLE` - 房源未发布
- `INVALID_DATE` - 日期格式错误或无效
- `MIN_NIGHTS_NOT_MET` - 未达到最低入住天数
- `MAX_GUESTS_EXCEEDED` - 超过最大入住人数
- `DATES_UNAVAILABLE` - 日期已被预订

---

### 2. 创建预订

**POST** `/api/bookings`

**请求体**:
```json
{
  "propertyId": "cl...",
  "checkIn": "2024-03-01",
  "checkOut": "2024-03-31",
  "guests": 2,
  "guestName": "张三",
  "guestEmail": "zhangsan@example.com",
  "guestPhone": "+86 138****8888",
  "specialRequests": "需要停车位"
}
```

**成功响应** (201):
```json
{
  "success": true,
  "booking": {
    "id": "cl...",
    "bookingNumber": "STY-...",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "totalPrice": 193776,
    "currency": "CAD",
    "dates": {
      "checkIn": "2024-03-01T00:00:00.000Z",
      "checkOut": "2024-03-31T00:00:00.000Z",
      "nights": 30
    },
    "property": {
      "id": "cl...",
      "title": "豪华公寓"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**错误码**:
- `UNAUTHORIZED` - 未登录
- `VALIDATION_ERROR` - 数据验证失败
- `PROPERTY_NOT_FOUND` - 房源不存在
- `DATES_UNAVAILABLE` - 日期已被预订

---

### 3. 预订详情

**GET** `/api/bookings/:id`

**成功响应** (200):
```json
{
  "success": true,
  "booking": {
    "id": "cl...",
    "bookingNumber": "STY-...",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "property": {
      "id": "cl...",
      "title": "豪华公寓",
      "address": "123 Main St",
      "city": "Toronto",
      "neighborhood": "Downtown",
      "image": "https://..."
    },
    "dates": {
      "checkIn": "2024-03-01T00:00:00.000Z",
      "checkOut": "2024-03-31T00:00:00.000Z",
      "nights": 30
    },
    "guests": 2,
    "guestInfo": {
      "name": "张三",
      "email": "zhangsan@example.com",
      "phone": "+86 138****8888"
    },
    "pricing": {
      "basePrice": 8000,
      "cleaningFee": 500,
      "serviceFee": 19200,
      "discount": 48000,
      "discountRate": 0.8,
      "tax": 25076,
      "total": 193776,
      "currency": "CAD",
      "paidAmount": 0,
      "remainingAmount": 193776
    },
    "specialRequests": "需要停车位",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 4. 预订列表

**GET** `/api/bookings`

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | ❌ | 筛选状态: all/upcoming/completed/active/PENDING/CONFIRMED/... |
| page | number | ❌ | 页码 (默认 1) |
| limit | number | ❌ | 每页数量 (默认 10) |

**成功响应** (200):
```json
{
  "success": true,
  "bookings": [
    {
      "id": "cl...",
      "bookingNumber": "STY-...",
      "status": "PENDING",
      "checkIn": "2024-03-01T00:00:00.000Z",
      "checkOut": "2024-03-31T00:00:00.000Z",
      "totalPrice": 193776,
      "currency": "CAD",
      "property": {
        "id": "cl...",
        "title": "豪华公寓",
        "city": "Toronto",
        "images": [{ "url": "https://..." }]
      },
      "paidAmount": 0,
      "review": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### 5. 取消预订

**PATCH** `/api/bookings/:id`

**请求体**:
```json
{
  "status": "CANCELLED",
  "cancelReason": "计划变更"
}
```

**成功响应** (200):
```json
{
  "success": true,
  "booking": {
    "id": "cl...",
    "status": "CANCELLED",
    "cancelledAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Mock 数据 (前端开发使用)

```typescript
// src/lib/mock/booking.ts
export const mockAvailabilityResponse = {
  success: true,
  available: true,
  property: {
    id: "mock-property-id",
    title: "示例豪华公寓",
    basePrice: 8000,
    currency: "CAD",
    image: "/images/property-1.jpg"
  },
  dates: {
    checkIn: "2024-03-01",
    checkOut: "2024-03-31",
    nights: 30
  },
  pricing: {
    nights: 30,
    basePrice: 8000,
    subtotal: 192000,
    cleaningFee: 500,
    serviceFee: 19200,
    discount: 48000,
    discountRate: 0.8,
    discountPercentage: 20,
    tax: 25076,
    total: 193776,
    isMonthly: true,
    isWeekly: false
  }
};

export const mockBookingResponse = {
  success: true,
  booking: {
    id: "mock-booking-id",
    bookingNumber: "STY-ABC123",
    status: "PENDING",
    paymentStatus: "PENDING",
    totalPrice: 193776,
    currency: "CAD",
    dates: {
      checkIn: "2024-03-01T00:00:00.000Z",
      checkOut: "2024-03-31T00:00:00.000Z",
      nights: 30
    },
    property: {
      id: "mock-property-id",
      title: "示例豪华公寓"
    }
  }
};
```

---

## 开发环境

**本地开发**:
```bash
npm run dev
# API 地址: http://localhost:3000/api
```

**测试命令**:
```bash
# 可用性查询
curl "http://localhost:3000/api/availability?propertyId=xxx&checkIn=2024-03-01&checkOut=2024-03-31"

# 创建预订
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"propertyId":"xxx","checkIn":"2024-03-01","checkOut":"2024-03-31","guests":2}'
```

---

**文档版本**: v1.0  
**最后更新**: Feb 9, 2026
