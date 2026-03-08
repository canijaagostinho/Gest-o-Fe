
-- Fix Loans Table Columns

ALTER TABLE public.loans ADD COLUMN IF NOT EXISTS agent_id UUID;
ALTER TABLE public.loans ADD COLUMN IF NOT EXISTS commission_amount NUMERIC(15, 2) DEFAULT 0;
ALTER TABLE public.loans ADD COLUMN IF NOT EXISTS created_by UUID;

-- Notify PostgREST to reload schema (getting it to actually do this is tricky specific to Supabase UI, usually just altering DDL does it)
NOTIFY pgrst, 'reload config';
