# 房源录入系统后端开发 - 交付报告

## 📋 任务完成状态：✅ 已完成

---

## 一、数据库 Schema 更新

### 1. 新增 `hosts` 表
- 文件: `prisma/schema.prisma`
- 字段:
  - `id`, `userId` (关联用户，可选)
  - `displayName`, `tagline`, `bio`, `avatarUrl` (基本信息)
  - `status` (Host状态: PENDING/ACTIVE/SUSPENDED/INACTIVE)
  - `isVerified`, `verificationDate` (验证信息)
  - `businessEmail`, `businessPhone` (联系信息)
  - `totalProperties`, `totalBookings`, `responseRate`, `rating` (统计)
  - `hostLevel` (等级: NEW/RISING/ESTABLISHED/SUPERHOST)
  - `timezone`, `preferredLanguages` (偏好)

### 2. 新增 `host_applications` 表
- 用于用户申请成为Host
- 字段: 用户信息、房产预估、申请状态、审核信息

### 3. 新增 `host_documents` 表
- Host身份验证文档
- 字段: 文档类型、号码、URL、状态

### 4. 更新 `properties` 表
- 新增 `host_id` (关联hosts表)
- 新增 `admin_created` (标记admin录入的房源)
- 添加相应索引

### 5. 新增枚举类型
- `HostStatus`: PENDING, ACTIVE, SUSPENDED, INACTIVE
- `HostLevel`: NEW, RISING, ESTABLISHED, SUPERHOST
- `ApplicationStatus`: PENDING, REVIEWING, APPROVED, REJECTED
- `DocumentStatus`: PENDING, VERIFIED, REJECTED

---

## 二、系统 Host 账户

### 创建系统Host
- **ID**: `00000000-0000-0000-0000-000000000001` (固定UUID)
- **显示名称**: StayNeos Team
- **邮箱**: hello.stayneos@gmail.com
- **状态**: ACTIVE
- **验证**: 已验证
- **等级**: ESTABLISHED

该Host在以下情况自动创建:
1. 首次调用 `/api/admin/properties` POST 接口时
2. 迁移脚本执行时

---

## 三、API 路由

### 1. POST /api/admin/properties
- **功能**: 创建新房源
- **权限**: Admin/SuperAdmin
- **特性**:
  - Zod输入验证
  - 自动创建/关联系统Host
  - 事务处理（房源+图片+设施）
  - 自动更新Host统计

### 2. GET /api/admin/properties
- **功能**: 获取房源列表
- **权限**: Admin/SuperAdmin
- **查询参数**:
  - `page`, `limit`: 分页
  - `city`, `status`: 筛选
  - `hostId`, `adminCreated`: Host筛选
  - `sortBy`, `sortOrder`: 排序

### 3. PATCH /api/admin/properties/:id
- **功能**: 更新房源信息
- **权限**: Admin/SuperAdmin
- **特性**:
  - 支持部分更新
  - 事务处理
  - 自动更新Host统计（当修改hostId时）
  - 检查未完成的预订

### 4. DELETE /api/admin/properties/:id
- **功能**: 删除房源
- **权限**: Admin/SuperAdmin
- **安全**:
  - 检查未完成预订
  - 级联删除关联数据
  - 更新Host统计

### 5. GET /api/hosts/:id
- **功能**: 获取Host详情（公开接口）
- **权限**: 公开访问
- **返回**:
  - Host基本信息
  - 统计字段（计算yearsHosting）
  - 关联房源列表（支持分页）

---

## 四、验证 Schema

### 文件: `src/lib/validations/property.ts`

**创建房源验证** (`createPropertySchema`):
- 标题、slug、描述验证
- 位置信息验证
- 房型信息验证（卧室、卫生间、最大入住等）
- 价格验证（支持折扣）
- 图片数组验证
- 设施ID列表验证

**更新房源验证** (`updatePropertySchema`):
- 所有字段可选
- 包含房源ID验证

**列表查询验证** (`adminPropertyListQuerySchema`):
- 分页参数
- 筛选参数
- 排序参数

**Host验证**:
- `createHostSchema`: 创建Host
- `updateHostSchema`: 更新Host
- `hostApplicationSchema`: Host申请

---

## 五、权限验证

### 文件: `src/lib/auth/admin.ts`

**函数**:
- `verifyAdmin()`: 验证Admin权限，返回payload或null
- `requireAdmin()`: 需要Admin权限，失败返回401响应
- `getCurrentUser()`: 获取当前登录用户

**验证方式**:
- 读取 `stayneos_auth_token` 或 `auth-token` cookie
- JWT验证
- 检查 role 是否为 ADMIN 或 SUPER_ADMIN

---

## 六、迁移文件

### 文件: `prisma/migrations/20250226000000_add_host_support/migration.sql`

包含:
1. 创建枚举类型
2. 创建 `hosts` 表
3. 创建 `host_applications` 表
4. 创建 `host_documents` 表
5. 修改 `Property` 表
6. 创建索引和外键
7. 插入系统Host数据
8. 启用RLS策略
9. 更新现有房源关联

---

## 七、文件清单

```
stayneos-web/
├── prisma/
│   ├── schema.prisma                          # 更新: 添加Host相关模型
│   └── migrations/
│       └── 20250226000000_add_host_support/
│           └── migration.sql                  # 新增: 完整迁移脚本
├── src/
│   ├── lib/
│   │   ├── auth/
│   │   │   └── admin.ts                       # 新增: Admin权限验证
│   │   └── validations/
│   │       └── property.ts                    # 新增: Zod验证schemas
│   └── app/
│       └── api/
│           ├── admin/
│           │   └── properties/
│           │       ├── route.ts               # 新增: 列表/创建API
│           │       └── [id]/
│           │           └── route.ts           # 新增: 详情/更新/删除API
│           └── hosts/
│               └── [id]/
│                   └── route.ts               # 新增: Host详情API
```

---

## 八、使用示例

### 创建房源
```bash
curl -X POST http://localhost:3000/api/admin/properties \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=xxx" \
  -d '{
    "title": "豪华公寓 - 多伦多市中心",
    "slug": "luxury-apt-downtown-toronto",
    "description": "位于市中心的豪华公寓...",
    "address": "123 Main St",
    "city": "Toronto",
    "neighborhood": "Downtown",
    "latitude": 43.6532,
    "longitude": -79.3832,
    "propertyType": "APARTMENT",
    "bedrooms": 2,
    "bathrooms": 2,
    "maxGuests": 4,
    "area": 80,
    "basePrice": 150.00,
    "images": [{"url": "https://...", "isPrimary": true}],
    "amenityIds": ["amenity-id-1", "amenity-id-2"]
  }'
```

### 获取房源列表
```bash
curl "http://localhost:3000/api/admin/properties?page=1&limit=10&status=PUBLISHED" \
  -H "Cookie: auth-token=xxx"
```

### 获取Host详情
```bash
curl "http://localhost:3000/api/hosts/00000000-0000-0000-0000-000000000001"
```

---

## 九、后续步骤

1. **执行迁移**: `npx prisma migrate deploy`
2. **部署API**: 提交代码并部署
3. **测试**: 使用上述示例测试API
4. **前端集成**: 在Admin后台调用这些API

---

## 十、注意事项

1. **API路径**: 使用 `/api/admin/properties` (注意不是 `_api`，因为 `_api` 在 middleware matcher 中被排除)
2. **权限**: 所有admin API需要 `ADMIN` 或 `SUPER_ADMIN` 角色
3. **Host详情**: 公开接口，无需认证
4. **系统Host**: ID固定为 `00000000-0000-0000-0000-000000000001`
