#!/bin/bash
# Update property amenities in D1 database

ACCOUNT_ID="84e5534ae694a084f23f58020bd73c7b"
DATABASE_ID="f667afae-6f66-4e4a-960a-37096eabdf03"
TOKEN="ox5nI0AJluVEVvxBNqegxwAi5SKha5qmvCnyuGZu"

API_URL="https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query"

# Update 55 Cooper St amenities
curl -s -X POST "$API_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "UPDATE Property SET includedAmenities = \"WiFi, Utilities included, Cleaning once per month, 1 Underground parking, Smart lock self check-in, Full kitchenware, Linens and towels, Basic cable\", updatedAt = datetime(\"now\") WHERE id = \"1\""
  }' | python3 -c "import json,sys; d=json.load(sys.stdin); print('Cooper amenities:', 'success' if d['success'] else d)"

# Update 238 Simcoe St amenities
curl -s -X POST "$API_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "UPDATE Property SET includedAmenities = \"WiFi, Utilities included, Cleaning once per month, 1 Underground parking, Smart lock self check-in, Full kitchenware, Linens and towels\", updatedAt = datetime(\"now\") WHERE id = \"2\""
  }' | python3 -c "import json,sys; d=json.load(sys.stdin); print('Simcoe amenities:', 'success' if d['success'] else d)"

# Update 22 Wellesley St amenities
curl -s -X POST "$API_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "UPDATE Property SET includedAmenities = \"WiFi, Utilities included, Cleaning once per month, 1 Underground parking, Full kitchen, Smart lock self check-in, Full kitchenware, Linens and towels\", updatedAt = datetime(\"now\") WHERE id = \"3\""
  }' | python3 -c "import json,sys; d=json.load(sys.stdin); print('Wellesley amenities:', 'success' if d['success'] else d)"

echo "Done!"
