
-- Migration to fix missing tables for Loan Approval

-- 1. Installments (if not exists)
CREATE TABLE IF NOT EXISTS public.installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id),
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    amount_paid NUMERIC(15, 2) DEFAULT 0,
    status TEXT DEFAULT 'pending', -- pending, paid, overdue, cancelled
    payment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Loan Collateral
CREATE TABLE IF NOT EXISTS public.loan_collateral (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE,
    type TEXT,
    description TEXT,
    value NUMERIC(15, 2),
    image_url TEXT,
    location TEXT,
    documents JSONB, -- store array of {name, url}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Commissions
CREATE TABLE IF NOT EXISTS public.commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID, -- References agents table if it exists, otherwise just uuid
    loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id),
    amount NUMERIC(15, 2),
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Transactions (for account ledger)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES public.accounts(id), -- Needs accounts table
    institution_id UUID REFERENCES public.institutions(id),
    type TEXT, -- debit, credit
    amount NUMERIC(15, 2),
    description TEXT,
    reference_type TEXT, -- loan, payment, expense
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Accounts (Caixa) - if missing
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    balance NUMERIC(15, 2) DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    institution_id UUID REFERENCES public.institutions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Agents (if missing)
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    commission_rate NUMERIC(5, 2) DEFAULT 0,
    institution_id UUID REFERENCES public.institutions(id),
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Add columns to loans if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'agent_id') THEN
        ALTER TABLE public.loans ADD COLUMN agent_id UUID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'commission_amount') THEN
        ALTER TABLE public.loans ADD COLUMN commission_amount NUMERIC(15, 2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'created_by') THEN
        ALTER TABLE public.loans ADD COLUMN created_by UUID;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_collateral ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Simple Policies
CREATE POLICY "Enable all access for now" ON public.installments FOR ALL USING (true);
CREATE POLICY "Enable all access for now" ON public.loan_collateral FOR ALL USING (true);
CREATE POLICY "Enable all access for now" ON public.commissions FOR ALL USING (true);
CREATE POLICY "Enable all access for now" ON public.transactions FOR ALL USING (true);
CREATE POLICY "Enable all access for now" ON public.accounts FOR ALL USING (true);
CREATE POLICY "Enable all access for now" ON public.agents FOR ALL USING (true);
