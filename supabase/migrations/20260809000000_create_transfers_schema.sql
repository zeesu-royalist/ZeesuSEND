-- ================================================================
-- ZEESUSEND DATABASE MIGRATION & STORAGE SETUP
-- ================================================================

-- 1. Create Transfers Table
CREATE TABLE IF NOT EXISTS public.transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_key TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NULL,
    download_limit INTEGER NULL,
    download_count INTEGER NOT NULL DEFAULT 0
);

-- 2. Create Transfer Items Table
CREATE TABLE IF NOT EXISTS public.transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID NOT NULL REFERENCES public.transfers(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('file', 'image', 'text')),
    file_name TEXT NULL,
    file_path TEXT NULL,
    mime_type TEXT NULL,
    file_size BIGINT NULL,
    text_content TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Indexes for High Performance Key Lookups & Expiration Cleaning
CREATE INDEX IF NOT EXISTS idx_transfers_key ON public.transfers(transfer_key);
CREATE INDEX IF NOT EXISTS idx_transfers_expires_at ON public.transfers(expires_at);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON public.transfers(status);
CREATE INDEX IF NOT EXISTS idx_transfer_items_transfer_id ON public.transfer_items(transfer_id);

-- 4. Atomic Download Count Increment Function (Prevents Race Conditions)
CREATE OR REPLACE FUNCTION public.increment_transfer_download_count(p_transfer_id UUID)
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
    SELECT download_count, download_limit, expires_at, status 
    INTO v_download_count, v_download_limit, v_expires_at, v_status
    FROM public.transfers
    WHERE id = p_transfer_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 0, 0, 'Transfer not found';
        RETURN;
    END IF;

    IF v_expires_at IS NOT NULL AND v_expires_at <= NOW() THEN
        UPDATE public.transfers SET status = 'expired' WHERE id = p_transfer_id;
        RETURN QUERY SELECT FALSE, v_download_count, v_download_limit, 'Transfer has expired';
        RETURN;
    END IF;

    IF v_download_limit IS NOT NULL AND v_download_count >= v_download_limit THEN
        UPDATE public.transfers SET status = 'download_limit_reached' WHERE id = p_transfer_id;
        RETURN QUERY SELECT FALSE, v_download_count, v_download_limit, 'Download limit reached';
        RETURN;
    END IF;

    v_download_count := v_download_count + 1;

    IF v_download_limit IS NOT NULL AND v_download_count >= v_download_limit THEN
        UPDATE public.transfers 
        SET download_count = v_download_count, status = 'download_limit_reached' 
        WHERE id = p_transfer_id;
    ELSE
        UPDATE public.transfers 
        SET download_count = v_download_count 
        WHERE id = p_transfer_id;
    END IF;

    RETURN QUERY SELECT TRUE, v_download_count, v_download_limit, 'Download count updated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Row Level Security Policies for Anonymous Sharing (PostgreSQL Tables)
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert on transfers" ON public.transfers;
CREATE POLICY "Allow public insert on transfers" ON public.transfers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select on transfers" ON public.transfers;
CREATE POLICY "Allow public select on transfers" ON public.transfers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public update on transfers" ON public.transfers;
CREATE POLICY "Allow public update on transfers" ON public.transfers FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public insert on transfer_items" ON public.transfer_items;
CREATE POLICY "Allow public insert on transfer_items" ON public.transfer_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select on transfer_items" ON public.transfer_items;
CREATE POLICY "Allow public select on transfer_items" ON public.transfer_items FOR SELECT USING (true);

-- 6. Supabase Storage Bucket & Storage Object RLS Policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('transfers', 'transfers', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public uploads to transfers bucket" ON storage.objects;
CREATE POLICY "Allow public uploads to transfers bucket" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'transfers');

DROP POLICY IF EXISTS "Allow public reads from transfers bucket" ON storage.objects;
CREATE POLICY "Allow public reads from transfers bucket" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'transfers');

DROP POLICY IF EXISTS "Allow public updates on transfers bucket" ON storage.objects;
CREATE POLICY "Allow public updates on transfers bucket" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'transfers');
