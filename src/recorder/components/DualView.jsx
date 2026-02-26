/**
 * DualView — Side-by-side Desktop iframe and Mobile simulator.
 *
 * Layout: [Desktop flex-1] [gap-2] [Mobile 432px fixed]
 *
 * Scroll & navigation sync is wired through useScrollSync, which listens for
 * postMessages from the content scripts running inside each iframe and
 * forwards commands in the opposite direction.
 */

import { useRef } from 'react'
import MobileFrame from './MobileFrame.jsx'
import useScrollSync from '../hooks/useScrollSync.js'

export default function DualView({ activeUrl, onNavigate }) {
  const desktopRef = useRef(null)
  const mobileRef  = useRef(null)

  useScrollSync(desktopRef, mobileRef, onNavigate)

  return (
    <div className="flex h-full gap-2 p-2 bg-gray-950 overflow-hidden">

      {/* ── Desktop viewport ──────────────────────────────────────── */}
      <section className="flex flex-col flex-1 bg-gray-800 rounded-lg overflow-hidden min-w-0">
        {/* Column header */}
        <div
          className="flex items-center gap-2 px-3 py-2 border-b border-gray-700 flex-shrink-0"
          style={{ background: '#1f2937' }}
        >
          <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" aria-hidden="true"/>
          <span className="text-xs text-gray-300 font-mono">Desktop — 1024px+</span>

          {/* Live URL pill */}
          {activeUrl && (
            <span className="ml-auto text-xs text-gray-500 font-mono truncate max-w-xs" title={activeUrl}>
              {activeUrl.replace(/^https?:\/\//, '')}
            </span>
          )}
        </div>

        {/* Iframe area */}
        <div className="flex-1 relative overflow-hidden">
          {activeUrl ? (
            <iframe
              ref={desktopRef}
              src={activeUrl}
              title="Desktop View"
              className="absolute inset-0 w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              loading="lazy"
            />
          ) : (
            <EmptyState
              icon={
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              }
              label="Enter a URL above to load the site"
            />
          )}
        </div>
      </section>

      {/* ── Mobile simulator ──────────────────────────────────────── */}
      <MobileFrame ref={mobileRef} activeUrl={activeUrl} />
    </div>
  )
}

function EmptyState({ icon, label }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      {icon}
      <p className="text-gray-600 text-sm">{label}</p>
    </div>
  )
}
