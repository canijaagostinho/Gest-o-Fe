-- Database Migration: Subscription System Overhaul
-- Description: Creates subscription audit logs and notification logs, updates triggers, and migrates existing subscription statuses to Portuguese.

-- 1. Create Subscription Audit Logs Table
CREATE TABLE IF NOT EXISTS public.subscription_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL if system automatic
    event_type VARCHAR(50) NOT NULL, -- 'suspension', 'reactivation', 'due_date_update', 'cancellation'
    status_before TEXT,
    status_after TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    suspension_date TIMESTAMP WITH TIME ZONE,
    suspension_reason TEXT,
    reactivation_date TIMESTAMP WITH TIME ZONE,
    amount_paid NUMERIC(15, 2),
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Subscription Notification Logs Table
CREATE TABLE IF NOT EXISTS public.subscription_notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    target_day INTEGER NOT NULL, -- e.g. 7, 3, 1, 0, -1, -3, -7, -15
    channel VARCHAR(50) NOT NULL, -- 'email', 'whatsapp', 'internal'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.subscription_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_notification_logs ENABLE ROW LEVEL SECURITY;

-- 4. Apply Strict Policies (Tenants can only read their own logs, general admin can read all)
DROP POLICY IF EXISTS "Tenant read access to subscription audit logs" ON public.subscription_audit_logs;
CREATE POLICY "Tenant read access to subscription audit logs"
ON public.subscription_audit_logs FOR SELECT
TO authenticated
USING (institution_id = public.user_institution_id() OR public.is_admin_geral());

DROP POLICY IF EXISTS "Tenant read access to subscription notification logs" ON public.subscription_notification_logs;
CREATE POLICY "Tenant read access to subscription notification logs"
ON public.subscription_notification_logs FOR SELECT
TO authenticated
USING (institution_id = public.user_institution_id() OR public.is_admin_geral());

-- 5. Update Trigger Function for New Institutions
CREATE OR REPLACE FUNCTION public.handle_new_institution_subscription()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.subscriptions (
        institution_id, 
        status, 
        trial_start, 
        trial_end, 
        current_period_start, 
        current_period_end
    )
    VALUES (
        NEW.id, 
        'Ativa', 
        timezone('utc'::text, now()), 
        timezone('utc'::text, now()) + interval '45 days',
        timezone('utc'::text, now()),
        timezone('utc'::text, now()) + interval '45 days'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Migrate Existing Subscription Statuses to Portuguese
UPDATE public.subscriptions
SET status = 'Ativa'
WHERE status IN ('active', 'trialing');

UPDATE public.subscriptions
SET status = 'Vencida'
WHERE status = 'past_due';

UPDATE public.subscriptions
SET status = 'Cancelada pelo cliente'
WHERE status = 'canceled';

-- Add unique constraint for (subscription_id, target_day, channel) on notifications to prevent duplicate inserts
ALTER TABLE public.subscription_notification_logs 
ADD CONSTRAINT uniq_sub_notif_log UNIQUE (subscription_id, target_day, channel);
