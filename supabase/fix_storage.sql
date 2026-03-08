-- 1. Create the loans bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('loans', 'loans', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies for this bucket to ensure a clean state
DO $$
BEGIN
    DELETE FROM storage.policies WHERE bucket_id = 'loans';
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 3. Read policy: Allow anyone to view files (public bucket)
INSERT INTO storage.policies (name, bucket_id, definition, action)
VALUES ('Public Access', 'loans', '(bucket_id = ''loans''::text)', 'SELECT');

-- 4. Upload policy: Allow authenticated users to upload
INSERT INTO storage.policies (name, bucket_id, definition, check_at, action)
VALUES ('Authenticated users can upload', 'loans', '(bucket_id = ''loans''::text)', '(bucket_id = ''loans''::text)', 'INSERT');

-- 5. Delete policy: Allow authenticated users to delete (optional)
INSERT INTO storage.policies (name, bucket_id, definition, action)
VALUES ('Authenticated users can delete', 'loans', '(bucket_id = ''loans''::text)', 'DELETE');
