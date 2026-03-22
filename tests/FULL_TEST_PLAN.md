# StayNeos 全面测试计划

## 测试分组

### A组 - 公开页面 (Byte负责)
测试所有无需登录即可访问的页面，验证渲染、链接、按钮。

| # | 页面 | 测试项 |
|---|------|--------|
| A1 | `/` 首页 | 渲染、导航栏、语言切换(EN/中文/FR)、货币切换(CAD/USD/EUR/CNY)、Featured房源卡片点击、CTA按钮、Footer链接 |
| A2 | `/properties` | 房源列表加载、卡片渲染(3个)、心形收藏按钮、房源卡片点击跳转、搜索/筛选(如有) |
| A3 | `/property/1` (Cooper) | 图片轮播、价格显示、房源详情、地图、Book Now按钮、分享按钮、收藏按钮 |
| A4 | `/property/2` (Simcoe) | 同A3 |
| A5 | `/property/3` (Wellesley) | 同A3 |
| A6 | `/contact` | 表单渲染、必填项验证、提交功能 |
| A7 | `/about` | 页面渲染、图片加载 |
| A8 | `/for-business` | 页面渲染、CTA按钮 |
| A9 | `/for-agents` | 页面渲染、CTA按钮 |
| A10 | `/for-students` | 页面渲染、CTA按钮 |
| A11 | `/for-hosts` | 页面渲染、CTA按钮 |
| A12 | `/faq` | 页面渲染、FAQ折叠展开 |
| A13 | `/help` | 页面渲染 |
| A14 | `/services` | 页面渲染 |
| A15 | `/long-term` | 页面渲染 |
| A16 | `/corporate` | 页面渲染 |
| A17 | `/market-insights` | 页面渲染 |
| A18 | `/neighborhoods` | 页面渲染 |
| A19 | `/landlords` | 页面渲染 |
| A20 | `/privacy` | 页面渲染 |
| A21 | `/terms` | 页面渲染 |
| A22 | `/cancellation-policy` | 页面渲染 |
| A23 | `/service-animals` | 页面渲染 |

### B组 - 认证流程 (Logic负责)
| # | 页面 | 测试项 |
|---|------|--------|
| B1 | `/login` | 页面渲染、表单验证、错误提示、Google OAuth按钮 |
| B2 | `/register` | 页面渲染、表单验证、密码强度 |
| B3 | `/forgot-password` | 页面渲染、邮箱验证、提交 |
| B4 | `/reset-password` | 页面渲染(需token) |
| B5 | 未登录重定向 | `/dashboard` `/profile` `/bookings` `/wishlists` `/admin` 应重定向到login |

### C组 - API安全 (Nova负责)
| # | API | 测试项 |
|---|-----|--------|
| C1 | `GET /api/health` | 返回200 + JSON |
| C2 | `GET /api/properties` | 返回200 + 房源列表 |
| C3 | `GET /api/properties/:id` | 返回200 + 房源详情 |
| C4 | `GET /api/bookings/list` | 无认证返回401 |
| C5 | `POST /api/contact` | 空body返回400，正确body返回200 |
| C6 | `POST /api/inquiries` | 验证类型校验 |
| C7 | `POST /api/payments/create-intent` | 无认证返回401 |
| C8 | `GET /api/auth/session` | 返回未登录状态 |
| C9 | `POST /api/auth/login` | 错误密码返回401 |
| C10 | `POST /api/auth/register` | 验证必填项 |

### D组 - 交互功能 (Flow负责)
| # | 功能 | 测试项 |
|---|------|--------|
| D1 | 语言切换 | EN→中文→FR 切换后页面文字变化 |
| D2 | 货币切换 | CAD→USD→EUR→CNY 价格显示变化 |
| D3 | 收藏功能 | 心形按钮点击变红/取消 |
| D4 | 图片轮播 | 左右箭头/滑动切换图片 |
| D5 | 导航栏 | 移动端汉堡菜单展开/关闭 |
| D6 | 响应式 | 移动端(390px)/平板(768px)/桌面(1440px) |
| D7 | 404页面 | `/nonexistent` 返回404页面 |
| D8 | Footer链接 | 所有Footer链接正确跳转 |
