DROP INDEX IF EXISTS idx_users_phone_unique;
ALTER TABLE users DROP COLUMN IF EXISTS recovery_code_expires_at;
ALTER TABLE users DROP COLUMN IF EXISTS recovery_code;
ALTER TABLE users DROP COLUMN IF EXISTS two_factor_secret;
ALTER TABLE users DROP COLUMN IF EXISTS two_factor_enabled;
ALTER TABLE users DROP COLUMN IF EXISTS phone;
ALTER TABLE users DROP COLUMN IF EXISTS name;
