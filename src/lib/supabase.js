/**
 * src/lib/supabase.js — Supabase client for the Chrome Extension.
 *
 * The anon key is safe to embed in client code when Supabase RLS is
 * properly configured — it is not a secret (see Supabase docs).
 *
 * Session persistence: we use a custom storage adapter backed by
 * chrome.storage.local so the session survives extension reloads and
 * is accessible to the background service worker.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[DevStream] Supabase env vars missing. ' +
    'Copy .env.example → .env and fill in your project values.'
  )
}

// ── Custom storage adapter — chrome.storage.local ─────────────────────────
// Supabase JS expects a synchronous localStorage-like interface, but it also
// supports async adapters when using createClient({ auth: { storage } }).

const chromeStorageAdapter = {
  getItem: (key) =>
    new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        resolve(localStorage.getItem(key))
        return
      }
      chrome.storage.local.get(key, (result) => resolve(result[key] ?? null))
    }),

  setItem: (key, value) =>
    new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        localStorage.setItem(key, value)
        resolve()
        return
      }
      chrome.storage.local.set({ [key]: value }, resolve)
    }),

  removeItem: (key) =>
    new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        localStorage.removeItem(key)
        resolve()
        return
      }
      chrome.storage.local.remove(key, resolve)
    }),
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: chromeStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// ── Helpers ───────────────────────────────────────────────────────────────

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function signOut() {
  await supabase.auth.signOut()
}
