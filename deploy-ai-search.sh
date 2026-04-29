#!/bin/bash

echo "🚀 Deploying AI Search System..."

# Install Modal
pip install modal

# Setup Modal token
echo "📝 Setting up Modal authentication..."
modal token new

# Deploy the model
echo "🤖 Deploying PyTorch model to Modal..."
modal deploy modal_search_ai.py

# Get the endpoint
echo "🔗 Getting Modal endpoint..."
modal app list

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Copy the Modal endpoint URL from above"
echo "2. Add to .env.local: MODAL_SEARCH_ENDPOINT=<your-url>"
echo "3. Run: psql \$DATABASE_URL < migrations/create_search_interactions.sql"
echo "4. Import AISearch component in your page"
