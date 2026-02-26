/**
 * ControlBar — Top bar with URL input and recording controls.
 */

export default function ControlBar({
  url,
  onUrlChange,
  onLoadUrl,
  isRecording,
  onStartRecording,
  onStopRecording,
  recordingStatus,
  recordingError,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onLoadUrl()
  }

  return (
    <header className="flex items-center gap-3 px-4 py-2.5 bg-gray-900 border-b border-gray-800 flex-shrink-0">
      {/* ── Wordmark ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 select-none">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <rect width="22" height="22" rx="5" fill="#3B82F6"/>
          <polygon points="8,6 17,11 8,16" fill="white"/>
          <rect x="5" y="6" width="2" height="10" rx="1" fill="white"/>
        </svg>
        <span className="text-white font-semibold text-sm tracking-tight">DevStream</span>
        <span className="text-gray-600 text-xs font-mono">v1</span>
      </div>

      {/* ── Divider ──────────────────────────────────────────────── */}
      <div className="w-px h-5 bg-gray-700" aria-hidden="true"/>

      {/* ── URL input + Load button ───────────────────────────────── */}
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <div className="flex flex-1 items-center bg-gray-800 border border-gray-700 rounded-md overflow-hidden focus-within:border-blue-500 transition-colors">
          {/* Globe icon */}
          <span className="pl-3 text-gray-500 flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </span>
          <input
            type="text"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com"
            spellCheck={false}
            className="flex-1 px-2.5 py-1.5 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none font-mono"
          />
        </div>

        <button
          onClick={onLoadUrl}
          disabled={!url.trim()}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-md font-medium transition-colors flex-shrink-0"
        >
          Load
        </button>
      </div>

      {/* ── Divider ──────────────────────────────────────────────── */}
      <div className="w-px h-5 bg-gray-700" aria-hidden="true"/>

      {/* ── Recording status + controls ───────────────────────────── */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {recordingError && (
          <span className="text-xs text-red-400 max-w-48 truncate" title={recordingError}>
            {recordingError}
          </span>
        )}
        {recordingStatus && !recordingError && (
          <span className="text-xs text-gray-400">{recordingStatus}</span>
        )}

        {!isRecording ? (
          <button
            onClick={onStartRecording}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm rounded-md font-medium transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-white inline-block flex-shrink-0" aria-hidden="true"/>
            Record
          </button>
        ) : (
          <button
            onClick={onStopRecording}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md font-medium transition-colors ring-1 ring-red-600"
          >
            <span className="w-2 h-2 bg-red-500 rounded-sm recording-dot inline-block flex-shrink-0" aria-hidden="true"/>
            Stop
          </button>
        )}
      </div>
    </header>
  )
}
