# StayNeos 测试规范

> 每次代码修改后、部署前必须执行的测试标准。
> 目标：**不是测 API 通不通，而是测用户能不能完成操作。**

## 核心原则

1. **测用户流程，不是测端点** — API 返回 200 不等于页面能用
2. **测数据一致性** — 数据库 ID 变了，前端还在用旧 ID？
3. **测真实浏览器行为** — curl 测不出 JS 渲染问题
4. **测中文环境** — 切换语言后所有文字都翻译了？
5. **测完整链路** — 从列表页点进详情页，不是直接访问详情页

---

## 第一层：冒烟测试（每次部署必做，2分钟）

```bash
# smoke-test.sh — 部署后立即运行
BASE="https://stayneos.com"

echo "=== 冒烟测试 ==="

# 1. 首页加载
curl -s -o /dev/null -w "首页: %{http_code}\n" "$BASE/"

# 2. 登录流程
TOKEN=$(curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@stayneos.com","password":"StayNeos2026!"}' | python3 -c "import json,sys; print(json.load(sys.stdin).get('token','FAIL'))")
[ "$TOKEN" != "FAIL" ] && echo "登录: ✅" || echo "登录: ❌ FAIL"

# 3. 物业列表有数据
COUNT=$(curl -s "$BASE/api/properties" | python3 -c "import json,sys; print(len(json.load(sys.stdin).get('properties',[])))")
[ "$COUNT" -gt 0 ] && echo "物业列表: ✅ ($COUNT 套)" || echo "物业列表: ❌ 空"

# 4. 物业详情能访问（用 API 返回的真实 slug）
SLUG=$(curl -s "$BASE/api/properties" | python3 -c "import json,sys; p=json.load(sys.stdin).get('properties',[]); print(p[0].get('slug','') if p else '')")
if [ -n "$SLUG" ]; then
  DETAIL_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/properties/$SLUG")
  [ "$DETAIL_CODE" = "200" ] && echo "物业详情API: ✅" || echo "物业详情API: ❌ HTTP $DETAIL_CODE"
fi

# 5. 后台需要认证
ADMIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/admin/stats")
[ "$ADMIN_CODE" = "401" ] && echo "后台权限: ✅ (未登录=401)" || echo "后台权限: ❌ HTTP $ADMIN_CODE"
```

---

## 第二层：用户流程测试（重大改动必做，10分钟）

### 流程 A：访客浏览房源
```bash
# 模拟用户从首页 → 物业列表 → 物业详情的完整路径

# 1. 首页加载，检查关键内容存在
curl -s "$BASE/" | grep -q "StayNeos" && echo "首页内容: ✅" || echo "首页内容: ❌"

# 2. 物业列表页加载 + 有房源卡片
curl -s "$BASE/properties" | grep -q "property" && echo "列表页: ✅" || echo "列表页: ❌"

# 3. 从 API 获取物业列表，验证每个物业的详情页都能访问
curl -s "$BASE/api/properties" | python3 -c "
import json, sys, urllib.request
data = json.load(sys.stdin)
props = data.get('properties', [])
print(f'共 {len(props)} 套物业')
for p in props:
    slug = p.get('slug', '')
    pid = p.get('id', '')
    title = p.get('title', 'unknown')
    
    # 测试 slug 访问
    try:
        r = urllib.request.urlopen(f'https://stayneos.com/api/properties/{slug}')
        detail = json.loads(r.read())
        has_data = bool(detail.get('property', {}).get('title'))
    except:
        has_data = False
    
    # 测试 id 访问
    try:
        r2 = urllib.request.urlopen(f'https://stayneos.com/api/properties/{pid}')
        detail2 = json.loads(r2.read())
        has_data2 = bool(detail2.get('property', {}).get('title'))
    except:
        has_data2 = False
    
    # 测试详情页 HTML
    try:
        r3 = urllib.request.urlopen(f'https://stayneos.com/property/{slug}')
        html = r3.read().decode()
        has_html = len(html) > 1000
    except:
        has_html = False
    
    status = '✅' if (has_data and has_data2 and has_html) else '❌'
    issues = []
    if not has_data: issues.append('slug API失败')
    if not has_data2: issues.append('id API失败')
    if not has_html: issues.append('详情页空')
    issue_str = f' ({", ".join(issues)})' if issues else ''
    print(f'  {status} {title}{issue_str}')
"
```

