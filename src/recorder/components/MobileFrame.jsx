/**
 * MobileFrame — Device-aware phone/tablet shell with:
 *   • Landscape / portrait orientation
 *   • Custom viewport width override
 *   • iframe block detection overlay (X-Frame-Options / CSP)
 *   • Overlay scale mode for 'both' layout
 *
 * Dimension maths (portrait, using iPhone 14 Pro as example):
 *   shell outer:       393 × 780
 *   content area:      385 × 717   (minus 4px borders)
 *   viewport area:     385 × 634   (minus topBarH 55 + bottomBarH 28)
 *   iframe width:      375px (device.viewportWidth, overridden by customWidth)
 *   iframe height:     fills viewport area height (100%)
 *
 * For wide viewports (e.g. iPad 744px > content 554px), the iframe is
 * CSS-scaled down so the site thinks it's 744px but is displayed smaller:
 *   iframeXScale = contentWidth / viewportWidth
 *   iframe height = viewportAreaHeight / iframeXScale  (fills the area after scale)
 *
 * Landscape mode swaps outer width/height; viewport width becomes the
 * (wider) content area of the rotated shell.
 */

import { forwardRef, useRef } from 'react'
import FrameStatusOverlay from './FrameStatusOverlay.jsx'
import useIframeStatus from '../hooks/useIframeStatus.js'

// ── Device chrome components ───────────────────────────────────────────────

function StatusIcons() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      {/* Cellular signal */}
      <svg width="17" height="12" viewBox="0 0 17 12" fill="white">
        <rect x="0"    y="4"   width="3" height="8"  rx="0.8"/>
        <rect x="4.5"  y="2.5" width="3" height="9.5" rx="0.8"/>
        <rect x="9"    y="1"   width="3" height="11" rx="0.8"/>
        <rect x="13.5" y="0"   width="3" height="12" rx="0.8"/>
      </svg>
      {/* Wi-Fi */}
      <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
        <circle cx="7.5" cy="9.5" r="1.5" fill="white"/>
        <path d="M3.5 6.3a5.5 5.5 0 0 1 8 0"  stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity=".7"/>
        <path d="M.5 3.3a9.5 9.5 0 0 1 14 0"  stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity=".4"/>
      </svg>
      {/* Battery */}
      <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
        <rect x=".5" y=".5" width="20" height="11" rx="3" stroke="white" strokeOpacity=".4"/>
        <rect x="2"  y="2"  width="15" height="8"  rx="2" fill="white"/>
        <path d="M22 4v4a2 2 0 0 0 0-4z" fill="white" fillOpacity=".4"/>
      </svg>
    </div>
  )
}

function IOSChrome({ shell, landscape }) {
  const islandW = landscape ? 36 : 126
  const islandH = landscape ? 14 : 37
  return (
    <>
      <div aria-hidden="true" style={{
        position: 'absolute', zIndex: 10,
        top: landscape ? '50%' : 10,
        left: landscape ? 10 : '50%',
        transform: landscape ? 'translateY(-50%)' : 'translateX(-50%)',
        width: islandW, height: islandH,
        background: '#000', borderRadius: 20,
      }}/>
      <div aria-hidden="true" style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: shell.topBarH,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', zIndex: 9,
      }}>
        <span style={{ color: '#fff', fontSize: 12, fontWeight: 600, letterSpacing: '-0.3px' }}>9:41</span>
        <StatusIcons />
      </div>
    </>
  )
}

function AndroidChrome({ shell }) {
  return (
    <>
      <div aria-hidden="true" style={{
        position: 'absolute', top: 13, left: '50%', transform: 'translateX(-50%)',
        width: 14, height: 14, background: '#111', borderRadius: '50%',
        zIndex: 10, boxShadow: '0 0 0 2px rgba(255,255,255,0.07)',
      }}/>
      <div aria-hidden="true" style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: shell.topBarH,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 9,
      }}>
        <span style={{ color: '#fff', fontSize: 11, fontWeight: 500 }}>9:41</span>
        <StatusIcons />
      </div>
    </>
  )
}

function TabletChrome({ shell }) {
  return (
    <>
      <div aria-hidden="true" style={{
        position: 'absolute', top: 15, left: '50%', transform: 'translateX(-50%)',
        width: 10, height: 10, background: '#2a2a2c', borderRadius: '50%',
        zIndex: 10, boxShadow: '0 0 0 2px rgba(255,255,255,0.05)',
      }}/>
      <div aria-hidden="true" style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: shell.topBarH,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', zIndex: 9,
      }}>
        <span style={{ color: '#fff', fontSize: 11, fontWeight: 500 }}>9:41</span>
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
  { activeUrl, device, landscape = false, customWidth = null, overlay = false },
  ref
) {
  const { shell } = device

  // ── Orientation-aware shell dimensions ──────────────────────────────────
  const shellW = landscape ? shell.outerHeight : shell.outerWidth
  const shellH = landscape ? shell.outerWidth  : shell.outerHeight

  // ── Effective viewport width ────────────────────────────────────────────
  // In landscape, the natural viewport fills the (wider) content area.
  const naturalViewportW = landscape
    ? (shellW - shell.borderWidth * 2)
    : device.viewportWidth
  const viewportW = customWidth ?? naturalViewportW

  // ── Content area dimensions ─────────────────────────────────────────────
  const contentAreaW = shellW - shell.borderWidth * 2
  const contentAreaH = shellH - shell.borderWidth * 2 - shell.topBarH - shell.bottomBarH

  // Scale the iframe down if viewport is wider than the content area.
  const iframeXScale = Math.min(1, contentAreaW / viewportW)
  const iframeW      = viewportW
  const iframeH      = Math.ceil(contentAreaH / iframeXScale)

  // ── Overlay scale ───────────────────────────────────────────────────────
  const scale    = overlay ? device.overlayScale : 1
  const displayW = Math.round(shellW * scale)
  const displayH = Math.round(shellH * scale)

  const DeviceChrome =
    shell.type === 'ios'     ? IOSChrome     :
    shell.type === 'android' ? AndroidChrome :
    TabletChrome

  return (
    /* Wrapper: reserves the scaled footprint so layout isn't disrupted */
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

          {/* Status bar + notch / island / punch-hole */}
          <DeviceChrome shell={shell} landscape={landscape} />

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

          {/* Home indicator (phones) */}
          {shell.type !== 'tablet' && (
            <div aria-hidden="true" style={{
              position: 'absolute',
              bottom: Math.max(6, Math.floor(shell.bottomBarH / 2) - 2),
              left: '50%', transform: 'translateX(-50%)',
              width: landscape ? 80 : 120, height: 5,
              background: 'rgba(255,255,255,0.3)', borderRadius: 3,
            }}/>
          )}

          {/* iPad home bar */}
          {shell.type === 'tablet' && (
            <div aria-hidden="true" style={{
              position: 'absolute',
              bottom: 10, left: '50%', transform: 'translateX(-50%)',
              width: 80, height: 4,
              background: 'rgba(255,255,255,0.2)', borderRadius: 2,
            }}/>
          )}
        </div>
      </div>
    </div>
  )
})

export default MobileFrame
