# StayNeos 架构标准（根治版）

## 1) 认证密钥规范
- 统一通过 `src/lib/config/env.ts#getAuthSecret()` 读取认证密钥。
- 优先级：`NEXTAUTH_SECRET_PROD` > `NEXTAUTH_SECRET` > `JWT_SECRET`。
- 禁止在业务代码直接读取 `process.env.NEXTAUTH_SECRET`。

## 2) 国际化与货币偏好
- 统一偏好中心：`src/lib/preferences/index.ts`。
- 语言与货币必须通过 `persistLocale/persistCurrency` 写入，禁止组件内孤立 `useState` 造成状态分裂。
- 客户端读取顺序：显式偏好 > 用户档案 > cookie(仅语言) > 默认值。

## 3) API 响应契约
- 成功：`{ "success": true, "data": ... }`
- 失败：`{ "success": false, "error": { "code": "...", "message": "..." } }`
- 禁止返回堆栈、SQL 错误、内部系统名等技术细节。

## 4) 请求验证与参数标准化
- JSON 请求体必须使用 Zod 校验（`parseJsonBody` / route-level schema）。
- URL 参数与 Query 必须经过 `validateParams` 或 schema 校验。
- 字符串输入统一 `trim` 后处理（`normalizeString`）。

## 5) 错误分类与结构化日志
- 业务可控错误使用 `AppError/APIError` 显式抛出。
- 未知错误统一降级为 `INTERNAL_ERROR`。
- 日志记录最小必要字段：route、code、status；不得输出敏感信息（token/password）。

## 6) 落地执行清单
1. 新增 API 路由必须接入 `withApiHandler`。
2. 新增用户偏好项必须在 `preferences` 中央模块登记。
3. 代码评审阻断项：
   - 直接访问裸环境变量认证密钥
   - 返回非标准错误格式
   - 缺少输入校验
