/**
 * MobileFrame — Device-aware phone shell with:
 *   • Landscape / portrait orientation
 *   • Custom viewport width override
 *   • Height modes: 'preset' (device height) | 'fill' (90vh) | 'half' (45vh)
 *   • Platform badge (iOS / Android) in status bar
 *   • Active viewport indicator (width × height px)
 *   • iframe block detection overlay
 *   • Overlay scale mode for 'both' layout
 */

import { forwardRef } from 'react'
import FrameStatusOverlay from './FrameStatusOverlay.jsx'
import useIframeStatus from '../hooks/useIframeStatus.js'

// ── Status icon cluster ────────────────────────────────────────────────────

function StatusIcons() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <svg width="17" height="12" viewBox="0 0 17 12" fill="white">
        <rect x="0"    y="4"   width="3" height="8"  rx="0.8"/>
        <rect x="4.5"  y="2.5" width="3" height="9.5" rx="0.8"/>
        <rect x="9"    y="1"   width="3" height="11" rx="0.8"/>
        <rect x="13.5" y="0"   width="3" height="12" rx="0.8"/>
      </svg>
      <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
        <circle cx="7.5" cy="9.5" r="1.5" fill="white"/>
        <path d="M3.5 6.3a5.5 5.5 0 0 1 8 0"  stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity=".7"/>
        <path d="M.5 3.3a9.5 9.5 0 0 1 14 0"  stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity=".4"/>
      </svg>
      <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
        <rect x=".5" y=".5" width="20" height="11" rx="3" stroke="white" strokeOpacity=".4"/>
        <rect x="2"  y="2"  width="15" height="8"  rx="2" fill="white"/>
        <path d="M22 4v4a2 2 0 0 0 0-4z" fill="white" fillOpacity=".4"/>
      </svg>
    </div>
  )
}

// ── Platform badge ─────────────────────────────────────────────────────────

function PlatformBadge({ platform }) {
  const isIos = platform === 'ios'
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.5px',
      background: isIos ? 'rgba(59,130,246,0.2)' : 'rgba(34,197,94,0.2)',
      color: isIos ? '#93C5FD' : '#86EFAC',
      borderRadius: 3, padding: '1px 5px',
      lineHeight: 1.6,
    }}>
      {isIos ? 'iOS' : 'Android'}
    </span>
  )
}

// ── Device chrome components ───────────────────────────────────────────────

function IOSChrome({ shell, landscape, platform }) {
  const islandW = landscape ? 36 : 126
  const islandH = landscape ? 14 : 37
  return (
    <>
      {/* Dynamic Island */}
      <div aria-hidden="true" style={{
        position: 'absolute', zIndex: 10,
        top:  landscape ? '50%' : 10,
        left: landscape ? 10 : '50%',
        transform: landscape ? 'translateY(-50%)' : 'translateX(-50%)',
        width: islandW, height: islandH,
        background: '#000', borderRadius: 20,
      }}/>
      {/* Status bar */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: shell.topBarH,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', zIndex: 9,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 600, letterSpacing: '-0.3px' }}>9:41</span>
          <PlatformBadge platform={platform} />
        </div>
        <StatusIcons />
      </div>
    </>
  )
}

function AndroidChrome({ shell, platform }) {
  return (
    <>
      {/* Punch-hole camera */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: 13, left: '50%', transform: 'translateX(-50%)',
        width: 14, height: 14, background: '#111', borderRadius: '50%',
        zIndex: 10, boxShadow: '0 0 0 2px rgba(255,255,255,0.07)',
      }}/>
      {/* Status bar */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: shell.topBarH,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 9,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 500 }}>9:41</span>
          <PlatformBadge platform={platform} />
        </div>
        <StatusIcons />
      </div>
    </>
  )
}

// ── Iframe + block detection ───────────────────────────────────────────────

