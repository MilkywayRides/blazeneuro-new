#!/bin/bash

# Search Enhancement Deployment Script
# Run this script to deploy all search enhancements

set -e

echo "🔍 Search Enhancement Deployment"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
npm install

echo ""
echo "🗄️  Step 2: Database Migration"
echo "Note: Make sure your DATABASE_URL is set in .env"
echo ""
read -p "Do you want to run the database migration now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Running migration..."
    npx drizzle-kit push || echo "⚠️  Migration failed. You may need to run it manually on production."
else
    echo "⚠️  Skipping migration. Remember to run it manually:"
    echo "   npx drizzle-kit push"
fi

echo ""
echo "🏗️  Step 3: Building Android App..."
cd android
if [ -f "gradlew" ]; then
    chmod +x gradlew
    ./gradlew assembleDebug
    echo "✅ Android debug build complete!"
    echo "   APK location: android/app/build/outputs/apk/debug/app-debug.apk"
else
    echo "⚠️  Gradle wrapper not found. Skipping Android build."
fi
cd ..

echo ""
echo "🚀 Step 4: Deployment Options"
echo ""
echo "Option A - Vercel (Automatic):"
echo "   git add ."
echo "   git commit -m 'Add search tracking and trending searches'"
echo "   git push origin main"
echo ""
echo "Option B - Manual Deploy:"
echo "   npm run build"
echo "   # Then deploy the .next folder to your hosting"
echo ""

read -p "Do you want to commit and push changes now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add .
    git commit -m "feat: Add search tracking and trending searches

- Enhanced Android search UI with shadcn-style design
- Added magnification glass icon to search bar
- Implemented search query tracking in database
- Added trending searches display
- Created API endpoint for trending searches
- Updated mobile search API to track queries"
    
    echo ""
    read -p "Push to origin main? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push origin main
        echo "✅ Changes pushed! Vercel will auto-deploy."
    else
        echo "⚠️  Changes committed but not pushed. Push manually when ready."
    fi
else
    echo "⚠️  Changes not committed. Commit manually when ready."
fi

echo ""
echo "✨ Deployment Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Verify database migration ran successfully"
echo "2. Test the search functionality on blazeneuro.com"
echo "3. Install the new APK on Android device"
echo "4. Test trending searches and search tracking"
echo ""
echo "📄 See SEARCH_ENHANCEMENT.md for detailed documentation"
