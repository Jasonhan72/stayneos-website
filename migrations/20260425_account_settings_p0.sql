ALTER TABLE User ADD COLUMN address TEXT;
ALTER TABLE User ADD COLUMN stripeCustomerId TEXT;

CREATE TABLE IF NOT EXISTS user_notification_preferences (
  user_id TEXT PRIMARY KEY,
  booking_confirmations INTEGER NOT NULL DEFAULT 1,
  booking_reminders INTEGER NOT NULL DEFAULT 1,
  special_offers INTEGER NOT NULL DEFAULT 0,
  newsletter INTEGER NOT NULL DEFAULT 1,
  host_payouts INTEGER NOT NULL DEFAULT 1,
  host_new_inquiries INTEGER NOT NULL DEFAULT 1,
  product_updates INTEGER NOT NULL DEFAULT 1,
  sms_booking_updates INTEGER NOT NULL DEFAULT 0,
  sms_promotions INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_payment_methods (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  stripe_payment_method_id TEXT NOT NULL UNIQUE,
  brand TEXT,
  last4 TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_payment_methods_user_id ON user_payment_methods(user_id);
