#!/bin/bash
# StayNeos 冒烟测试 — 每次部署后必跑
BASE="${1:-https://stayneos.com}"
PASS=0; FAIL=0; TOTAL=0

check() {
  TOTAL=$((TOTAL+1))
  if [ "$1" = "true" ]; then PASS=$((PASS+1)); echo "  ✅ $2"; else FAIL=$((FAIL+1)); echo "  ❌ $2"; fi
}

echo "=============================="
echo "  StayNeos 冒烟测试"
echo "  $(date '+%Y-%m-%d %H:%M')"
echo "  Target: $BASE"
echo "=============================="
echo ""

# 1. 首页
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/")
check "$([ "$CODE" = "200" ] && echo true)" "首页 HTTP $CODE"

# 2. 登录
LOGIN=$(curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@stayneos.com","password":"StayNeos2026!"}')
TOKEN=$(echo "$LOGIN" | python3 -c "import json,sys; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)
check "$([ -n "$TOKEN" ] && echo true)" "Admin 登录"

# 3. 物业列表有数据
PROPS=$(curl -s "$BASE/api/properties")
COUNT=$(echo "$PROPS" | python3 -c "import json,sys; print(len(json.load(sys.stdin).get('properties',[])))" 2>/dev/null)
check "$([ "$COUNT" -gt 0 ] && echo true)" "物业列表 ($COUNT 套)"

# 4. 每个物业的详情 API（slug + id 都测）
echo "$PROPS" | python3 -c "
import json, sys, subprocess
data = json.load(sys.stdin)
for p in data.get('properties', []):
    slug = p.get('slug','')
    pid = p.get('id','')
    title = p.get('title','?')[:40]
    ok = True
    for key in [slug, pid]:
        if not key: continue
        r = subprocess.run(['curl','-s','$BASE/api/properties/'+key], capture_output=True, text=True)
        try:
            d = json.loads(r.stdout)
            if not d.get('property',{}).get('title'): ok = False
        except: ok = False
    print(f'  {\"✅\" if ok else \"❌\"} 详情: {title} (slug={slug})')
" 2>/dev/null

# 5. 后台权限
ADMIN_UNAUTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/admin/stats")
check "$([ "$ADMIN_UNAUTH" = "401" ] && echo true)" "后台未登录=401 (got $ADMIN_UNAUTH)"

# 6. 受保护页面重定向
for page in /dashboard /profile /bookings /admin; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$page")
  check "$([ "$CODE" = "307" ] && echo true)" "$page 未登录→$CODE"
done

echo ""
echo "=============================="
echo "  结果: $PASS/$TOTAL 通过, $FAIL 失败"
echo "=============================="
