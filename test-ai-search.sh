#!/bin/bash

echo "🧪 Testing AI Search System..."
echo ""

ENDPOINT="https://work-ankit-mail--search-ranker-fastapi-app.modal.run"

echo "1️⃣ Testing rank endpoint..."
curl -X POST "$ENDPOINT/rank_results" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "neural networks",
    "results": [
      {"id": "1", "title": "Deep Learning", "description": "Neural networks guide", "views": 1000},
      {"id": "2", "title": "Machine Learning", "description": "ML basics", "views": 500}
    ]
  }' | jq '.'

echo ""
echo ""
echo "2️⃣ Testing train endpoint..."
curl -X POST "$ENDPOINT/train_model" \
  -H "Content-Type: application/json" \
  -d '{
    "batch": [
      {
        "query": "AI",
        "result": {"title": "Artificial Intelligence", "description": "AI overview"},
        "clicked": 1
      }
    ]
  }' | jq '.'

echo ""
echo ""
echo "✅ All tests complete!"
echo ""
echo "🌐 Visit: http://localhost:3000/ai-search"
