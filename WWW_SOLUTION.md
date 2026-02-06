# 🔧 www.stayneos.com 解决方案

## 问题分析

**当前状态:**
- ✅ stayneos.com → 正常访问
- ❌ www.stayneos.com → 522 错误

**原因:**
1. DNS 记录已正确配置（www → stayneos.pages.dev）
2. 但 **Cloudflare Pages 项目中未添加 www.stayneos.com 作为自定义域名**
3. 导致 Pages 服务拒绝处理 www.stayneos.com 的请求

**522 错误含义:**
Cloudflare 无法连接到源服务器（Pages 拒绝了请求）

---

## 解决方案

### 方法 1: Cloudflare Dashboard 手动添加（推荐，2分钟）

**步骤：**

1. **访问 Cloudflare Dashboard**
   - https://dash.cloudflare.com
   - 登录: jasonhan72@gmail.com

2. **进入 Pages 项目**
   - 左侧菜单点击 **Pages**
   - 选择项目 **stayneos**

3. **添加自定义域名**
   - 点击 **Custom domains** 标签
   - 点击 **Set up a custom domain**
   - 输入: `www.stayneos.com`
   - 点击 **Continue**
   - 等待验证完成
   - 点击 **Activate domain**

4. **完成**
   - www.stayneos.com 将可以访问
   - 或自动重定向到 stayneos.com

---

### 方法 2: 使用 Cloudflare API（需要额外权限）

**问题：** 当前 Token 无法通过 API 添加 Pages 自定义域名

**需要：** 具有 `Cloudflare Pages:Edit` 权限且允许域名管理的 Token

---

### 方法 3: 保持现状

**影响：**
- stayneos.com 正常工作 ✅
- www.stayneos.com 返回 522 错误 ❌
- 用户访问 www 时会看到错误页面

**建议：** 强烈建议使用方法 1 修复

---

## 当前 DNS 配置

| 记录 | 类型 | 目标 | 状态 |
|------|------|------|------|
| stayneos.com | CNAME | stayneos.pages.dev | ✅ 正常 |
| www.stayneos.com | CNAME | stayneos.pages.dev | ✅ DNS 正常 |

**问题：** Pages 项目未识别 www.stayneos.com

---

## 修复后预期

✅ stayneos.com → 正常访问
✅ www.stayneos.com → 正常访问 或 重定向到主域名

---

## 临时解决方案

在修复前，可以创建 Workers 脚本处理重定向：

```javascript
// 在 Cloudflare Workers 中创建
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  if (url.hostname === 'www.stayneos.com') {
    url.hostname = 'stayneos.com'
    return Response.redirect(url.toString(), 301)
  }
  return fetch(request)
}
```

---

**请使用方法 1 完成修复！** ⚡
