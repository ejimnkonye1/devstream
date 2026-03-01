/**
 * DualView — Renders the correct layout based on viewMode.
 *
 * 'desktop' — Desktop iframe fills the entire area.
 * 'both'    — Desktop iframe fills the entire area; mobile emulator
 *             sits as an absolute overlay in the bottom-right corner.
 * 'mobile'  — Centred mobile emulator, no desktop iframe.
 *
 * mirrorMode — when true AND viewMode==='both', scroll sync is active.
 * heightMode — forwarded to MobileFrame ('preset' | 'fill' | 'half').
 */

import { useRef, useState, useEffect } from 'react'
import MobileFrame from './MobileFrame.jsx'
import FrameStatusOverlay from './FrameStatusOverlay.jsx'
import useScrollSync from '../hooks/useScrollSync.js'
import useIframeStatus from '../hooks/useIframeStatus.js'

// ── Desktop iframe wrapper with block detection ────────────────────────────

function DesktopPane({ iframeRef, activeUrl }) {
  const { status, onLoad } = useIframeStatus(iframeRef, activeUrl)

  return (
    <div className="absolute inset-0">
      {activeUrl ? (
        <>
          <iframe
            ref={iframeRef}
            src={activeUrl}
            title="Desktop View"
            className="w-full h-full border-0 block"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            loading="lazy"
            onLoad={onLoad}
          />
          <FrameStatusOverlay status={status} url={activeUrl} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.2">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <p className="text-gray-600 text-sm">Enter a URL above to load the site</p>
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function DualView({
  activeUrl, viewMode, device, landscape, customWidth, onNavigate,
  mirrorMode, heightMode,
}) {
  const desktopRef = useRef(null)
  const mobileRef  = useRef(null)

  const [overlayCollapsed, setOverlayCollapsed] = useState(false)

  useEffect(() => { setOverlayCollapsed(false) }, [viewMode])

  // Sync is only active in 'both' mode when mirrorMode is enabled
  useScrollSync(desktopRef, mobileRef, onNavigate, mirrorMode && viewMode === 'both')

  // ── desktop ────────────────────────────────────────────────────────────
  if (viewMode === 'desktop') {
    return (
      <div className="relative h-full w-full overflow-hidden bg-gray-950">
        <DesktopPane iframeRef={desktopRef} activeUrl={activeUrl} />
      </div>
    )
  }

  // ── mobile ─────────────────────────────────────────────────────────────
  if (viewMode === 'mobile') {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-950 overflow-auto py-4">
        <MobileFrame
          ref={mobileRef}
          activeUrl={activeUrl}
          device={device}
          landscape={landscape}
          customWidth={customWidth}
          heightMode={heightMode}
        />
      </div>
    )
  }

  // ── both ───────────────────────────────────────────────────────────────
  return (
    <div className="relative h-full w-full overflow-hidden bg-gray-950">

      {/* Desktop fills the whole canvas */}
      <DesktopPane iframeRef={desktopRef} activeUrl={activeUrl} />

      {/* Floating emulator — bottom-right */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-1.5">

        {/* Overlay toolbar */}
        <div className="flex items-center gap-2 bg-gray-900/95 backdrop-blur border border-gray-700 rounded-lg px-3 py-1.5 shadow-xl">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" aria-hidden="true"/>
          <span className="text-xs text-gray-300 font-mono">{device.label}</span>
          <span className="text-xs text-gray-600">·</span>
          <span className="text-xs text-gray-500 font-mono">
            {landscape
              ? `${device.shell.outerHeight - device.shell.borderWidth * 2}px`
              : `${customWidth ?? device.viewportWidth}px`}
          </span>
          {mirrorMode && (
            <>
              <span className="text-xs text-gray-600">·</span>
              <span className="text-[9px] font-semibold text-green-400 tracking-wide">SYNCED</span>
            </>
          )}

          <button
            onClick={() => setOverlayCollapsed((v) => !v)}
            title={overlayCollapsed ? 'Expand emulator' : 'Collapse emulator'}
            className="ml-1 p-0.5 text-gray-500 hover:text-gray-200 transition-colors rounded"
          >
            {overlayCollapsed ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
                <line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>
              </svg>
            )}
          </button>
        </div>

        {/* Emulator shell */}
        {!overlayCollapsed && (
          <div className="drop-shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
            <MobileFrame
              ref={mobileRef}
              activeUrl={activeUrl}
              device={device}
              landscape={landscape}
              customWidth={customWidth}
              heightMode={heightMode}
              overlay
            />
          </div>
        )}
      </div>
    </div>
  )
}
