/**
 * ControlBar — URL bar, view-mode toggle, device controls, recording controls.
 *
 * Device controls (visible when viewMode !== 'desktop'):
 *   [Device ▾]  [width input px]  [↻ rotate]
 *
 * Recording section:
 *   [01:23]  [● Record / ■ Stop]
 */

import { useRef } from 'react'
import { DEVICES } from '../devices.js'

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconDesktop() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  )
}

function IconPhone() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2"/>
      <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5"/>
    </svg>
  )
}

function IconBoth() {
  return (
    <svg width="18" height="15" viewBox="0 0 28 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="17" height="12" rx="1.5"/>
      <line x1="6" y1="18" x2="13" y2="18"/>
      <line x1="9.5" y1="13" x2="9.5" y2="18"/>
      <rect x="19" y="5" width="8" height="14" rx="1.2"/>
      <line x1="23" y1="16.5" x2="23.01" y2="16.5" strokeWidth="2"/>
    </svg>
  )
}

function IconRotate({ landscape }) {
  // Shows portrait phone when in portrait (click to go landscape), and vice versa.
  return landscape ? (
    // Landscape phone → click to go portrait
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="10" rx="2"/>
      <path d="M17 2l3 3-3 3" /><path d="M7 22l-3-3 3-3"/>
    </svg>
  ) : (
    // Portrait phone → click to go landscape
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="2" width="10" height="20" rx="2"/>
      <path d="M22 17l-3 3-3-3"/><path d="M2 7l3-3 3 3"/>
    </svg>
  )
}

// ── Reusable pill button ───────────────────────────────────────────────────────

function ModeBtn({ active, onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={[
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all duration-150 select-none',
        active
          ? 'bg-gray-600 text-white shadow-inner'
          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ControlBar({
  url, onUrlChange, onLoadUrl,
  viewMode, onViewModeChange,
  deviceId, onDeviceChange,
  landscape, onLandscapeToggle,
  customWidth, onCustomWidthChange,
  device,
  isRecording, elapsed, elapsedLabel,
  onStartRecording, onStopRecording,
  recordingStatus, recordingError,
}) {
  const widthInputRef = useRef(null)

  const handleKeyDown = (e) => { if (e.key === 'Enter') onLoadUrl() }

  // Effective viewport width shown in the input.
  const displayWidth = customWidth ?? (landscape
    ? (device.shell.outerHeight - device.shell.borderWidth * 2)
    : device.viewportWidth)

  const handleWidthChange = (e) => {
    const val = parseInt(e.target.value, 10)
    if (!isNaN(val) && val >= 240 && val <= 2560) {
      onCustomWidthChange(val)
    } else if (e.target.value === '') {
      onCustomWidthChange(null) // revert to device default
    }
  }

  const showDeviceControls = viewMode !== 'desktop'

  return (
    <header className="flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-gray-800 flex-shrink-0 min-w-0">

      {/* ── Wordmark ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 select-none flex-shrink-0">
        <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <rect width="22" height="22" rx="5" fill="#3B82F6"/>
          <polygon points="8,6 17,11 8,16" fill="white"/>
          <rect x="5" y="6" width="2" height="10" rx="1" fill="white"/>
        </svg>
        <span className="text-white font-semibold text-sm tracking-tight">DevStream</span>
      </div>

      <div className="w-px h-4 bg-gray-700 flex-shrink-0" aria-hidden="true"/>

      {/* ── URL input ───────────────────────────────────────────────── */}
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <div className="flex flex-1 items-center bg-gray-800 border border-gray-700 rounded-md overflow-hidden focus-within:border-blue-500 transition-colors min-w-0">
          <span className="pl-2.5 text-gray-500 flex-shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            className="flex-1 px-2 py-1.5 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none font-mono min-w-0"
          />
        </div>
        <button
          onClick={onLoadUrl}
          disabled={!url.trim()}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs rounded-md font-medium transition-colors flex-shrink-0"
        >
          Load
        </button>
      </div>

      <div className="w-px h-4 bg-gray-700 flex-shrink-0" aria-hidden="true"/>

      {/* ── View mode toggle ─────────────────────────────────────────── */}
      <div
        className="flex items-center bg-gray-800 border border-gray-700 rounded-md p-0.5 gap-0.5 flex-shrink-0"
        role="group"
        aria-label="View mode"
      >
        <ModeBtn active={viewMode === 'desktop'} onClick={() => onViewModeChange('desktop')} title="Desktop only">
          <IconDesktop /><span>Desktop</span>
        </ModeBtn>
        <ModeBtn active={viewMode === 'both'} onClick={() => onViewModeChange('both')} title="Desktop + Mobile overlay">
          <IconBoth /><span>Both</span>
        </ModeBtn>
        <ModeBtn active={viewMode === 'mobile'} onClick={() => onViewModeChange('mobile')} title="Mobile only">
          <IconPhone /><span>Mobile</span>
        </ModeBtn>
      </div>

      {/* ── Device controls ──────────────────────────────────────────── */}
      {showDeviceControls && (
        <>
          <div className="w-px h-4 bg-gray-700 flex-shrink-0" aria-hidden="true"/>

          {/* Device preset selector */}
          <select
            value={deviceId}
            onChange={(e) => onDeviceChange(e.target.value)}
            className="h-7 px-2 bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-md focus:outline-none focus:border-blue-500 cursor-pointer flex-shrink-0"
            aria-label="Emulator device"
          >
            {DEVICES.map((d) => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>

          {/* Viewport width input */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <input
              ref={widthInputRef}
              type="number"
              value={displayWidth}
              min={240}
              max={2560}
              onChange={handleWidthChange}
              onFocus={(e) => e.target.select()}
              className="w-14 h-7 px-1.5 bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-md text-center focus:outline-none focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="Viewport width"
              title="Viewport width (px) — type to override"
            />
            <span className="text-gray-600 text-xs flex-shrink-0">px</span>
          </div>

          {/* Landscape / portrait toggle */}
          <button
            onClick={onLandscapeToggle}
            title={landscape ? 'Switch to portrait' : 'Switch to landscape'}
            className={[
              'flex items-center justify-center w-7 h-7 rounded-md border transition-colors flex-shrink-0',
              landscape
                ? 'bg-blue-600/20 border-blue-600/50 text-blue-400 hover:bg-blue-600/30'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200 hover:bg-gray-700',
            ].join(' ')}
          >
            <IconRotate landscape={landscape} />
          </button>
        </>
      )}

      <div className="w-px h-4 bg-gray-700 flex-shrink-0" aria-hidden="true"/>

      {/* ── Recording controls ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {recordingError && (
          <span className="text-xs text-red-400 max-w-36 truncate" title={recordingError}>
            {recordingError}
          </span>
        )}

        {!isRecording ? (
          <>
            {recordingStatus && !recordingError && (
              <span className="text-xs text-gray-500">{recordingStatus}</span>
            )}
            <button
              onClick={onStartRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs rounded-md font-medium transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-white flex-shrink-0" aria-hidden="true"/>
              Record
            </button>
          </>
        ) : (
          <>
            {/* Live timer badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 border border-gray-700 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 recording-dot flex-shrink-0" aria-hidden="true"/>
              <span className="text-white text-xs font-mono tabular-nums">{elapsedLabel}</span>
            </div>

            <button
              onClick={onStopRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-md font-medium transition-colors ring-1 ring-red-600"
            >
              <span className="w-2 h-2 bg-red-500 rounded-sm recording-dot flex-shrink-0" aria-hidden="true"/>
              Stop
            </button>
          </>
        )}
      </div>

    </header>
  )
}
