-- Migration: Operation Logs (Administrative Monitoring)
-- Creates a generic, dedicated table for trailing financial operations (Loans, Payments, Updates, Cancellations) per institution.

CREATE TABLE IF NOT EXISTS public.operation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    operation_id UUID, -- Reference to the specific loan ID or payment ID
    type VARCHAR(50) NOT NULL, -- e.g., 'Empréstimo', 'Pagamento', 'Atualização', 'Cancelamento'
    amount NUMERIC(15, 2), -- The financial value involved
    status VARCHAR(50), -- e.g., 'success', 'failed', 'reversed'
    observations TEXT, -- Any optional notes
    metadata JSONB, -- For saving before/after states or other rich details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_operation_logs_institution_id ON public.operation_logs(institution_id);
CREATE INDEX IF NOT EXISTS idx_operation_logs_user_id ON public.operation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_operation_logs_type ON public.operation_logs(type);
CREATE INDEX IF NOT EXISTS idx_operation_logs_created_at ON public.operation_logs(created_at);

-- Row Level Security (RLS)
ALTER TABLE public.operation_logs ENABLE ROW LEVEL SECURITY;

-- 1. Tenants can only read their own institution's logs
DROP POLICY IF EXISTS "Institution members can view their own operation logs" ON public.operation_logs;
CREATE POLICY "Institution members can view their own operation logs"
ON public.operation_logs FOR SELECT
TO authenticated
USING (institution_id = public.user_institution_id());

-- 2. Only the system/actions can insert logs (or service role)
-- Prevent regular users from manually inserting falsified logs
DROP POLICY IF EXISTS "Only authenticated users can insert operation logs" ON public.operation_logs;
CREATE POLICY "Only authenticated users can insert operation logs"
ON public.operation_logs FOR INSERT
TO authenticated
WITH CHECK (institution_id = public.user_institution_id() AND user_id = auth.uid());

-- 3. Operations logs are IMMUTABLE. No one can UPDATE or DELETE them.
-- (No policies created for UPDATE or DELETE intentionally)
