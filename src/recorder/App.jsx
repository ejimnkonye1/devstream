import { useState, useCallback } from 'react'
import ControlBar from './components/ControlBar.jsx'
import DualView from './components/DualView.jsx'
import SaveDialog from './components/SaveDialog.jsx'
import useRecorder from './hooks/useRecorder.js'
import { DEFAULT_DEVICE_ID, findDevice } from './devices.js'

function normaliseUrl(raw) {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`
  return trimmed
}

export default function App() {
  const [url, setUrl]               = useState('')
  const [activeUrl, setActiveUrl]   = useState('')
  const [viewMode, setViewMode]     = useState('both')
  const [deviceId, setDeviceId]     = useState(DEFAULT_DEVICE_ID)
  const [landscape, setLandscape]   = useState(false)
  const [customWidth, setCustomWidth] = useState(null)
  const [mirrorMode, setMirrorMode] = useState(true)
  const [heightMode, setHeightMode] = useState('preset')

  const {
    isRecording, elapsed, elapsedLabel, status, error,
    pendingRecording, startRecording, stopRecording, clearPending,
  } = useRecorder()

  const handleLoadUrl = useCallback(() => {
    const resolved = normaliseUrl(url)
    if (!resolved) return
    setUrl(resolved)
    setActiveUrl(resolved)
  }, [url])

  const handleNavigate = useCallback((newUrl) => {
    setUrl(newUrl)
    setActiveUrl(newUrl)
  }, [])

  const handleDeviceChange = useCallback((id) => {
    setDeviceId(id); setCustomWidth(null); setLandscape(false)
  }, [])

  const handleLandscapeToggle = useCallback(() => {
    setLandscape((v) => !v); setCustomWidth(null)
  }, [])

  const device = findDevice(deviceId)

  const isSynced = mirrorMode && viewMode === 'both'

  // Metadata attached to every cloud upload
  const recordingMeta = {
    recordedUrl:   activeUrl,
    device:        device.label,
    viewMode,
    viewportWidth: customWidth ?? device.viewportWidth,
    landscape,
    mirrorMode,
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
      <ControlBar
        url={url} onUrlChange={setUrl} onLoadUrl={handleLoadUrl}
        viewMode={viewMode} onViewModeChange={setViewMode}
        deviceId={deviceId} onDeviceChange={handleDeviceChange}
        landscape={landscape} onLandscapeToggle={handleLandscapeToggle}
        customWidth={customWidth} onCustomWidthChange={setCustomWidth}
        device={device}
        mirrorMode={mirrorMode} onMirrorModeChange={setMirrorMode}
        heightMode={heightMode} onHeightModeChange={setHeightMode}
        isRecording={isRecording} elapsed={elapsed} elapsedLabel={elapsedLabel}
        onStartRecording={startRecording} onStopRecording={stopRecording}
        recordingStatus={status} recordingError={error}
      />

      {isRecording && (
        <div className="flex items-center justify-center gap-2 py-1 bg-red-950 border-b border-red-900 text-xs text-red-300 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 recording-dot" aria-hidden="true"/>
          Recording active — select this window in the screen picker if you haven't already.
          {isSynced && (
            <span className="ml-2 px-1.5 py-0.5 bg-green-900/50 text-green-400 rounded text-[9px] font-semibold tracking-wide leading-none">
              SYNCED
            </span>
          )}
        </div>
      )}

      <main className="flex-1 overflow-hidden">
        <DualView
          activeUrl={activeUrl} viewMode={viewMode}
          device={device} landscape={landscape} customWidth={customWidth}
          onNavigate={handleNavigate}
          mirrorMode={mirrorMode}
          heightMode={heightMode}
        />
      </main>

      {/* Post-recording save dialog */}
      {pendingRecording && (
        <SaveDialog
          blob={pendingRecording.blob}
          mimeType={pendingRecording.mimeType}
          duration={pendingRecording.duration}
          meta={recordingMeta}
          onClose={clearPending}
        />
      )}
    </div>
  )
}
