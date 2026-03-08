-- Migration: 20240303_update_trial_end_to_22h.sql
-- Description: Update the handle_new_institution_subscription trigger to set trial_end at exactly 22:00:00 UTC

CREATE OR REPLACE FUNCTION public.handle_new_institution_subscription()
RETURNS trigger AS $$
DECLARE
    target_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate 45 days from now, but set the time to 22:00:00 UTC
    target_date := date_trunc('day', timezone('utc'::text, now()) + interval '45 days') + interval '22 hours';

    INSERT INTO public.subscriptions (institution_id, status, trial_start, trial_end)
    VALUES (
        NEW.id, 
        'trialing', 
        timezone('utc'::text, now()), 
        target_date
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
