-- ============================================================
-- DevStream — Supabase Schema + RLS
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── profiles ────────────────────────────────────────────────
-- One row per auth.users record. Auto-created via trigger.

CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  display_name  TEXT,
  avatar_url    TEXT,
  plan          TEXT NOT NULL DEFAULT 'free',   -- 'free' | 'pro'
  storage_used  BIGINT NOT NULL DEFAULT 0,       -- bytes
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── recordings ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.recordings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  title        TEXT NOT NULL DEFAULT 'Untitled Recording',
  description  TEXT,

  -- Storage
  storage_path TEXT NOT NULL,        -- e.g. "{user_id}/{id}.mp4"
  file_size    BIGINT,               -- bytes
  mime_type    TEXT DEFAULT 'video/webm',

  -- Playback
  duration     INTEGER,              -- seconds
  thumbnail_url TEXT,

  -- Sharing
  share_token  TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_public    BOOLEAN NOT NULL DEFAULT TRUE,

  -- Recording metadata
  meta         JSONB DEFAULT '{}'::JSONB,
  -- Example meta: { "recordedUrl": "https://example.com", "device": "iPhone 14 Pro",
  --                 "viewMode": "both", "viewportWidth": 375 }

  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;

-- Owner policies
CREATE POLICY "Users can read own recordings"
  ON public.recordings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recordings"
  ON public.recordings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recordings"
  ON public.recordings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recordings"
  ON public.recordings FOR DELETE
  USING (auth.uid() = user_id);

-- Public share policy (no auth required)
CREATE POLICY "Anyone can read public recordings"
  ON public.recordings FOR SELECT
  USING (is_public = TRUE);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS recordings_updated_at ON public.recordings;
CREATE TRIGGER recordings_updated_at
  BEFORE UPDATE ON public.recordings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Update profile storage_used when a recording is inserted/deleted
CREATE OR REPLACE FUNCTION public.sync_storage_used()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET storage_used = storage_used + COALESCE(NEW.file_size, 0) WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET storage_used = GREATEST(0, storage_used - COALESCE(OLD.file_size, 0)) WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS recordings_sync_storage ON public.recordings;
CREATE TRIGGER recordings_sync_storage
  AFTER INSERT OR DELETE ON public.recordings
  FOR EACH ROW EXECUTE FUNCTION public.sync_storage_used();

-- ── Storage bucket ───────────────────────────────────────────
-- Create this bucket in Supabase Dashboard → Storage, or uncomment:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('recordings', 'recordings', false)
-- ON CONFLICT DO NOTHING;

-- Storage RLS: users can only access their own folder
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can read own recordings"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own recordings"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS recordings_user_id_idx    ON public.recordings(user_id);
CREATE INDEX IF NOT EXISTS recordings_share_token_idx ON public.recordings(share_token);
CREATE INDEX IF NOT EXISTS recordings_created_at_idx  ON public.recordings(created_at DESC);
