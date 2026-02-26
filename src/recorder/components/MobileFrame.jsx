/**
 * MobileFrame — Phone shell surrounding a 375-px wide iframe.
 *
 * The outer container is flex-shrink-0 so it never collapses.
 * The iframe ref is forwarded to the parent (DualView) so the
 * scroll-sync hook can post messages directly to its contentWindow.
 */

import { forwardRef } from 'react'

const MobileFrame = forwardRef(function MobileFrame({ activeUrl }, ref) {
  return (
    <aside
      className="flex flex-col bg-gray-800 rounded-lg overflow-hidden flex-shrink-0"
      style={{ width: '432px' }}
    >
      {/* ── Column header ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-750 border-b border-gray-700 flex-shrink-0"
           style={{ background: '#1f2937' }}>
        <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" aria-hidden="true"/>
        <span className="text-xs text-gray-300 font-mono">Mobile — 375px</span>
        {/* Device label */}
        <span className="ml-auto text-xs text-gray-500">iPhone 14 Pro</span>
      </div>

      {/* ── Phone shell + viewport ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-gray-900 overflow-y-auto mobile-scroll py-4">
        {/* Outer phone body */}
        <div
          className="relative flex-shrink-0 rounded-[3rem] border-4 border-gray-700 bg-gray-950 shadow-2xl"
          style={{ width: '395px', height: '780px' }}
        >
          {/* Dynamic island */}
          <div
            className="absolute top-3 left-1/2 -translate-x-1/2 bg-black rounded-full z-10"
            style={{ width: '120px', height: '36px' }}
            aria-hidden="true"
          />

          {/* Status bar (decorative) */}
          <div
            className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 z-10"
            style={{ height: '55px' }}
            aria-hidden="true"
          >
            <span className="text-white text-xs font-semibold">9:41</span>
            <div className="flex items-center gap-1.5">
              {/* Signal */}
              <svg width="17" height="12" viewBox="0 0 17 12" fill="white">
                <rect x="0" y="3"  width="3" height="9" rx="1"/>
                <rect x="4.5" y="2" width="3" height="10" rx="1"/>
                <rect x="9" y="1" width="3" height="11" rx="1"/>
                <rect x="13.5" y="0" width="3" height="12" rx="1"/>
              </svg>
              {/* WiFi */}
              <svg width="16" height="12" viewBox="0 0 16 12" fill="white">
                <path d="M8 9.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
                <path d="M8 6C5.79 6 3.81 6.9 2.4 8.36l1.42 1.42A5.96 5.96 0 0 1 8 8c1.65 0 3.14.67 4.22 1.76l1.42-1.42A7.96 7.96 0 0 0 8 6z" opacity=".7"/>
                <path d="M8 2.5C4.68 2.5 1.7 3.9 0 6.17l1.41 1.41A9.95 9.95 0 0 1 8 5c2.76 0 5.26 1.12 7.07 2.93L16.5 6.5A11.95 11.95 0 0 0 8 2.5z" opacity=".4"/>
              </svg>
              {/* Battery */}
              <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
                <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="white" strokeOpacity=".35"/>
                <rect x="2" y="2" width="17" height="8" rx="2" fill="white"/>
                <path d="M23 4v4a2 2 0 0 0 0-4z" fill="white" fillOpacity=".4"/>
              </svg>
            </div>
          </div>

          {/* ── Viewport ─────────────────────────────────────────── */}
          <div
            className="absolute overflow-hidden bg-white"
            style={{ top: '55px', left: '4px', right: '4px', bottom: '28px', borderRadius: '0px' }}
          >
            {activeUrl ? (
              <iframe
                ref={ref}
                src={activeUrl}
                title="Mobile View"
                className="border-0 w-full h-full"
                // Note on sandbox: allow-same-origin is required for the
                // extension's content script to function correctly when
                // communicating with cross-origin frames via postMessage.
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                loading="lazy"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-gray-900 gap-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5">
                  <rect x="5" y="2" width="14" height="20" rx="2"/>
                  <circle cx="12" cy="17" r="1"/>
                </svg>
                <span className="text-gray-600 text-xs text-center leading-relaxed px-6">
                  Mobile preview<br/>appears here
                </span>
              </div>
            )}
          </div>

          {/* Home indicator */}
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white rounded-full opacity-40"
            style={{ width: '120px', height: '5px' }}
            aria-hidden="true"
          />
        </div>
      </div>
    </aside>
  )
})

export default MobileFrame
