#!/bin/bash
# StayNeos Website Health Check & Auto-Fix Script
# This script runs after each deployment to verify website health

set -e

WEBSITE_URL="https://stayneos.com"
GITHUB_REPO="jasonhan72/stayneos-website"
LOG_FILE="/tmp/stayneos-health-check.log"

echo "🔍 StayNeos Health Check - $(date)" | tee "$LOG_FILE"
echo "================================" | tee -a "$LOG_FILE"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check HTTP status
check_url() {
    local url=$1
    local description=$2
    
    echo -n "Checking $description... " | tee -a "$LOG_FILE"
    
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}✓ OK${NC}" | tee -a "$LOG_FILE"
        return 0
    else
        echo -e "${RED}✗ FAILED (HTTP $HTTP_STATUS)${NC}" | tee -a "$LOG_FILE"
        ((ERRORS++))
        return 1
    fi
}

# Function to check if images are loading
check_images() {
    echo -n "Checking image assets... " | tee -a "$LOG_FILE"
    
    # Check a sample image
    IMG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://stayneos.com/images/cooper-55-dining.jpg" 2>/dev/null || echo "000")
    
    if [ "$IMG_STATUS" = "200" ]; then
        echo -e "${GREEN}✓ OK${NC}" | tee -a "$LOG_FILE"
        return 0
    else
        echo -e "${RED}✗ FAILED (HTTP $IMG_STATUS)${NC}" | tee -a "$LOG_FILE"
        ((ERRORS++))
        return 1
    fi
}

# Function to check page content
check_content() {
    echo -n "Checking page content... " | tee -a "$LOG_FILE"
    
    # Check if key content exists
    if curl -s "$WEBSITE_URL" | grep -q "StayNeos"; then
        echo -e "${GREEN}✓ OK${NC}" | tee -a "$LOG_FILE"
        return 0
    else
        echo -e "${RED}✗ FAILED (Content missing)${NC}" | tee -a "$LOG_FILE"
        ((ERRORS++))
        return 1
    fi
}

# Function to check response time
check_performance() {
    echo -n "Checking response time... " | tee -a "$LOG_FILE"
    
    RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$WEBSITE_URL" 2>/dev/null || echo "999")
    
    # Check if response time is under 5 seconds
    if (( $(echo "$RESPONSE_TIME < 5" | bc -l) )); then
        echo -e "${GREEN}✓ OK (${RESPONSE_TIME}s)${NC}" | tee -a "$LOG_FILE"
        return 0
    else
        echo -e "${YELLOW}⚠ SLOW (${RESPONSE_TIME}s)${NC}" | tee -a "$LOG_FILE"
        ((WARNINGS++))
        return 1
    fi
}

# Function to check SSL certificate
check_ssl() {
    echo -n "Checking SSL certificate... " | tee -a "$LOG_FILE"
    
    SSL_INFO=$(curl -s -vI "https://stayneos.com" 2>&1 | grep -i "ssl\|certificate" | head -3)
    
    if [ -n "$SSL_INFO" ]; then
        echo -e "${GREEN}✓ OK${NC}" | tee -a "$LOG_FILE"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}" | tee -a "$LOG_FILE"
        ((ERRORS++))
        return 1
    fi
}

# Function to auto-fix issues
auto_fix() {
    echo "" | tee -a "$LOG_FILE"
    echo "🔧 Attempting auto-fix..." | tee -a "$LOG_FILE"
    
    cd /Users/neos/.openclaw/workspace/stayneos-web || exit 1
    
    # Pull latest changes
    git pull origin main 2>/dev/null || echo "Already up to date"
    
    # Rebuild
    echo "Rebuilding project..." | tee -a "$LOG_FILE"
    npm install 2>&1 | tail -5 | tee -a "$LOG_FILE"
    npm run build 2>&1 | tail -10 | tee -a "$LOG_FILE"
    
    # Redeploy
    echo "Redeploying to Cloudflare..." | tee -a "$LOG_FILE"
    export CLOUDFLARE_API_TOKEN=e3sE_jRJyZNY1YQ7sBoyh5ZtBTgVkF44vSOUiagO
    export CLOUDFLARE_ACCOUNT_ID=84e5534ae694a084f23f58020bd73c7b
    npx wrangler pages deploy dist --project-name=stayneos --branch=main 2>&1 | tail -5 | tee -a "$LOG_FILE"
    
    echo "✅ Auto-fix completed" | tee -a "$LOG_FILE"
    
    # Wait for deployment
    echo "Waiting 60 seconds for deployment to propagate..." | tee -a "$LOG_FILE"
    sleep 60
    
    # Re-run checks
    echo "" | tee -a "$LOG_FILE"
    echo "🔄 Re-checking after fix..." | tee -a "$LOG_FILE"
    ERRORS=0
    WARNINGS=0
    run_checks
}

# Function to run all checks
run_checks() {
    echo "" | tee -a "$LOG_FILE"
    echo "Running Health Checks..." | tee -a "$LOG_FILE"
    echo "------------------------" | tee -a "$LOG_FILE"
    
    check_url "$WEBSITE_URL" "Homepage"
    check_url "$WEBSITE_URL/properties" "Properties page"
    check_url "$WEBSITE_URL/properties/1" "Property detail page"
    check_images
    check_content
    check_performance
    check_ssl
}

# Function to send report
send_report() {
    local status=$1
    
    echo "" | tee -a "$LOG_FILE"
    echo "================================" | tee -a "$LOG_FILE"
    echo "📊 Health Check Summary" | tee -a "$LOG_FILE"
    echo "================================" | tee -a "$LOG_FILE"
    echo "Status: $status" | tee -a "$LOG_FILE"
    echo "Errors: $ERRORS" | tee -a "$LOG_FILE"
    echo "Warnings: $WARNINGS" | tee -a "$LOG_FILE"
    echo "Time: $(date)" | tee -a "$LOG_FILE"
    
    # Output for WhatsApp notification
    echo ""
    echo "STAYNEOS_HEALTH_REPORT"
    echo "Status: $status"
    echo "Errors: $ERRORS"
    echo "Warnings: $WARNINGS"
    echo "URL: $WEBSITE_URL"
}

# Main execution
run_checks

if [ $ERRORS -gt 0 ]; then
    echo "" | tee -a "$LOG_FILE"
    echo "❌ Health check FAILED with $ERRORS error(s)" | tee -a "$LOG_FILE"
    
    # Attempt auto-fix
    auto_fix
    
    if [ $ERRORS -gt 0 ]; then
        send_report "FAILED_AFTER_FIX"
        exit 1
    else
        send_report "FIXED"
        exit 0
    fi
elif [ $WARNINGS -gt 0 ]; then
    send_report "WARNING"
    exit 0
else
    send_report "HEALTHY"
    exit 0
fi
