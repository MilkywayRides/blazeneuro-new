#!/bin/bash

echo "🧪 Testing Direct Database Insert..."

export DATABASE_URL="postgresql://neondb_owner:npg_omqVAiyewt81@ep-frosty-salad-anpy42p8-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"

echo "1️⃣ Inserting test interaction..."
psql "$DATABASE_URL" -c "
INSERT INTO search_interactions (query, result_id, result_title, result_description, clicked, position, ai_score) 
VALUES ('javascript tutorial', 'blog-456', 'Learn JavaScript', 'Complete JS guide', true, 0, 0);
"

echo ""
echo "2️⃣ Checking if it was inserted..."
psql "$DATABASE_URL" -c "SELECT * FROM search_interactions WHERE result_id = 'blog-456';"

echo ""
echo "3️⃣ Total count..."
psql "$DATABASE_URL" -c "SELECT COUNT(*) as total FROM search_interactions;"

echo ""
echo "✅ Test complete!"
