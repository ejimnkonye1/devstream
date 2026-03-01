/**
 * DeviceSelector — searchable device picker replacing the plain <select>.
 *
 * Shows the current device label + platform badge as the trigger.
 * Opens a dropdown with a search input and a filtered list of devices.
 */

import { useState, useRef, useEffect, useMemo } from 'react'
import { DEVICES, findDevice } from '../devices.js'

function PlatformBadge({ platform }) {
  const isIos = platform === 'ios'
  return (
    <span
      className={[
        'px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide flex-shrink-0',
        isIos
          ? 'bg-blue-900/60 text-blue-300'
          : 'bg-green-900/60 text-green-300',
      ].join(' ')}
    >
      {isIos ? 'iOS' : 'Android'}
    </span>
  )
}

export default function DeviceSelector({ deviceId, onDeviceChange }) {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const containerRef      = useRef(null)
  const searchRef         = useRef(null)

  const current = findDevice(deviceId)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open])

  // Auto-focus search when dropdown opens
  useEffect(() => {
    if (open) requestAnimationFrame(() => searchRef.current?.focus())
  }, [open])

  const filtered = useMemo(
    () => DEVICES.filter((d) =>
      d.label.toLowerCase().includes(query.toLowerCase()) ||
      d.platform.toLowerCase().includes(query.toLowerCase())
    ),
    [query]
  )

  function handleSelect(id) {
    onDeviceChange(id)
    setOpen(false)
    setQuery('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') { setOpen(false); setQuery('') }
  }

  return (
    <div ref={containerRef} className="relative flex-shrink-0">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 h-7 px-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs text-white transition-colors min-w-0 max-w-44"
        title={current.label}
      >
        <span className="truncate flex-1 text-left">{current.label}</span>
        <PlatformBadge platform={current.platform} />
        {/* Chevron */}
        <svg
          width="10" height="10" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          className={`flex-shrink-0 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
          {/* Search */}
          <div className="px-2 pt-2 pb-1">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search devices…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Device list */}
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-gray-600 text-xs">No devices match</p>
            ) : (
              filtered.map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleSelect(d.id)}
                  className={[
                    'flex items-center justify-between w-full px-3 py-2 text-xs transition-colors text-left',
                    d.id === deviceId
                      ? 'bg-blue-900/40 text-blue-300'
                      : 'text-gray-300 hover:bg-gray-800',
                  ].join(' ')}
                >
                  <span className="truncate flex-1 mr-2">{d.label}</span>
                  <PlatformBadge platform={d.platform} />
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
