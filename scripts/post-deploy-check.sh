#!/bin/bash
# Post-deployment verification script
# Run this immediately after deployment

WEBSITE_URL="https://stayneos.com"
MAX_RETRIES=5
RETRY_DELAY=30

echo "🚀 Post-Deployment Verification"
echo "================================"
echo "Website: $WEBSITE_URL"
echo "Time: $(date)"
echo ""

# Wait for deployment to propagate
echo "⏳ Waiting for deployment to propagate..."
sleep 60

# Check with retries
for i in $(seq 1 $MAX_RETRIES); do
    echo ""
    echo "Attempt $i/$MAX_RETRIES..."
    
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$WEBSITE_URL" 2>/dev/null || echo "000")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo "✅ Website is accessible!"
        
        # Additional checks
        echo ""
        echo "Running additional checks..."
        
        # Check if images load
        IMG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$WEBSITE_URL/images/cooper-55-dining.jpg" 2>/dev/null || echo "000")
        if [ "$IMG_STATUS" = "200" ]; then
            echo "✅ Images loading correctly"
        else
            echo "⚠️  Images may have issues (HTTP $IMG_STATUS)"
        fi
        
        # Check content
        if curl -s "$WEBSITE_URL" | grep -q "StayNeos"; then
            echo "✅ Content rendering correctly"
        else
            echo "⚠️  Content may have issues"
        fi
        
        # Check response time
        RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$WEBSITE_URL" 2>/dev/null || echo "999")
        echo "⏱️  Response time: ${RESPONSE_TIME}s"
        
        echo ""
        echo "🎉 Deployment verification COMPLETE"
        exit 0
    else
        echo "❌ Website not accessible yet (HTTP $HTTP_STATUS)"
        
        if [ $i -lt $MAX_RETRIES ]; then
            echo "Waiting ${RETRY_DELAY}s before retry..."
            sleep $RETRY_DELAY
        fi
    fi
done

echo ""
echo "❌ Deployment verification FAILED after $MAX_RETRIES attempts"
echo "Manual intervention may be required"
exit 1