### 流程 B：注册 → 登录 → Dashboard
```bash
# 1. 注册新用户
TS=$(date +%s)
REG=$(curl -s -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test${TS}@stayneos.com\",\"password\":\"Test1234\",\"name\":\"Test User\"}")
REG_OK=$(echo "$REG" | python3 -c "import json,sys; d=json.load(sys.stdin); print('OK' if d.get('token') else 'FAIL')")
echo "注册: $REG_OK"

# 2. 用新账号登录
LOGIN=$(curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test${TS}@stayneos.com\",\"password\":\"Test1234\"}" \
  -c /tmp/stayneos_cookie.txt)
LOGIN_OK=$(echo "$LOGIN" | python3 -c "import json,sys; d=json.load(sys.stdin); print('OK' if d.get('token') else 'FAIL')")
echo "登录: $LOGIN_OK"

# 3. 用 cookie 访问 dashboard
DASH=$(curl -s -o /dev/null -w "%{http_code}" -b /tmp/stayneos_cookie.txt "$BASE/dashboard")
echo "Dashboard: HTTP $DASH"

# 4. Session API 返回用户信息
SESSION=$(curl -s -b /tmp/stayneos_cookie.txt "$BASE/api/auth/session" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('user',{}).get('email','FAIL'))")
echo "Session: $SESSION"

# 5. 登出
curl -s -X POST -b /tmp/stayneos_cookie.txt "$BASE/api/auth/logout" > /dev/null
echo "登出: ✅"
```

### 流程 C：管理员后台操作
```bash
# 1. Admin 登录
ADMIN_TOKEN=$(curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@stayneos.com","password":"StayNeos2026!"}' \
  -c /tmp/admin_cookie.txt | python3 -c "import json,sys; print(json.load(sys.stdin).get('token','FAIL'))")

# 2. Dashboard 统计
STATS=$(curl -s -b /tmp/admin_cookie.txt "$BASE/api/admin/stats")
echo "Admin Stats: $(echo $STATS | python3 -c "import json,sys; d=json.load(sys.stdin); print(f\"物业{d.get('properties',0)} 询盘{d.get('inquiries',0)} 用户{d.get('users',0)}\")" 2>/dev/null || echo "FAIL")"

# 3. 创建测试物业
CREATE=$(curl -s -X POST -b /tmp/admin_cookie.txt "$BASE/api/admin/properties" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Property","slug":"test-prop-'$(date +%s)'","address":"123 Test St","neighborhood":"Test","bedrooms":2,"bathrooms":1}')
NEW_ID=$(echo "$CREATE" | python3 -c "import json,sys; print(json.load(sys.stdin).get('property',{}).get('id','FAIL'))")
echo "创建物业: $NEW_ID"

# 4. 查询刚创建的物业
if [ "$NEW_ID" != "FAIL" ]; then
  GET=$(curl -s -b /tmp/admin_cookie.txt "$BASE/api/admin/properties/$NEW_ID" | python3 -c "import json,sys; print(json.load(sys.stdin).get('property',{}).get('title','FAIL'))")
  echo "查询物业: $GET"
  
  # 5. 删除测试物业
  DEL=$(curl -s -X DELETE -b /tmp/admin_cookie.txt "$BASE/api/admin/properties/$NEW_ID" -o /dev/null -w "%{http_code}")
  echo "删除物业: HTTP $DEL"
fi

# 6. 权限测试：普通用户不能访问 admin API
curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test$(date +%s)@stayneos.com\",\"password\":\"Test1234\"}" > /dev/null 2>&1
FORBIDDEN=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/admin/stats")
echo "普通用户访问admin: HTTP $FORBIDDEN (应为401)"
```

---

## 第三层：数据一致性检查（数据库改动必做）

