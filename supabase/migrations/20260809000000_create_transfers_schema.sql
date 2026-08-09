-- ================================================================
-- ZEESUSEND DATABASE MIGRATION & STORAGE SETUP
-- ================================================================

-- 1. Create Transfers Table
CREATE TABLE IF NOT EXISTS transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_key TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NULL,
    download_limit INTEGER NULL,
    download_count INTEGER NOT NULL DEFAULT 0
);

-- 2. Create Transfer Items Table
CREATE TABLE IF NOT EXISTS transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID NOT NULL REFERENCES transfers(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('file', 'image', 'text')),
    file_name TEXT NULL,
    file_path TEXT NULL,
    mime_type TEXT NULL,
    file_size BIGINT NULL,
    text_content TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Indexes for High Performance Key Lookups & Expiration Cleaning
CREATE INDEX IF NOT EXISTS idx_transfers_key ON transfers(transfer_key);
CREATE INDEX IF NOT EXISTS idx_transfers_expires_at ON transfers(expires_at);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers(status);
CREATE INDEX IF NOT EXISTS idx_transfer_items_transfer_id ON transfer_items(transfer_id);

-- 4. Atomic Download Count Increment Function (Prevents Race Conditions)
CREATE OR REPLACE FUNCTION increment_transfer_download_count(p_transfer_id UUID)
RETURNS TABLE (
    success BOOLEAN,
    current_count INTEGER,
    max_limit INTEGER,
    message TEXT
) AS $$
DECLARE
    v_download_count INTEGER;
    v_download_limit INTEGER;
    v_expires_at TIMESTAMPTZ;
    v_status TEXT;
BEGIN
    -- Lock record for update
    SELECT download_count, download_limit, expires_at, status 
    INTO v_download_count, v_download_limit, v_expires_at, v_status
    FROM transfers
    WHERE id = p_transfer_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 0, 0, 'Transfer not found';
        RETURN;
    END IF;

    -- Check if transfer expired
    IF v_expires_at IS NOT NULL AND v_expires_at <= NOW() THEN
        UPDATE transfers SET status = 'expired' WHERE id = p_transfer_id;
        RETURN QUERY SELECT FALSE, v_download_count, v_download_limit, 'Transfer has expired';
        RETURN;
    END IF;

    -- Check download limit
    IF v_download_limit IS NOT NULL AND v_download_count >= v_download_limit THEN
        UPDATE transfers SET status = 'download_limit_reached' WHERE id = p_transfer_id;
        RETURN QUERY SELECT FALSE, v_download_count, v_download_limit, 'Download limit reached';
        RETURN;
    END IF;

    -- Increment count
    v_download_count := v_download_count + 1;

    -- Update download count & status if limit hit
    IF v_download_limit IS NOT NULL AND v_download_count >= v_download_limit THEN
        UPDATE transfers 
        SET download_count = v_download_count, status = 'download_limit_reached' 
        WHERE id = p_transfer_id;
    ELSE
        UPDATE transfers 
        SET download_count = v_download_count 
        WHERE id = p_transfer_id;
    END IF;

    RETURN QUERY SELECT TRUE, v_download_count, v_download_limit, 'Download count updated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Row Level Security (RLS) Setup
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_items ENABLE ROW LEVEL SECURITY;

-- Since all client operations (creation, key lookup, signed URL downloads) 
-- are handled strictly server-side using the Service Role Key, direct public access is blocked.
CREATE POLICY "Deny public direct insert/update/delete on transfers"
    ON transfers FOR ALL
    USING (false);

CREATE POLICY "Deny public direct insert/update/delete on transfer_items"
    ON transfer_items FOR ALL
    USING (false);

-- 6. Private Supabase Storage Bucket Setup Script
-- Execute in Supabase SQL Editor if storage bucket creation is desired via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('transfers', 'transfers', false)
ON CONFLICT (id) DO NOTHING;

-- Lock storage bucket access to service role only
CREATE POLICY "Private access to transfers bucket"
    ON storage.objects FOR ALL
    USING (bucket_id = 'transfers' AND auth.role() = 'service_role');
