-- Migration: Add Subscriptions and Payments Support
-- Description: Creates plans, subscriptions, and subscription_payments tables with trial logic.

-- 1. Plans Table
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,          -- e.g., 'Mensal', 'Trimestral', 'Semestral', 'Anual'
    description TEXT,
    price_amount NUMERIC(10, 2) NOT NULL,
    interval_months INTEGER NOT NULL, -- 1, 3, 6, 12
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert Default Plans
INSERT INTO public.plans (name, description, price_amount, interval_months)
VALUES 
    ('Mensal', 'Acesso completo ao MicroCred SaaS por 1 mês.', 800.00, 1),
    ('Trimestral', 'Acesso completo ao MicroCred SaaS por 3 meses (pagamento único).', 2100.00, 3),
    ('Semestral', 'Acesso completo ao MicroCred SaaS por 6 meses (pagamento único).', 3600.00, 6),
    ('Anual', 'Acesso completo ao MicroCred SaaS por 1 ano (pagamento único).', 6000.00, 12)
ON CONFLICT DO NOTHING;

-- 2. Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL UNIQUE,
    plan_id UUID REFERENCES public.plans(id),
    status TEXT NOT NULL DEFAULT 'trialing', -- trialing, active, past_due, canceled
    trial_start TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    trial_end TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) + interval '45 days',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Subscription Payments Table (For manual/receipt workflow first)
CREATE TABLE IF NOT EXISTS public.subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.plans(id) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected (for manual workflow)
    payment_method TEXT, -- mpesa_manual, bank_transfer, etc.
    receipt_url TEXT, -- URL to uploaded receipt image
    paid_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- Plans Policies
CREATE POLICY "Plans are visible to all authenticated users"
    ON public.plans FOR SELECT
    USING (true);

-- Subscriptions Policies
CREATE POLICY "Institutions can view their own subscriptions"
    ON public.subscriptions FOR SELECT
    USING (
        institution_id IN (
            SELECT institution_id FROM users WHERE id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.name = 'admin_geral'
        )
    );

CREATE POLICY "Only admin_geral can manage subscriptions directly"
    ON public.subscriptions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.name = 'admin_geral'
        )
    );

-- Subscription Payments Policies
CREATE POLICY "Institutions can view their payments"
    ON public.subscription_payments FOR SELECT
    USING (
        institution_id IN (
            SELECT institution_id FROM users WHERE id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.name = 'admin_geral'
        )
    );

CREATE POLICY "Institutions can create pending payments"
    ON public.subscription_payments FOR INSERT
    WITH CHECK (
        institution_id IN (
            SELECT institution_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Only admin_geral can update payments"
    ON public.subscription_payments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND r.name = 'admin_geral'
        )
    );


-- Trigger Function: Auto-create trial subscription for new institutions
CREATE OR REPLACE FUNCTION public.handle_new_institution_subscription()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.subscriptions (institution_id, status, trial_start, trial_end)
    VALUES (
        NEW.id, 
        'trialing', 
        timezone('utc'::text, now()), 
        timezone('utc'::text, now()) + interval '45 days'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger attached to institutions
DROP TRIGGER IF EXISTS on_institution_created_setup_subscription ON public.institutions;
CREATE TRIGGER on_institution_created_setup_subscription
    AFTER INSERT ON public.institutions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_institution_subscription();

-- Populate Subscriptions for existing institutions
INSERT INTO public.subscriptions (institution_id, status, trial_start, trial_end)
SELECT id, 'active', timezone('utc'::text, now()) - interval '45 days', timezone('utc'::text, now()) - interval '45 days'
FROM public.institutions
WHERE NOT EXISTS (
    SELECT 1 FROM public.subscriptions WHERE institution_id = public.institutions.id
);
-- We set active to avoid blocking existing clients immediately, they can be managed via UI later.