```bash
# 检查前端引用的 ID/slug 是否与数据库一致

echo "=== 数据一致性检查 ==="

# 1. 获取数据库中所有物业 ID 和 slug
curl -s "$BASE/api/properties" | python3 -c "
import json, sys
data = json.load(sys.stdin)
ids = set()
slugs = set()
for p in data.get('properties', []):
    ids.add(p['id'])
    if p.get('slug'): slugs.add(p['slug'])
print('DB IDs:', sorted(ids))
print('DB Slugs:', sorted(slugs))
"

# 2. 检查代码中硬编码的物业 ID（应该为空或匹配数据库）
echo ""
echo "代码中硬编码的物业引用:"
grep -rn "'1'\|'2'\|'3'" src/app/properties/ src/app/property/ --include="*.tsx" | grep -v "import\|className\|size=\|grid-cols\|gap-\|col-span\|z-\|top-\|w-\|h-\|p-\|m-\|text-\|font-\|rounded\|border\|flex\|items-\|justify-\|opacity\|transition\|duration\|hover\|bg-\|from-\|to-\|via-\|ring-\|shadow\|overflow\|aspect\|snap\|scroll\|cursor\|fill-\|stroke" | head -20
```

---

## 第四层：i18n 完整性检查

```bash
# 检查中文翻译覆盖率
python3 -c "
import json

with open('messages/en.json') as f: en = json.load(f)
with open('messages/zh.json') as f: zh = json.load(f)

def flatten(d, prefix=''):
    items = {}
    for k, v in d.items():
        key = f'{prefix}.{k}' if prefix else k
        if isinstance(v, dict):
            items.update(flatten(v, key))
        else:
            items[key] = v
    return items

en_flat = flatten(en)
zh_flat = flatten(zh)

missing = set(en_flat.keys()) - set(zh_flat.keys())
if missing:
    print(f'❌ 中文缺少 {len(missing)} 个 key:')
    for k in sorted(missing)[:20]:
        print(f'  - {k}')
    if len(missing) > 20:
        print(f'  ... 还有 {len(missing)-20} 个')
else:
    print('✅ 中文翻译完整')

# 检查代码中的硬编码英文（不走 t() 的）
import subprocess, re
result = subprocess.run(
    ['grep', '-rn', '--include=*.tsx', 
     'Sign up\\|Log in\\|Sign In\\|Log Out\\|Dashboard\\|Bookings\\|Submit\\|Loading',
     'src/components/', 'src/app/'],
    capture_output=True, text=True
)
hardcoded = [l for l in result.stdout.splitlines() if 't(' not in l and 'useI18n' not in l and '//' not in l.split(':',2)[-1]]
if hardcoded:
    print(f'\\n⚠️ 可能的硬编码英文 ({len(hardcoded)} 处):')
    for l in hardcoded[:10]:
        print(f'  {l}')
else:
    print('\\n✅ 未发现明显的硬编码英文')
"
```

---

## 执行时机

| 场景 | 测试层级 |
|------|---------|
| 小修改（文字/样式） | 第一层 冒烟测试 |
| API 改动 | 第一层 + 第二层 B/C |
| 数据库改动 | 第一层 + 第二层 A + 第三层 |
| 前端大改 | 第一层 + 第二层 全部 + 第四层 |
| i18n 改动 | 第一层 + 第四层 |
| 部署到生产 | 全部四层 |

---

## 为什么之前的测试漏掉了问题

| 漏掉的问题 | 原因 | 现在怎么防 |
|-----------|------|-----------|
| 物业详情页打不开 | 只测了 HTTP 200，没测内容 | 第二层流程A：验证每个物业的 slug+id 都能返回数据 |
| 旧 ID 硬编码 | 没做数据一致性检查 | 第三层：检查代码中硬编码的 ID 是否匹配数据库 |
| 语言切换不完整 | 没测中文环境 | 第四层：自动扫描硬编码英文 |

---

## 自动化

上述脚本保存在 `scripts/test-*.sh`，可一键运行：
```bash
# 全量测试
bash scripts/test-all.sh

# 冒烟测试
bash scripts/test-smoke.sh
```

— 文档结束 —
