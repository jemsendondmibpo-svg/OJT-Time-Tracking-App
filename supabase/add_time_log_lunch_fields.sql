ALTER TABLE public.time_logs
ADD COLUMN IF NOT EXISTS lunch_start time,
ADD COLUMN IF NOT EXISTS lunch_end time;
