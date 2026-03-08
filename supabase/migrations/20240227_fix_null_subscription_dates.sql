-- Fix for existing institutions that were incorrectly marked as active without Dates

-- 1. If an institution is genuinely 'active' but has null dates, let's give them 30 days from today
UPDATE public.subscriptions
SET current_period_start = timezone('utc'::text, now()),
    current_period_end = timezone('utc'::text, now()) + interval '30 days'
WHERE status = 'active' AND current_period_end IS NULL;

-- 2. Wait, the user mentioned they should be on the 45 day free trial. Let's reset all active accounts without plans back to trial mode.
UPDATE public.subscriptions
SET status = 'trialing',
    trial_start = timezone('utc'::text, now()),
    trial_end = timezone('utc'::text, now()) + interval '45 days',
    current_period_start = NULL,
    current_period_end = NULL
WHERE (status = 'active' OR status = 'trialing') 
  AND plan_id IS NULL;
