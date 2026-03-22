#!/bin/bash
# Add maxGuests column and update values

ACCOUNT_ID="84e5534ae694a084f23f58020bd73c7b"
DATABASE_ID="f667afae-6f66-4e4a-960a-37096eabdf03"
TOKEN="ox5nI0AJluVEVvxBNqegxwAi5SKha5qmvCnyuGZu"

API_URL="https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query"

# Add maxGuests column
curl -s -X POST "$API_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "ALTER TABLE Property ADD COLUMN maxGuests INTEGER"
  }' | python3 -c "import json,sys; d=json.load(sys.stdin); print('Add column:', 'success' if d['success'] else d.get('errors', d))"

# Update 55 Cooper St - 6 guests
curl -s -X POST "$API_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "UPDATE Property SET maxGuests = 6 WHERE id = \"1\""
  }' | python3 -c "import json,sys; d=json.load(sys.stdin); print('Cooper maxGuests:', 'success' if d['success'] else d)"

# Update 238 Simcoe St - 5 guests
curl -s -X POST "$API_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "UPDATE Property SET maxGuests = 5 WHERE id = \"2\""
  }' | python3 -c "import json,sys; d=json.load(sys.stdin); print('Simcoe maxGuests:', 'success' if d['success'] else d)"

# Update 22 Wellesley St - 2 guests
curl -s -X POST "$API_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "UPDATE Property SET maxGuests = 2 WHERE id = \"3\""
  }' | python3 -c "import json,sys; d=json.load(sys.stdin); print('Wellesley maxGuests:', 'success' if d['success'] else d)"

echo "Done!"
