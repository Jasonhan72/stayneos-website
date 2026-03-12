#!/bin/bash
# StayNeos 全量测试 — 重大改动 / 部署到生产前必跑
BASE="${1:-https://stayneos.com}"
PASS=0; FAIL=0; TOTAL=0

check() {
  TOTAL=$((TOTAL+1))
  if [ "$1" = "true" ]; then PASS=$((PASS+1)); echo "  ✅ $2"; else FAIL=$((FAIL+1)); echo "  ❌ $2"; fi
}

echo "============================================"
echo "  StayNeos 全量测试"
echo "  $(date '+%Y-%m-%d %H:%M')"
echo "  Target: $BASE"
echo "============================================"

# ============ 第一层：页面加载 ============
echo ""
echo "▸ 第一层：页面加载"

PUBLIC_PAGES="/ /login /register /forgot-password /about /contact /faq /properties /for-agents /for-business /for-hosts /for-students /neighborhoods /long-term /market-insights /services /privacy /terms"
for page in $PUBLIC_PAGES; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$page")
  check "$([ "$CODE" = "200" ] && echo true)" "$page → $CODE"
done

PROTECTED_PAGES="/dashboard /profile /bookings /wishlists /admin"
for page in $PROTECTED_PAGES; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$page")
  check "$([ "$CODE" = "307" ] && echo true)" "$page (保护) → $CODE"
done

# ============ 第二层：用户流程 ============
echo ""
echo "▸ 第二层：用户流程"

# 流程A: 物业浏览
echo "  --- 流程A: 访客浏览房源 ---"
PROPS=$(curl -s "$BASE/api/properties")
COUNT=$(echo "$PROPS" | python3 -c "import json,sys; print(len(json.load(sys.stdin).get('properties',[])))" 2>/dev/null)
check "$([ "$COUNT" -gt 0 ] && echo true)" "物业 API 返回 $COUNT 套"

echo "$PROPS" | python3 -c "
import json, sys, subprocess
data = json.load(sys.stdin)
for p in data.get('properties', []):
    slug = p.get('slug','')
    pid = p.get('id','')
    title = p.get('title','?')[:40]
    errors = []
    
    # Test slug API (use curl to avoid SSL issues)
    r = subprocess.run(['curl','-s','$BASE/api/properties/'+slug], capture_output=True, text=True)
    try:
        d = json.loads(r.stdout)
        if not d.get('property',{}).get('title'): errors.append('slug API 无数据')
    except: errors.append('slug API 失败')
    
    # Test id API
    r = subprocess.run(['curl','-s','$BASE/api/properties/'+pid], capture_output=True, text=True)
    try:
        d = json.loads(r.stdout)
        if not d.get('property',{}).get('title'): errors.append('id API 无数据')
    except: errors.append('id API 失败')
    
    # Test detail page HTML
    r = subprocess.run(['curl','-s','$BASE/property/'+slug], capture_output=True, text=True)
    if len(r.stdout) < 1000: errors.append('详情页内容少')
    
    ok = len(errors) == 0
    err = f' ({chr(44).join(errors)})' if errors else ''
    print(f'  {\"✅\" if ok else \"❌\"} {title}{err}')
" 2>/dev/null

# 流程B: 注册→登录→Dashboard
echo "  --- 流程B: 注册→登录→Dashboard ---"
TS=$(date +%s)
TEST_EMAIL="autotest${TS}@stayneos.com"

