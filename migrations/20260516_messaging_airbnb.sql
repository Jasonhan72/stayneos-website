-- Airbnb-style messaging metadata
ALTER TABLE Conversation ADD COLUMN booking_id TEXT;
CREATE INDEX IF NOT EXISTS idx_conversation_booking_id ON Conversation(booking_id);
