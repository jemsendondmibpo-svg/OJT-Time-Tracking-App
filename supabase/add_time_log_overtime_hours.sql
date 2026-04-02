ALTER TABLE public.time_logs
ADD COLUMN IF NOT EXISTS overtime_hours numeric DEFAULT 0;
