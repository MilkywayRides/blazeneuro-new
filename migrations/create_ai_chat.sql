CREATE TABLE IF NOT EXISTS ai_chat (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_chat_user_id ON ai_chat(user_id);
CREATE INDEX idx_ai_chat_created_at ON ai_chat(created_at);
