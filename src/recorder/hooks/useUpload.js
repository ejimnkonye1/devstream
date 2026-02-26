/**
 * useUpload — uploads a recorded Blob to Supabase Storage and
 * inserts a metadata row into the recordings table.
 *
 * Storage path: recordings/{user_id}/{recording_id}.{ext}
 *
 * Returns { state, progress, result, error, upload, reset }
 *   state    — 'idle' | 'uploading' | 'success' | 'error'
 *   progress — 0–100
 *   result   — recording row on success
 */

import { useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase.js'

export default function useUpload() {
  const [state, setstate]       = useState('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult]     = useState(null)
  const [error, setError]       = useState(null)

  const reset = useCallback(() => {
    setstate('idle')
    setProgress(0)
    setResult(null)
    setError(null)
  }, [])

  const upload = useCallback(async ({ blob, title, duration, meta = {} }) => {
    setstate('uploading')
    setProgress(0)
    setError(null)
    setResult(null)

    try {
      // ── 1. Verify session ────────────────────────────────────────────
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in.')

      // ── 2. Build storage path ────────────────────────────────────────
      const id  = crypto.randomUUID()
      const ext = blob.type.includes('mp4') ? 'mp4' : 'webm'
      const storagePath = `${user.id}/${id}.${ext}`

      // ── 3. Upload blob ───────────────────────────────────────────────
      // Supabase JS v2 does not expose upload progress natively;
      // we simulate it with a timer that advances to 90 % then jumps
      // to 100 % after the await resolves.
      let tick = 0
      const fakeTimer = setInterval(() => {
        tick = Math.min(tick + 8, 88)
        setProgress(tick)
      }, 300)

      const { error: storageErr } = await supabase.storage
        .from('recordings')
        .upload(storagePath, blob, { contentType: blob.type, upsert: false })

      clearInterval(fakeTimer)
      if (storageErr) throw storageErr
      setProgress(93)

      // ── 4. Build a signed URL (1-year expiry) ────────────────────────
      const { data: signedData, error: signedErr } = await supabase.storage
        .from('recordings')
        .createSignedUrl(storagePath, 60 * 60 * 24 * 365)
      if (signedErr) throw signedErr

      setProgress(96)

      // ── 5. Insert metadata row ───────────────────────────────────────
      const { data: row, error: dbErr } = await supabase
        .from('recordings')
        .insert({
          id,
          user_id:      user.id,
          title:        title?.trim() || `Recording ${new Date().toLocaleString()}`,
          storage_path: storagePath,
          file_size:    blob.size,
          mime_type:    blob.type,
          duration:     duration ?? null,
          meta,
        })
        .select()
        .single()

      if (dbErr) throw dbErr

      setProgress(100)
      setResult({ ...row, signedUrl: signedData.signedUrl })
      setstate('success')
    } catch (err) {
      setError(err.message ?? 'Upload failed.')
      setstate('error')
    }
  }, [])

  return { state, progress, result, error, upload, reset }
}
