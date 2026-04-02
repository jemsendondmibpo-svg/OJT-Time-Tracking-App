ALTER TABLE public.time_logs
ADD COLUMN IF NOT EXISTS is_overtime boolean DEFAULT false;
