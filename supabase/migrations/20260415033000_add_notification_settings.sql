ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS notification_sound_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS browser_notifications_enabled BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
