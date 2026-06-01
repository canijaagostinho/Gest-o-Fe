-- ============================================================
-- Migration: Data Retention & Privacy Policy Enforcement
-- Camada 6: Banco de Dados & Camada 11: Compliance e Privacidade
-- OWASP A02: Cryptographic Failures / Privacy by Design
-- ============================================================

-- 1. Create a dedicated audit table for data deletion requests (Right to be Forgotten)
CREATE TABLE IF NOT EXISTS public.data_deletion_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID NOT NULL REFERENCES public.clients(id) ON DELETE SET NULL,
    requested_by    UUID NOT NULL REFERENCES public.users(id),
    reason          TEXT,
    status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
    requested_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at    TIMESTAMPTZ,
    processed_by    UUID REFERENCES public.users(id),
    legal_hold      BOOLEAN NOT NULL DEFAULT false, -- If true, deletion is blocked by legal/regulatory hold
    notes           TEXT
);

-- Enable RLS on the deletion requests table
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage deletion requests
CREATE POLICY "deletion_requests_admin_only"
    ON public.data_deletion_requests
    FOR ALL
    USING (public.is_admin_geral() OR institution_id = public.user_institution_id())
    WITH CHECK (public.is_admin_geral());

-- 2. Create data_consent_records table to track user consent (LGPD/GDPR compliance)
CREATE TABLE IF NOT EXISTS public.data_consent_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    institution_id  UUID NOT NULL REFERENCES public.institutions(id),
    consent_type    TEXT NOT NULL CHECK (consent_type IN ('data_processing', 'marketing', 'third_party_sharing')),
    granted         BOOLEAN NOT NULL DEFAULT true,
    granted_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at      TIMESTAMPTZ,
    ip_address      TEXT,
    user_agent      TEXT,
    version         TEXT NOT NULL DEFAULT '1.0' -- Policy version at time of consent
);

ALTER TABLE public.data_consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consent_tenant_isolation"
    ON public.data_consent_records
    FOR ALL
    USING (institution_id = public.user_institution_id() OR public.is_admin_geral());

-- 3. Anonymization function: replaces PII with hashed/masked values (Right to be Forgotten)
-- Called when a deletion request is approved and the legal retention period has passed.
CREATE OR REPLACE FUNCTION public.anonymize_client(p_client_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.clients
    SET
        full_name    = 'ANONIMIZADO-' || substr(md5(id::text), 1, 8),
        id_number    = 'REMOVIDO',
        phone        = 'REMOVIDO',
        email        = NULL,
        address      = 'REMOVIDO',
        birth_date   = NULL,
        occupation   = NULL,
        status       = 'anonymized',
        updated_at   = now()
    WHERE id = p_client_id
      AND NOT EXISTS (
          -- Block anonymization if client has active or unpaid loans
          SELECT 1 FROM public.loans
          WHERE client_id = p_client_id
            AND status IN ('active', 'overdue')
      );

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Cliente não pôde ser anonimizado: possui empréstimos activos ou não encontrado.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Retention policy view: identifies clients eligible for anonymization
-- A client is eligible if: no active loans AND last loan was completed > 7 years ago
CREATE OR REPLACE VIEW public.clients_past_retention AS
SELECT
    c.id,
    c.full_name,
    c.institution_id,
    c.created_at,
    MAX(l.updated_at) AS last_loan_activity
FROM public.clients c
LEFT JOIN public.loans l ON l.client_id = c.id
WHERE c.status NOT IN ('anonymized')
GROUP BY c.id, c.full_name, c.institution_id, c.created_at
HAVING
    -- No active/overdue loans
    NOT EXISTS (
        SELECT 1 FROM public.loans
        WHERE client_id = c.id AND status IN ('active', 'overdue')
    )
    -- Last activity was more than 7 years ago (legal retention period)
    AND (MAX(l.updated_at) IS NULL OR MAX(l.updated_at) < now() - INTERVAL '7 years');

-- ============================================================
-- BACKUP STRATEGY DOCUMENTATION (Operational Reference)
-- ============================================================
-- The following are recommended backup configurations for production:
--
-- 1. CONTINUOUS WAL ARCHIVING (Point-in-Time Recovery):
--    - Enable pg_dump with WAL shipping to object storage
--    - Supabase Pro/Enterprise includes automated daily snapshots
--    - Supplement with: pg_dump -Fc gestaoflex_db > backup_$(date +%Y%m%d).dump
--
-- 2. BACKUP ENCRYPTION:
--    - Encrypt backup files using AES-256 before storage:
--    - openssl enc -aes-256-cbc -salt -in backup.dump -out backup.dump.enc -pass env:BACKUP_KEY
--
-- 3. CROSS-REGION REPLICATION:
--    - Store backup copies in a geographically separate bucket (e.g., Supabase → AWS S3 us-east-1)
--    - Use bucket versioning with 30-day deletion lock (WORM policy) against ransomware
--
-- 4. RETENTION SCHEDULE:
--    - Daily incremental backups: retained 30 days
--    - Weekly full backups: retained 6 months
--    - Monthly archives: retained 7 years (legal requirement for financial data)
--
-- 5. RECOVERY TESTING:
--    - Execute a full restore drill quarterly to validate RTO < 15 minutes
--    - Document results in the security incident log
-- ============================================================

COMMENT ON FUNCTION public.anonymize_client IS
'Anonymizes all PII fields of a client record upon approved data deletion request. Blocked if active loans exist (legal obligation).';

COMMENT ON TABLE public.data_deletion_requests IS
'Tracks Right-to-be-Forgotten requests per client. Required for LGPD/GDPR compliance.';

COMMENT ON TABLE public.data_consent_records IS
'Stores explicit consent records from clients for data processing activities.';
