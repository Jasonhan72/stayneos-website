#!/bin/bash
# Update property prices in D1 database

ACCOUNT_ID="84e5534ae694a084f23f58020bd73c7b"
DATABASE_ID="f667afae-6f66-4e4a-960a-37096eabdf03"
TOKEN="ox5nI0AJluVEVvxBNqegxwAi5SKha5qmvCnyuGZu"

API_URL="https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query"

# Update 55 Cooper St (id=1)
curl -s -X POST "$API_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "UPDATE Property SET priceMonthly = 12000, priceQuarterly = 10800, priceAnnual = 9600, updatedAt = datetime(\"now\") WHERE id = \"1\""
  }' | python3 -c "import json,sys; d=json.load(sys.stdin); print('Cooper 55:', 'success' if d['success'] else d)"

# Update 238 Simcoe St (id=2)  
curl -s -X POST "$API_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "UPDATE Property SET priceMonthly = 8000, priceQuarterly = 7200, priceAnnual = 6400, updatedAt = datetime(\"now\") WHERE id = \"2\""
  }' | python3 -c "import json,sys; d=json.load(sys.stdin); print('Simcoe 238:', 'success' if d['success'] else d)"

# Update 22 Wellesley St (id=3)
curl -s -X POST "$API_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "UPDATE Property SET priceMonthly = 4000, priceQuarterly = 3600, priceAnnual = 3200, updatedAt = datetime(\"now\") WHERE id = \"3\""
  }' | python3 -c "import json,sys; d=json.load(sys.stdin); print('Wellesley 22:', 'success' if d['success'] else d)"

echo "Done!"
