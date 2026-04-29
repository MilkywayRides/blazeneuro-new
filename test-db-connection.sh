#!/bin/bash

echo "🔍 Testing Search Interactions Database..."
echo ""

export DATABASE_URL="postgresql://neondb_owner:npg_omqVAiyewt81@ep-frosty-salad-anpy42p8-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"

echo "1️⃣ Checking table exists..."
psql "$DATABASE_URL" -c "\d search_interactions" 2>&1 | head -20

echo ""
echo "2️⃣ Current row count..."
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM search_interactions;"

echo ""
echo "3️⃣ Inserting test record..."
psql "$DATABASE_URL" -c "INSERT INTO search_interactions (query, result_id, result_title, result_description, clicked, position, ai_score) VALUES ('test', 'test-123', 'Test Blog', 'Test description', true, 0, 0);"

echo ""
echo "4️⃣ Verifying insert..."
psql "$DATABASE_URL" -c "SELECT * FROM search_interactions ORDER BY created_at DESC LIMIT 1;"

echo ""
echo "5️⃣ Cleaning up test record..."
psql "$DATABASE_URL" -c "DELETE FROM search_interactions WHERE result_id = 'test-123';"

echo ""
echo "✅ Database test complete!"
