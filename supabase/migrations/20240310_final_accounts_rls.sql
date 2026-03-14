-- FINAL FIX FOR ACCOUNTS (CAIXAS)
-- This re-enables security while ensuring the "PGRST204" error does not return.

-- 1. Ensure RLS is active
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- 2. Drop the corrupted or missing policies
DROP POLICY IF EXISTS "Tenant Isolation accounts" ON public.accounts;
DROP POLICY IF EXISTS "accounts_isolation" ON public.accounts;

-- 3. Create a comprehensive policy covering SELECT, INSERT, UPDATE, DELETE
-- We include "WITH CHECK" to allow the API to verify the row during insertion.
CREATE POLICY "accounts_strict_isolation" ON public.accounts
FOR ALL
TO authenticated
USING (institution_id = public.user_institution_id() OR public.is_admin_geral())
WITH CHECK (institution_id = public.user_institution_id() OR public.is_admin_geral());

-- 4. Force a reload of the API cache one last time
NOTIFY pgrst, 'reload schema';
