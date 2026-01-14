-- SQL for Supabase Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users ( 
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
  phone_id TEXT UNIQUE NOT NULL, 
  channel TEXT DEFAULT 'unknown',
  sub_status TEXT DEFAULT 'trial' CHECK (sub_status IN ('trial','paid','cancelled')), 
  is_blocked BOOLEAN DEFAULT FALSE,
  reminder_count INTEGER DEFAULT 0, 
  timezone TEXT DEFAULT 'UTC',
  last_active_at TIMESTAMP DEFAULT NOW(),
  payment_id TEXT,
  is_erased BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() 
); 

-- RPC to safely increment reminder count
CREATE OR REPLACE FUNCTION increment_reminder_count(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET reminder_count = reminder_count + 1,
      last_active_at = NOW()
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE reminders ( 
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
  user_id UUID REFERENCES users(id), 
  task TEXT NOT NULL, 
  scheduled_at TIMESTAMPTZ NOT NULL, 
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','done','failed','cancelled')), 
  failure_reason TEXT,
  done_at TIMESTAMP, 
  created_at TIMESTAMP DEFAULT NOW() 
); 
