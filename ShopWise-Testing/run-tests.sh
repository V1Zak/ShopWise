#!/bin/bash

echo "🧪 Starting ShopWise UI Testing Suite"
echo "======================================"
echo ""

# Check if dev server is running
if ! lsof -ti:5173 > /dev/null 2>&1; then
  echo "❌ Dev server is not running on port 5173"
  echo "Please start ShopWise dev server first:"
  echo "  cd ~/Projects/ShopWise/apps/web && npx vite"
  exit 1
fi

echo "✅ Dev server is running"
echo ""

# Run tests
echo "Running tests..."
~/Projects/Chrome_tester/node_modules/.bin/chrometester run --config chrometester.config.js

echo ""
echo "======================================"
echo "✅ Testing complete!"
echo ""
echo "📊 View HTML report: open chrometester-report/index.html"
echo "🎥 View recordings: ls -la recordings/"
echo "📸 View screenshots: ls -la screenshots/"
