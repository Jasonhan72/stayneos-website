# 🔧 www.stayneos.com 最终解决方案（无需 Pages 菜单）

## 问题回顾

由于无法在 Cloudflare Dashboard 找到 **Pages** 菜单，使用替代方案解决 www.stayneos.com 访问问题。

**当前配置:**
- stayneos.com → stayneos.pages.dev ✅ 正常
- www.stayneos.com → stayneos.com ✅ 已配置（刚刚更新）

**结果:** www 现在指向主域名，应该可以正常访问或重定向。

---

## 方案 1: 直接测试（最简单）

等待 2-3 分钟后，直接访问：
```
https://www.stayneos.com
```

**可能的结果:**
- ✅ 如果显示网站内容 → 问题解决
- ✅ 如果自动跳转到 stayneos.com → 问题解决
- ❌ 如果显示 522 错误 → 需要方案 2

---

## 方案 2: 使用 Cloudflare Workers（推荐）

**不需要 Pages 菜单！**

### 步骤 1: 访问 Workers
直接访问链接：
```
https://dash.cloudflare.com/84e5534ae694a084f23f58020bd73c7b/workers/services
```

### 步骤 2: 创建 Worker
1. 点击 **"Create a Service"**
2. Service name: `www-redirect`
3. 点击 **"Create service"**

### 步骤 3: 编辑代码
1. 删除默认代码
2. 粘贴以下代码：

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Redirect www to non-www
  if (url.hostname === 'www.stayneos.com') {
    url.hostname = 'stayneos.com'
    return Response.redirect(url.toString(), 301)
  }
  
  // For stayneos.com, fetch from origin
  return fetch(request)
}
```

3. 点击 **"Save and Deploy"**

### 步骤 4: 添加路由
1. 点击 **"Triggers"** 标签
2. 点击 **"Add route"**
3. Route: `www.stayneos.com/*`
4. Service: 选择 `www-redirect`
5. 点击 **"Add route"**

### 步骤 5: 验证
访问 `https://www.stayneos.com`，应该自动跳转到 `https://stayneos.com`

---

## 方案 3: 删除并重新创建 Pages 项目

**如果以上方案都不行，可以彻底重建：**

### 步骤 1: 备份当前配置
- 代码已在 GitHub: `jasonhan72/stayneos-website`
- 域名配置已记录

### 步骤 2: 删除现有 Pages 项目
由于无法找到 Pages 菜单，需要通过 API 删除：

```bash
# 使用这个 Token: bgCYtWqcMz5Qt8OMHAAL39iJ8qLONzd6eoIf-Rlj
# 我可以帮您执行删除
```

### 步骤 3: 重新创建
1. 通过 GitHub 重新连接部署
2. 正确配置所有域名

---

## 当前状态验证

让我检查最新状态：

```bash
# DNS 解析测试
dig www.stayneos.com +short

# HTTP 测试
curl -I https://www.stayneos.com
```

---

## 推荐操作流程

1. **首先** → 等待 3 分钟后直接访问 www.stayneos.com 测试
2. **如果失败** → 使用方案 2 (Workers) 创建重定向
3. **如果还是失败** → 让我帮您重建 Pages 项目

---

**请按方案 1 测试，告诉我结果！** ⚡