function DeviceViewport({ activeUrl, iframeW, iframeH, iframeXScale, iframeRef, deviceLabel }) {
  const { status, onLoad } = useIframeStatus(iframeRef, activeUrl)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#fff' }}>
      {activeUrl ? (
        <>
          <iframe
            ref={iframeRef}
            src={activeUrl}
            title={`${deviceLabel} View`}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            loading="lazy"
            onLoad={onLoad}
            style={{
              width: iframeW, height: iframeH,
              border: 'none', display: 'block',
              transformOrigin: 'top left',
              transform: iframeXScale < 1 ? `scale(${iframeXScale})` : undefined,
            }}
          />
          <FrameStatusOverlay status={status} url={activeUrl} />
        </>
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100%', gap: 8, background: '#111827',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5">
            <rect x="5" y="2" width="14" height="20" rx="2"/>
            <circle cx="12" cy="17" r="1"/>
          </svg>
          <span style={{ color: '#4B5563', fontSize: 11, textAlign: 'center', padding: '0 16px', lineHeight: 1.5 }}>
            Mobile preview<br/>appears here
          </span>
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

const MobileFrame = forwardRef(function MobileFrame(
  {
    activeUrl,
    device,
    landscape  = false,
    customWidth = null,
    overlay    = false,
    heightMode = 'preset',   // 'preset' | 'fill' | 'half'
  },
  ref
) {
  const { shell } = device
  const platform  = device.platform ?? (shell.type === 'ios' ? 'ios' : 'android')

  // ── Orientation-aware shell dimensions ──────────────────────────────────
  const baseShellW = landscape ? shell.outerHeight : shell.outerWidth
  const baseShellH = landscape ? shell.outerWidth  : shell.outerHeight

  // ── Apply heightMode ────────────────────────────────────────────────────
  const shellW = baseShellW
  const shellH = heightMode === 'fill' ? Math.round(window.innerHeight * 0.90)
               : heightMode === 'half' ? Math.round(window.innerHeight * 0.45)
               : baseShellH

  // ── Effective viewport width ────────────────────────────────────────────
  const naturalViewportW = landscape
    ? (shellW - shell.borderWidth * 2)
    : device.viewportWidth
  const viewportW = customWidth ?? naturalViewportW

  // ── Content area dimensions ─────────────────────────────────────────────
  const contentAreaW = shellW - shell.borderWidth * 2
  const contentAreaH = shellH - shell.borderWidth * 2 - shell.topBarH - shell.bottomBarH

  // Scale iframe down if viewport is wider than the content area.
  const iframeXScale = Math.min(1, contentAreaW / viewportW)
  const iframeW      = viewportW
  const iframeH      = Math.ceil(contentAreaH / iframeXScale)

  // ── Overlay scale ───────────────────────────────────────────────────────
  const scale    = overlay ? device.overlayScale : 1
  const displayW = Math.round(shellW * scale)
  const displayH = Math.round(shellH * scale)

  const DeviceChrome = shell.type === 'ios' ? IOSChrome : AndroidChrome

  return (
    <div style={{ width: displayW, height: displayH, position: 'relative', flexShrink: 0 }}>
      {/* Full-size shell, CSS-scaled to fit the wrapper */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: shellW, height: shellH,
        transformOrigin: 'top left',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
      }}>
        {/* Device shell */}
        <div style={{
          width: '100%', height: '100%',
          borderRadius: shell.borderRadius,
          border: `${shell.borderWidth}px solid ${shell.borderColor}`,
          background: shell.bg,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: overlay
            ? '0 32px 64px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06)'
            : '0 24px 48px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(255,255,255,0.06)',
        }}>
          {/* Status bar + notch / island / punch-hole + platform badge */}
          <DeviceChrome shell={shell} landscape={landscape} platform={platform} />

          {/* ── Viewport area ──────────────────────────────────────── */}
          <div style={{
            position: 'absolute',
            top: shell.topBarH, left: 0, right: 0, bottom: shell.bottomBarH,
          }}>
            <DeviceViewport
              activeUrl={activeUrl}
              iframeRef={ref}
              iframeW={iframeW}
              iframeH={iframeH}
              iframeXScale={iframeXScale}
              deviceLabel={device.label}
            />
          </div>

          {/* Active viewport indicator */}
          <div aria-hidden="true" style={{
            position: 'absolute',
            bottom: shell.bottomBarH + 4,
            left: 8,
            fontSize: 9,
            color: 'rgba(255,255,255,0.22)',
            fontFamily: 'monospace',
            letterSpacing: '0.3px',
            pointerEvents: 'none',
            zIndex: 11,
          }}>
            {viewportW} × {Math.round(contentAreaH)} px
          </div>

          {/* Home indicator */}
          <div aria-hidden="true" style={{
            position: 'absolute',
            bottom: Math.max(6, Math.floor(shell.bottomBarH / 2) - 2),
            left: '50%', transform: 'translateX(-50%)',
            width: landscape ? 80 : 120, height: 5,
            background: 'rgba(255,255,255,0.28)', borderRadius: 3,
          }}/>
        </div>
      </div>
    </div>
  )
})

export default MobileFrame
