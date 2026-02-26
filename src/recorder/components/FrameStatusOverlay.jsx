/**
 * FrameStatusOverlay — Shown inside an iframe container when the frame is
 * loading, checking (ping sent), or blocked by X-Frame-Options / CSP.
 *
 * Rendered as an absolutely-positioned overlay so it sits on top of the
 * (invisible) blocked iframe without displacing layout.
 */

// ── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="28" height="28" viewBox="0 0 24 24"
      fill="none" stroke="#3B82F6" strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  )
}

// ── Lock icon ─────────────────────────────────────────────────────────────────

function LockIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function FrameStatusOverlay({ status, url }) {
  if (status === 'loaded' || status === 'idle') return null

  const isBlocked = status === 'blocked'

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-6 text-center"
      style={{ background: 'rgba(3, 7, 18, 0.94)', backdropFilter: 'blur(6px)' }}
    >
      {isBlocked ? (
        <>
          <LockIcon />
          <div className="flex flex-col gap-1.5">
            <p className="text-white text-sm font-semibold">Embedding blocked</p>
            <p className="text-gray-400 text-xs leading-relaxed max-w-56">
              This site uses <code className="text-gray-300 font-mono">X-Frame-Options</code> or{' '}
              <code className="text-gray-300 font-mono">CSP frame-ancestors</code> to prevent
              embedding in iframes.
            </p>
          </div>

          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Open in new tab
            </a>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-800/80 border border-gray-700">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className="text-gray-500 text-xs">Proxy mode coming in Phase 2</span>
          </div>
        </>
      ) : (
        <>
          <Spinner />
          <p className="text-gray-400 text-xs">
            {status === 'checking' ? 'Checking…' : 'Loading…'}
          </p>
        </>
      )}
    </div>
  )
}
