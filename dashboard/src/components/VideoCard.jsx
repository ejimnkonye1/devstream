import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase.js'

const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL || window.location.origin

function formatDuration(secs) {
  if (!secs) return null
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function formatBytes(bytes) {
  if (!bytes) return null
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function VideoCard({ recording, onDelete }) {
  const [copied, setCopied]       = useState(false)
  const [editing, setEditing]     = useState(false)
  const [editTitle, setEditTitle] = useState(recording.title ?? '')
  const videoRef = useRef(null)
  const meta = recording.meta || {}

  const shareUrl = recording.share_token
    ? `${DASHBOARD_URL}/share/${recording.share_token}`
    : null

  async function copyShareLink() {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Hover preview ─────────────────────────────────────────────────────────
  function handleMouseEnter() {
    if (!videoRef.current) return
    videoRef.current.muted = true
    videoRef.current.play().catch(() => {})
  }

  function handleMouseLeave() {
    if (!videoRef.current) return
    videoRef.current.pause()
    videoRef.current.currentTime = 0
  }

  // ── Inline title editing ──────────────────────────────────────────────────
  function startEdit() {
    setEditTitle(recording.title ?? '')
    setEditing(true)
  }

  async function commitEdit() {
    const trimmed = editTitle.trim()
    if (trimmed && trimmed !== recording.title) {
      await supabase.from('recordings').update({ title: trimmed }).eq('id', recording.id)
      // Reflect the change locally without a full refetch
      recording.title = trimmed
    }
    setEditing(false)
  }

  function handleTitleKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); commitEdit() }
    if (e.key === 'Escape') { setEditing(false); setEditTitle(recording.title ?? '') }
  }

  const duration  = formatDuration(recording.duration)
  const fileSize  = formatBytes(recording.file_size)
  const dateLabel = formatDate(recording.created_at)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
      {/* Video thumbnail / player */}
      <div
        className="aspect-video bg-gray-950 flex items-center justify-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {recording.signed_url ? (
          <video
            ref={videoRef}
            src={recording.signed_url}
            className="w-full h-full object-contain"
            controls
            preload="metadata"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-700">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
            <span className="text-xs">No preview</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          {/* Title — click to edit */}
          {editing ? (
            <input
              autoFocus
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleTitleKeyDown}
              className="w-full bg-transparent border border-blue-500 rounded px-1.5 py-0.5 text-white text-sm font-medium focus:outline-none"
            />
          ) : (
            <p
              className="text-white text-sm font-medium leading-snug line-clamp-2 cursor-pointer hover:text-blue-300 transition-colors"
              title="Click to rename"
              onClick={startEdit}
            >
              {recording.title}
            </p>
          )}

          <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-xs flex-wrap">
            <span>{dateLabel}</span>
            {duration  && <><span>·</span><span>{duration}</span></>}
            {fileSize  && <><span>·</span><span>{fileSize}</span></>}
            {meta.device && <><span>·</span><span>{meta.device}</span></>}
          </div>

          {meta.recordedUrl && (
            <p className="text-gray-600 text-xs mt-0.5 truncate" title={meta.recordedUrl}>
              {meta.recordedUrl}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto">
          {shareUrl && (
            <button
              onClick={copyShareLink}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
            >
              {copied ? (
                <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!</>
              ) : (
                <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy link</>
              )}
            </button>
          )}
          <button
            onClick={() => onDelete(recording.id)}
            title="Delete"
            className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-red-400 hover:bg-red-950 rounded-lg transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
