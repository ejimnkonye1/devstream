/**
 * App — Root component for the DevStream recorder page.
 *
 * State owned here:
 *   url         — raw text in the URL bar
 *   activeUrl   — the URL currently loaded in both iframes
 *
 * Recording state lives in useRecorder.
 * Scroll / nav sync lives in useScrollSync (wired inside DualView).
 */

import { useState, useCallback } from 'react'
import ControlBar from './components/ControlBar.jsx'
import DualView from './components/DualView.jsx'
import useRecorder from './hooks/useRecorder.js'

function normaliseUrl(raw) {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  // Prepend https:// if no protocol is present.
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`
  }
  return trimmed
}

export default function App() {
  const [url, setUrl] = useState('')
  const [activeUrl, setActiveUrl] = useState('')

  const { isRecording, status, error, startRecording, stopRecording } = useRecorder()

  const handleLoadUrl = useCallback(() => {
    const resolved = normaliseUrl(url)
    if (!resolved) return
    // Update the URL bar with the normalised form.
    setUrl(resolved)
    setActiveUrl(resolved)
  }, [url])

  // Called by the scroll-sync hook when either iframe navigates.
  const handleNavigate = useCallback((newUrl) => {
    setUrl(newUrl)
    setActiveUrl(newUrl)
  }, [])

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
      <ControlBar
        url={url}
        onUrlChange={setUrl}
        onLoadUrl={handleLoadUrl}
        isRecording={isRecording}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        recordingStatus={status}
        recordingError={error}
      />

      {/* Recording hint banner */}
      {isRecording && (
        <div className="flex items-center justify-center gap-2 py-1 bg-red-950 border-b border-red-900 text-xs text-red-300 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 recording-dot" aria-hidden="true"/>
          Recording active — select this window in the screen picker if you haven't already.
        </div>
      )}

      <main className="flex-1 overflow-hidden">
        <DualView activeUrl={activeUrl} onNavigate={handleNavigate} />
      </main>
    </div>
  )
}
