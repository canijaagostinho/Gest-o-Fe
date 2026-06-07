-- Migration: Fix RLS Policies for plans, subscriptions, and subscription_payments
-- Description: Restores select permissions on plans, subscriptions, and subscription_payments.

-- 1. Policies for public.plans
DROP POLICY IF EXISTS "Plans are visible to all authenticated users" ON public.plans;
DROP POLICY IF EXISTS "Plans are visible to all users" ON public.plans;
DROP POLICY IF EXISTS "Plans visibility" ON public.plans;

-- Recreate policy so that anyone (including anonymous users for checkout/landing page if needed, and authenticated users) can select plans
CREATE POLICY "Plans are visible to all users"
ON public.plans FOR SELECT
USING (true);


-- 2. Policies for public.subscriptions
DROP POLICY IF EXISTS "Institutions can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Only admin_geral can manage subscriptions directly" ON public.subscriptions;
DROP POLICY IF EXISTS "Subscriptions visibility" ON public.subscriptions;
DROP POLICY IF EXISTS "Tenant select subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admin manage subscriptions" ON public.subscriptions;

-- Tenants and admin_geral can select subscriptions
CREATE POLICY "Tenant select subscriptions"
ON public.subscriptions FOR SELECT
TO authenticated
USING (
    institution_id = public.user_institution_id() 
    OR public.is_admin_geral()
);

-- Only admin_geral can insert, update, or delete subscriptions directly (usually done via service_role anyway, but good as a fallback)
CREATE POLICY "Admin manage subscriptions"
ON public.subscriptions FOR ALL
TO authenticated
USING (public.is_admin_geral())
WITH CHECK (public.is_admin_geral());


-- 3. Policies for public.subscription_payments
DROP POLICY IF EXISTS "Institutions can view their payments" ON public.subscription_payments;
DROP POLICY IF EXISTS "Institutions can create pending payments" ON public.subscription_payments;
DROP POLICY IF EXISTS "Only admin_geral can update payments" ON public.subscription_payments;
DROP POLICY IF EXISTS "Tenant select payments" ON public.subscription_payments;
DROP POLICY IF EXISTS "Tenant insert payments" ON public.subscription_payments;
DROP POLICY IF EXISTS "Admin update payments" ON public.subscription_payments;

-- Tenants and admin_geral can select payments
CREATE POLICY "Tenant select payments"
ON public.subscription_payments FOR SELECT
TO authenticated
USING (
    institution_id = public.user_institution_id() 
    OR public.is_admin_geral()
);

-- Tenants can insert payments for their own institution
CREATE POLICY "Tenant insert payments"
ON public.subscription_payments FOR INSERT
TO authenticated
WITH CHECK (
    institution_id = public.user_institution_id()
);

-- Only admin_geral can update or delete payments
CREATE POLICY "Admin update payments"
ON public.subscription_payments FOR UPDATE
TO authenticated
USING (public.is_admin_geral())
WITH CHECK (public.is_admin_geral());
