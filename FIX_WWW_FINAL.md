# 🔧 修复 www.stayneos.com - 终极解决方案

## 问题确认

**诊断结果:**
- ✅ DNS 记录: www.stayneos.com → stayneos.pages.dev
- ✅ DNS 解析: 正常 (172.64.80.1)
- ❌ Pages 项目: 未添加 www.stayneos.com
- ❌ 错误代码: HTTP 522 (Connection Timed Out)

**原因:**
Cloudflare Pages 拒绝了 www.stayneos.com 的请求，因为该域名不在项目的自定义域名列表中。

---

## 解决方案（必须手动完成）

### 步骤 1: 登录 Cloudflare Dashboard

1. 访问: https://dash.cloudflare.com
2. 登录: jasonhan72@gmail.com
3. 选择域名: stayneos.com

---

### 步骤 2: 验证 DNS 记录

1. 点击左侧菜单 **DNS** → **Records**
2. 确认有以下记录:
   ```
   Type: CNAME | Name: www | Target: stayneos.pages.dev | Proxied: Yes
   ```
3. 如果不存在，点击 **Add record** 创建:
   - Type: **CNAME**
   - Name: **www**
   - Target: **stayneos.pages.dev**
   - TTL: **Auto**
   - Proxy status: **Proxied** (橙色云图标)
   - 点击 **Save**

---

### 步骤 3: 添加自定义域名到 Pages（关键步骤）

1. 点击左侧菜单 **Pages**
2. 选择项目: **stayneos**
3. 点击顶部标签: **Custom domains**
4. 点击按钮: **Set up a custom domain**
5. 输入域名: **www.stayneos.com**
6. 点击 **Continue**
7. 等待验证（可能需要 30-60 秒）
8. 点击 **Activate domain**

---

### 步骤 4: 创建重定向规则（推荐）

将 www 重定向到主域名，避免 SEO 重复内容：

1. 在 stayneos.com 域名下，点击 **Rules** → **Page Rules**
2. 点击 **Create Page Rule**
3. 配置:
   - URL: `www.stayneos.com/*`
   - Setting: **Forwarding URL**
   - Status code: **301 - Permanent Redirect**
   - Destination URL: `https://stayneos.com/$1`
4. 点击 **Save and Deploy**

---

### 步骤 5: 验证修复

等待 1-2 分钟后，测试:

```bash
# 测试 www 域名
curl -I https://www.stayneos.com

# 应该返回:
# HTTP/2 301 (重定向)
# Location: https://stayneos.com/

# 或直接访问
open https://www.stayneos.com
```

---

## 预期结果

修复完成后:

| 域名 | 结果 |
|------|------|
| stayneos.com | ✅ 正常访问 |
| www.stayneos.com | ✅ 301 重定向到主域名 |

---

## 为什么必须手动操作？

**API 限制:**
- 当前 Token 无法通过 API 添加 Pages 自定义域名
- 错误: "invalid TLD"（可能是 Cloudflare 的安全验证）
- Dashboard 操作绕过此限制

---

## 替代方案

如果上述方法无法解决，可以考虑:

### 方案 B: 使用 Cloudflare Workers

1. 创建 Worker 脚本处理重定向
2. 将 www.stayneos.com 路由到 Worker
3. Worker 代码:
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

### 方案 C: 删除并重建 Pages 项目

1. 导出当前项目设置
2. 删除 stayneos Pages 项目
3. 重新创建并正确配置域名

---

## 当前状态摘要

| 检查项 | 状态 |
|--------|------|
| stayneos.com | ✅ 正常 |
| DNS 配置 | ✅ 正确 |
| SSL 证书 | ✅ 有效 |
| GitHub Actions | ✅ 已配置 |
| Pages 自定义域名 | ❌ **需要手动添加** |

---

**请按照"步骤 3"操作，完成后告诉我验证结果！** ⚡
