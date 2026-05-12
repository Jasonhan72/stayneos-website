# 🚨 www.stayneos.com 紧急修复方案

## 诊断结果

**当前状态:**
- stayneos.com → ✅ 正常 (200 OK)
- www.stayneos.com → ❌ 522 错误

**根本原因:**
Cloudflare Pages 项目 **只接受 stayneos.com**，拒绝所有其他域名（包括 www.stayneos.com）。

**522 错误含义:**
> Cloudflare 无法连接到源服务器。Pages 服务明确拒绝了 www.stayneos.com 的请求。

---

## 解决方案（三选一）

### 方案 1: 使用 Workers 重定向（推荐 ⭐⭐⭐）

**优点:** 不需要 Pages 菜单，5分钟完成，效果最佳

**步骤:**

1. **访问 Workers**
   - https://dash.cloudflare.com/84e5534ae694a084f23f58020bd73c7b/workers/services

2. **创建 Worker**
   - 点击 **"Create a Service"**
   - Service name: `www-redirect`
   - 点击 **"Create service"**

3. **编辑代码**
   ```javascript
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

4. **添加路由**
   - 点击 **Triggers** → **Add route**
   - Route: `www.stayneos.com/*`
   - 点击 **Add route**

✅ **完成！** www.stayneos.com → 301 重定向 → stayneos.com

---

### 方案 2: 删除并重建 Pages 项目

**让我帮您执行:**

1. **备份确认**
   - 代码已保存在 GitHub ✅
   - 配置文件已备份 ✅

2. **删除现有项目**（我来执行）

3. **重新创建**（我来执行）
   - 使用 GitHub 连接
   - 正确配置所有域名

**风险:** 网站可能有几分钟不可用

---

### 方案 3: 保持现状

**接受 www.stayneos.com 返回 522**

- stayneos.com 正常工作 ✅
- 大多数用户直接使用主域名
- www 子域名流量很少

---

## 推荐操作

**请告诉我选择哪个方案:**

- [ ] 方案 1: 使用 Workers（5分钟，我指导您操作）
- [ ] 方案 2: 重建 Pages 项目（我来操作，几分钟停机）
- [ ] 方案 3: 暂时不处理

---

## 临时方案

**立即生效（不解决根本问题）:**

将 www DNS 记录改为显示错误页面：

```
Type: A | Name: www | Target: 192.0.2.1 | Proxied: No
```

这样用户访问 www 时会看到浏览器错误，而不是 522。

---

**请选择方案 1、2 或 3，我立即执行！** ⚡
