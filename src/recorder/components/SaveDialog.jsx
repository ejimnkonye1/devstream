/**
 * SaveDialog — modal shown after a recording stops.
 *
 * Options:
 *   A) Download locally  → existing behaviour, triggers file download.
 *   B) Save to Cloud     → uploads to Supabase, shows progress + share link.
 *
 * If the user is not signed in, option B shows a "Sign in" prompt that
 * opens the extension's auth window via background.js messaging.
 */

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import useUpload from '../hooks/useUpload.js'

const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:5174'

// ── Small helpers ────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDuration(secs) {
  if (!secs) return ''
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// ── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value }) {
  return (
    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-500 rounded-full transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SaveDialog({ blob, mimeType, duration, meta, onClose }) {
  const [user, setUser]       = useState(undefined) // undefined = loading
  const [title, setTitle]     = useState('')
  const [copied, setCopied]   = useState(false)

  const { state, progress, result, error: uploadError, upload, reset } = useUpload()

  // ── Check auth state ────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── Download locally ────────────────────────────────────────────────
  function handleDownload() {
    const ext = mimeType?.includes('mp4') ? 'mp4' : 'webm'
    const url = URL.createObjectURL(blob)
    const a   = document.createElement('a')
    a.href     = url
    a.download = `devstream-${Date.now()}.${ext}`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
    onClose()
  }

  // ── Upload to cloud ─────────────────────────────────────────────────
  async function handleUpload() {
    await upload({ blob, title, duration, meta })
  }

  // ── Open auth window ─────────────────────────────────────────────────
  function openAuth() {
    chrome.runtime.sendMessage({ type: 'OPEN_AUTH_WINDOW' })
  }

  // ── Copy share link ──────────────────────────────────────────────────
  async function copyLink() {
    if (!result?.share_token) return
    const url = `${DASHBOARD_URL}/share/${result.share_token}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Render ────────────────────────────────────────────────────────────

  const fileLabel = [
    formatDuration(duration),
    formatBytes(blob?.size),
  ].filter(Boolean).join(' · ')

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div>
            <p className="text-white font-semibold text-sm">Recording complete</p>
            {fileLabel && <p className="text-gray-500 text-xs mt-0.5">{fileLabel}</p>}
          </div>
          {state !== 'uploading' && (
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <div className="px-5 py-4 flex flex-col gap-4">

          {/* SUCCESS STATE */}
          {state === 'success' && result && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-green-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span className="text-sm font-medium">Saved to cloud</span>
              </div>

              <ProgressBar value={100} />

              <div className="flex flex-col gap-2">
                <button
                  onClick={copyLink}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {copied ? (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!</>
                  ) : (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy share link</>
                  )}
                </button>
                <a
                  href={`${DASHBOARD_URL}/dashboard`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center text-xs text-gray-400 hover:text-gray-200 transition-colors"
                >
                  View in dashboard →
                </a>
              </div>
            </div>
          )}

          {/* UPLOADING STATE */}
          {state === 'uploading' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <ProgressBar value={progress} />
            </div>
          )}

          {/* IDLE / ERROR STATE */}
          {(state === 'idle' || state === 'error') && (
            <>
              {uploadError && (
                <p className="text-red-400 text-xs bg-red-950 border border-red-900 rounded-lg px-3 py-2">
                  {uploadError}
                  <button onClick={reset} className="ml-2 underline">Try again</button>
                </p>
              )}

              {/* Download option */}
              <button
                onClick={handleDownload}
                className="flex items-center gap-3 w-full px-4 py-3 bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-xl text-left transition-colors group"
                style={{ '--tw-bg-opacity': 1 }}
              >
                <div className="flex items-center justify-center w-9 h-9 bg-gray-700 rounded-lg flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Download locally</p>
                  <p className="text-gray-500 text-xs">Save the file to your computer</p>
                </div>
              </button>

              {/* Cloud save option */}
              {user === undefined ? (
                /* Loading auth state */
                <div className="h-16 bg-gray-800 border border-gray-700 rounded-xl animate-pulse"/>
              ) : user === null ? (
                /* Not signed in */
                <button
                  onClick={openAuth}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-gray-800 hover:bg-gray-750 border border-dashed border-gray-700 rounded-xl text-left transition-colors"
                >
                  <div className="flex items-center justify-center w-9 h-9 bg-blue-600/20 rounded-lg flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><path d="M6 21v-1a6 6 0 0 1 12 0v1"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Save to cloud</p>
                    <p className="text-blue-400 text-xs">Sign in to upload & share →</p>
                  </div>
                </button>
              ) : (
                /* Signed in — show upload form */
                <div className="flex flex-col gap-3 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-9 h-9 bg-blue-600/20 rounded-lg flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Save to cloud</p>
                      <p className="text-gray-500 text-xs truncate max-w-44">{user.email}</p>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Recording title (optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  />

                  <button
                    onClick={handleUpload}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Upload & get share link
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
