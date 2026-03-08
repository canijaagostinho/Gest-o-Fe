-- Migration: Enforce Strict Multi-Tenant Row Level Security
-- Description: Replaces the insecure "Allow all access for now" policies with strict, performance-optimized, institution-level isolation.

-- 1. Create Helper Functions for Performance and Security Context in the PUBLIC schema
CREATE OR REPLACE FUNCTION public.user_institution_id() RETURNS uuid AS $$
  SELECT institution_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin_geral() RETURNS boolean AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.users u 
    JOIN public.roles r ON u.role_id = r.id 
    WHERE u.id = auth.uid() AND r.name = 'admin_geral'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Drop existing insecure policies (if any exist they might conflict)
DO $$
DECLARE
    t_name text;
    p_name text;
BEGIN
    FOR t_name in (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        FOR p_name IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t_name) LOOP
            -- Drop ALL policies on public tables to ensure a clean slate
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p_name, t_name);
        END LOOP;
    END LOOP;
END $$;

-- 3. Enforce RLS on all primary tables
-- 3. Enforce RLS on all primary tables safely (ignores missing tables)
DO $$
DECLARE
    target_tables TEXT[] := ARRAY['institutions', 'users', 'clients', 'loans', 'installments', 'payments', 'loan_collateral', 'commissions', 'accounts', 'transactions', 'agents'];
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY target_tables
    LOOP
        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
        END IF;
    END LOOP;
END $$;

-- 4. Apply Strict Policies using the cached functions

-- Institutions: Normal users can only see their own. Admin Geral can do all.
DROP POLICY IF EXISTS "Institutions visibility" ON public.institutions;
CREATE POLICY "Institutions visibility" ON public.institutions FOR SELECT USING (id = public.user_institution_id() OR public.is_admin_geral());

DROP POLICY IF EXISTS "Institutions update" ON public.institutions;
CREATE POLICY "Institutions update" ON public.institutions FOR UPDATE USING (id = public.user_institution_id() OR public.is_admin_geral());

DROP POLICY IF EXISTS "Institutions admin all" ON public.institutions;
CREATE POLICY "Institutions admin all" ON public.institutions FOR ALL USING (public.is_admin_geral());

-- Users Table
DROP POLICY IF EXISTS "Users view own institution" ON public.users;
CREATE POLICY "Users view own institution" ON public.users FOR SELECT USING (institution_id = public.user_institution_id() OR public.is_admin_geral());

DROP POLICY IF EXISTS "Users edit own institution" ON public.users;
CREATE POLICY "Users edit own institution" ON public.users FOR UPDATE USING ((institution_id = public.user_institution_id() AND id = auth.uid()) OR public.is_admin_geral());

-- Macro to generate policies for all tables that have an `institution_id` column
DO $$
DECLARE
    target_tables TEXT[] := ARRAY['clients', 'loans', 'installments', 'payments', 'loan_collateral', 'commissions', 'accounts', 'transactions', 'agents'];
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY target_tables
    LOOP
        -- Check if table exists
        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl) THEN
            
            -- Only apply if the table actually has an institution_id column OR relates to an institution
            IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = tbl AND column_name = 'institution_id') THEN
                EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation %I" ON public.%I', tbl, tbl);
                EXECUTE format('CREATE POLICY "Tenant Isolation %I" ON public.%I FOR ALL USING (institution_id = public.user_institution_id() OR public.is_admin_geral())', tbl, tbl);
            ELSE
                -- Fallback: if table doesn't have institution_id, it must have a loan_id (payments, collateral)
                IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = tbl AND column_name = 'loan_id') THEN
                     EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation via Loan %I" ON public.%I', tbl, tbl);
                     EXECUTE format('CREATE POLICY "Tenant Isolation via Loan %I" ON public.%I FOR ALL USING (
                        loan_id IN (SELECT id FROM public.loans WHERE institution_id = public.user_institution_id()) 
                        OR public.is_admin_geral()
                     )', tbl, tbl);
                END IF;
            END IF;

        END IF;
    END LOOP;
END $$;
