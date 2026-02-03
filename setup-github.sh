#!/bin/bash

# StayNeos GitHub Setup Script
# Run this script to set up automatic deployment

echo "🚀 StayNeos GitHub Setup"
echo "========================"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "Installing via Homebrew..."
    brew install gh
fi

# Check if logged in
echo "🔍 Checking GitHub authentication..."
if ! gh auth status &> /dev/null; then
    echo "🔐 Please login to GitHub:"
    echo "   Run: gh auth login"
    echo ""
    echo "   Choose:"
    echo "   - GitHub.com"
    echo "   - HTTPS"
    echo "   - Login with web browser (easiest)"
    echo ""
    gh auth login
fi

# Create repository
echo "📦 Creating GitHub repository..."
REPO_NAME="stayneos-website"
if gh repo create "$REPO_NAME" --public --description "StayNeos - Premium Executive Apartment Rentals" --source=. --remote=origin --push 2>/dev/null; then
    echo "✅ Repository created and code pushed!"
else
    echo "⚠️  Repository may already exist, trying to push..."
    git push -u origin main
fi

# Add Cloudflare API Token as secret
echo ""
echo "🔑 Adding Cloudflare API Token to GitHub Secrets..."
read -p "Enter your Cloudflare API Token (or press Enter to skip): " CF_TOKEN

if [ -n "$CF_TOKEN" ]; then
    if gh secret set CLOUDFLARE_API_TOKEN -b"$CF_TOKEN"; then
        echo "✅ Cloudflare API Token added to GitHub Secrets"
    else
        echo "❌ Failed to add secret. Please add manually:"
        echo "   https://github.com/jasonhan72/stayneos-website/settings/secrets/actions"
    fi
else
    echo "⚠️  Skipped. Please add manually:"
    echo "   https://github.com/jasonhan72/stayneos-website/settings/secrets/actions"
    echo "   Secret name: CLOUDFLARE_API_TOKEN"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Repository: https://github.com/jasonhan72/$REPO_NAME"
echo "Live Site:  https://stayneos.com"
echo ""
echo "Next steps:"
echo "1. Visit https://github.com/jasonhan72/$REPO_NAME"
echo "2. Check Actions tab to see deployment status"
echo "3. Every push to 'main' branch will auto-deploy!"
echo ""
