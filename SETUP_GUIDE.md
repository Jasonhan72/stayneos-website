# StayNeos 部署设置指南

## ⚡ 快速设置 (推荐)

在终端运行以下命令：

```bash
# 1. 安装 GitHub CLI (如未安装)
brew install gh

# 2. 登录 GitHub
gh auth login
# 选择: GitHub.com → HTTPS → Login with web browser

# 3. 创建仓库并推送代码
cd /Users/neos/.openclaw/workspace/stayneos-web
gh repo create stayneos-website --public --source=. --remote=origin --push

# 4. 添加 Cloudflare Token (自动部署关键)
gh secret set CLOUDFLARE_API_TOKEN -b"e3sE_jRJyZNY1YQ7sBoyh5ZtBTgVkF44vSOUiagO"
```

✅ **完成！** 现在每次推送到 main 分支都会自动部署到 stayneos.com

---

## 🔧 手动设置 (如上述失败)

### Step 1: 创建 GitHub 仓库
1. 访问 https://github.com/new
2. Repository name: `stayneos-website`
3. 选择 "Public"
4. 不勾选 "Add a README"
5. 点击 "Create repository"

### Step 2: 推送代码
```bash
cd /Users/neos/.openclaw/workspace/stayneos-web
git remote add origin https://github.com/jasonhan72/stayneos-website.git
git branch -M main
git push -u origin main
```

### Step 3: 配置自动部署
1. 访问: https://github.com/jasonhan72/stayneos-website/settings/secrets/actions
2. 点击 "New repository secret"
3. 填写:
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: `e3sE_jRJyZNY1YQ7sBoyh5ZtBTgVkF44vSOUiagO`
4. 点击 "Add secret"

✅ **完成！** 自动部署已启用

---

## 🧪 验证部署

设置完成后：
1. 访问 https://github.com/jasonhan72/stayneos-website
2. 点击 "Actions" 标签
3. 确认看到绿色的 ✅ 工作流运行记录
4. 网站将在 https://stayneos.com 自动更新

---

## 📝 更新网站

```bash
# 修改代码后...
git add .
git commit -m "update: 描述更新内容"
git push origin main

# 等待约2分钟，自动部署完成
```

---

## 🔑 重要信息

| 项目 | 值 |
|------|-----|
| 域名 | stayneos.com |
| 邮箱 | hello.Stayneos@gmail.com |
| Cloudflare Token | `e3sE_jRJyZNY1YQ7sBoyh5ZtBTgVkF44vSOUiagO` |
| GitHub 仓库 | jasonhan72/stayneos-website |

---

**需要帮助？** 联系 AI Agent 或查看 `DEPLOYMENT_REPORT.md`
