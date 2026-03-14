-- Add all remaining missing columns for loans creation 
-- This aligns the DB schema with the Next.js LoanCreateData payload

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'late_fee_rate') THEN
        ALTER TABLE public.loans ADD COLUMN "late_fee_rate" NUMERIC(5, 2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'mora_rate') THEN
        ALTER TABLE public.loans ADD COLUMN "mora_rate" NUMERIC(5, 2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'end_date') THEN
        ALTER TABLE public.loans ADD COLUMN "end_date" DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'installments_count') THEN
        ALTER TABLE public.loans ADD COLUMN "installments_count" INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'frequency') THEN
        ALTER TABLE public.loans ADD COLUMN "frequency" TEXT;
    END IF;
END $$;

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
