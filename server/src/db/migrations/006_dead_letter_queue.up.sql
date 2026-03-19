CREATE TABLE IF NOT EXISTS dead_letter_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver TEXT NOT NULL,
  event_name TEXT NOT NULL,
  job_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  error TEXT NOT NULL,
  attempts_made INTEGER NOT NULL DEFAULT 1,
  max_attempts INTEGER,
  failed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolution_note TEXT
);

CREATE INDEX IF NOT EXISTS idx_dead_letter_queue_failed_at
  ON dead_letter_queue(failed_at DESC);

CREATE INDEX IF NOT EXISTS idx_dead_letter_queue_unresolved
  ON dead_letter_queue(failed_at DESC)
  WHERE resolved_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_dead_letter_queue_event_name
  ON dead_letter_queue(event_name, failed_at DESC);
