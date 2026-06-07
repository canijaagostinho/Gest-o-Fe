-- Migration: Reset Prematurely Activated Subscriptions
-- Description: Sets the status of subscriptions that have no approved payments (but have a plan selected) back to suspended.

UPDATE public.subscriptions s
SET status = 'Suspensa por inadimplência',
    current_period_start = NULL,
    current_period_end = NULL
WHERE s.status = 'Ativa'
  AND s.plan_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 
      FROM public.subscription_payments p 
      WHERE p.subscription_id = s.id 
        AND p.status = 'approved'
  );
