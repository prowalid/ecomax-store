
ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS show_in text NOT NULL DEFAULT 'none' CHECK (show_in IN ('header', 'footer', 'both', 'none'));
