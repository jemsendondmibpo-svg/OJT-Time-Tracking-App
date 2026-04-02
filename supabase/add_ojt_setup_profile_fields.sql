ALTER TABLE public.ojt_setup
ADD COLUMN IF NOT EXISTS intern_name text,
ADD COLUMN IF NOT EXISTS course text,
ADD COLUMN IF NOT EXISTS school_name text,
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS assigned_department text,
ADD COLUMN IF NOT EXISTS immediate_supervisor text;
