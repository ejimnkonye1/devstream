import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

function formatDuration(secs) {
  if (!secs) return null
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

// Fetches a short-lived signed URL for public playback.
function VideoPlayer({ storagePath }) {
  const [url, setUrl]     = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    supabase.storage
      .from('recordings')
      .createSignedUrl(storagePath, 3600) // 1-hour playback token
      .then(({ data, error }) => {
        if (error || !data?.signedUrl) { setFailed(true); return }
        setUrl(data.signedUrl)
      })
  }, [storagePath])

  if (failed) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        Video unavailable
      </div>
    )
  }

  if (!url) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <video
      src={url}
      controls
      autoPlay
      className="w-full h-full"
    />
  )
}

export default function Share() {
  const { token } = useParams()
  const [rec, setRec]         = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    supabase
      .from('recordings')
      .select('*')
      .eq('share_token', token)
      .eq('is_public', true)
      .single()
      .then(({ data, error }) => {
        setLoading(false)
        if (error || !data) { setNotFound(true); return }
        setRec(data)
      })
  }, [token])

  const meta = rec?.meta || {}

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="h-14 flex items-center px-6 border-b border-gray-800 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2 select-none hover:opacity-80 transition-opacity">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect width="22" height="22" rx="5" fill="#3B82F6"/>
            <polygon points="8,6 17,11 8,16" fill="white"/>
            <rect x="5" y="6" width="2" height="10" rx="1" fill="white"/>
          </svg>
          <span className="text-white font-bold text-sm tracking-tight">DevStream</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">

        {loading && (
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}

        {!loading && notFound && (
          <div className="text-center">
            <p className="text-white font-semibold text-lg mb-2">Recording not found</p>
            <p className="text-gray-500 text-sm">
              This link may have expired or the recording was deleted.
            </p>
          </div>
        )}

        {!loading && rec && (
          <div className="w-full max-w-4xl">
            {/* Title + metadata */}
            <h1 className="text-white font-bold text-2xl mb-2">{rec.title}</h1>
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-6 flex-wrap">
              <span>{formatDate(rec.created_at)}</span>
              {formatDuration(rec.duration) && (
                <><span>·</span><span>{formatDuration(rec.duration)}</span></>
              )}
              {meta.device && (
                <><span>·</span><span>{meta.device}</span></>
              )}
              {meta.recordedUrl && (
                <>
                  <span>·</span>
                  <a
                    href={meta.recordedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 truncate max-w-xs transition-colors"
                  >
                    {meta.recordedUrl}
                  </a>
                </>
              )}
            </div>

            {/* Video */}
            <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
              <VideoPlayer storagePath={rec.storage_path} />
            </div>

            {/* Footer note */}
            <p className="text-center text-gray-600 text-xs mt-4">
              Shared via DevStream ·{' '}
              <Link to="/login" className="text-blue-500 hover:text-blue-400 transition-colors">
                Sign up free
              </Link>
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
