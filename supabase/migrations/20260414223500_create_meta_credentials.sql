CREATE TABLE IF NOT EXISTS public.meta_credentials (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    facebook_page_id TEXT,
    facebook_page_access_token TEXT,
    instagram_account_id TEXT,
    instagram_access_token TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.meta_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own meta credentials" ON public.meta_credentials;
CREATE POLICY "Users can manage their own meta credentials" ON public.meta_credentials
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
