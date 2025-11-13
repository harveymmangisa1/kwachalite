-- Add quote_date field to quotes table for better tracking
ALTER TABLE public.quotes ADD COLUMN quote_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Add index for better performance
CREATE INDEX idx_quotes_date ON public.quotes(user_id, quote_date DESC);

-- Update existing quotes to have quote_date based on created_at
UPDATE public.quotes SET quote_date = created_at::DATE WHERE quote_date IS NULL;