REG=$(curl -s -X POST "$BASE/api/auth/register" -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"AutoTest123\",\"name\":\"Auto Test\"}")
REG_TOKEN=$(echo "$REG" | python3 -c "import json,sys; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)
check "$([ -n "$REG_TOKEN" ] && echo true)" "注册 $TEST_EMAIL"

LOGIN=$(curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"AutoTest123\"}" -c /tmp/test_cookie.txt)
LOGIN_TOKEN=$(echo "$LOGIN" | python3 -c "import json,sys; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)
check "$([ -n "$LOGIN_TOKEN" ] && echo true)" "登录"

SESSION=$(curl -s -b /tmp/test_cookie.txt "$BASE/api/auth/session")
SESSION_EMAIL=$(echo "$SESSION" | python3 -c "import json,sys; print(json.load(sys.stdin).get('user',{}).get('email',''))" 2>/dev/null)
check "$([ "$SESSION_EMAIL" = "$TEST_EMAIL" ] && echo true)" "Session API 返回用户"

LOGOUT=$(curl -s -X POST -b /tmp/test_cookie.txt "$BASE/api/auth/logout" -o /dev/null -w "%{http_code}")
check "$([ "$LOGOUT" = "200" ] && echo true)" "登出"

# 流程C: Admin CRUD
echo "  --- 流程C: 管理员后台 ---"
ADMIN_LOGIN=$(curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"admin@stayneos.com","password":"StayNeos2026!"}' -c /tmp/admin_cookie.txt)
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | python3 -c "import json,sys; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)
check "$([ -n "$ADMIN_TOKEN" ] && echo true)" "Admin 登录"

STATS=$(curl -s -b /tmp/admin_cookie.txt "$BASE/api/admin/stats")
STATS_OK=$(echo "$STATS" | python3 -c "import json,sys; d=json.load(sys.stdin); print('OK' if 'properties' in str(d) or 'totalProperties' in str(d) else 'FAIL')" 2>/dev/null)
check "$([ "$STATS_OK" = "OK" ] && echo true)" "Admin Stats"

# Create test property
TEST_SLUG="autotest-$(date +%s)"
CREATE=$(curl -s -X POST -b /tmp/admin_cookie.txt "$BASE/api/admin/properties" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Auto Test Property\",\"slug\":\"$TEST_SLUG\",\"address\":\"999 Test St\",\"neighborhood\":\"Test\",\"bedrooms\":1,\"bathrooms\":1}")
NEW_ID=$(echo "$CREATE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('property',{}).get('id','') or d.get('id',''))" 2>/dev/null)
check "$([ -n "$NEW_ID" ] && echo true)" "创建物业 $NEW_ID"

if [ -n "$NEW_ID" ]; then
  # Read
  GET_TITLE=$(curl -s -b /tmp/admin_cookie.txt "$BASE/api/admin/properties/$NEW_ID" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('property',{}).get('title','') or d.get('title',''))" 2>/dev/null)
  check "$([ "$GET_TITLE" = "Auto Test Property" ] && echo true)" "查询物业"
  
  # Delete
  DEL_CODE=$(curl -s -X DELETE -b /tmp/admin_cookie.txt "$BASE/api/admin/properties/$NEW_ID" -o /dev/null -w "%{http_code}")
  check "$([ "$DEL_CODE" = "200" ] && echo true)" "删除物业"
fi

# Permission test
FORBIDDEN=$(curl -s -b /tmp/test_cookie.txt "$BASE/api/admin/stats" -o /dev/null -w "%{http_code}")
check "$([ "$FORBIDDEN" = "401" ] || [ "$FORBIDDEN" = "403" ] && echo true)" "普通用户→admin: $FORBIDDEN"

# ============ 第三层：表单 API ============
echo ""
echo "▸ 第三层：表单 API"

for TYPE in agents hosts business students long_term contact market_insights; do
  RESULT=$(curl -s -X POST "$BASE/api/inquiries" -H "Content-Type: application/json" \
    -d "{\"type\":\"$TYPE\",\"payload\":{\"email\":\"test@test.com\",\"name\":\"Test\"}}" -o /dev/null -w "%{http_code}")
  check "$([ "$RESULT" = "200" ] || [ "$RESULT" = "201" ] && echo true)" "inquiry/$TYPE → $RESULT"
done

# ============ 结果 ============
echo ""
echo "============================================"
if [ "$FAIL" -eq 0 ]; then
  echo "  🎉 全部通过: $PASS/$TOTAL"
else
  echo "  ⚠️  结果: $PASS/$TOTAL 通过, $FAIL 失败"
fi
echo "============================================"

rm -f /tmp/test_cookie.txt /tmp/admin_cookie.txt
exit $FAIL
