-- EMERGENCY RESET FOR ACCOUNTS
-- If this fixes the "PGRST204" on INSERT, we know the policies were the issue.

ALTER TABLE public.accounts DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant Isolation accounts" ON public.accounts;

-- Also check if we can insert now.
-- Filippi, please run this in SQL Editor.
