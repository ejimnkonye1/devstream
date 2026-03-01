import { useState, useEffect } from 'react'

export default function FilterBar({
  search, setSearch,
  deviceFilter, setDeviceFilter, uniqueDevices,
  sortOrder, setSortOrder,
  totalShown, totalAll,
}) {
  // Local search state for debouncing
  const [localSearch, setLocalSearch] = useState(search)

  useEffect(() => {
    const t = setTimeout(() => setSearch(localSearch), 300)
    return () => clearTimeout(t)
  }, [localSearch, setSearch])

  // Keep local state in sync if external search is cleared
  useEffect(() => {
    if (search === '') setLocalSearch('')
  }, [search])

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Search input */}
      <div className="flex-1 min-w-48 flex items-center bg-gray-800 border border-gray-700 rounded-lg overflow-hidden focus-within:border-blue-500 transition-colors">
        <svg
          className="ml-3 flex-shrink-0 text-gray-500"
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Search recordings…"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="flex-1 px-2.5 py-2 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
        />
        {localSearch && (
          <button
            onClick={() => { setLocalSearch(''); setSearch('') }}
            className="pr-3 text-gray-500 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* Device filter */}
      <select
        value={deviceFilter}
        onChange={(e) => setDeviceFilter(e.target.value)}
        className="h-9 px-3 bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
      >
        <option value="">All devices</option>
        {uniqueDevices.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Sort toggle */}
      <button
        onClick={() => setSortOrder((o) => o === 'desc' ? 'asc' : 'desc')}
        className="flex items-center gap-1.5 h-9 px-3 bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg hover:border-gray-500 hover:text-white transition-colors"
      >
        <svg
          width="13" height="13" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className={sortOrder === 'asc' ? 'rotate-180 transition-transform' : 'transition-transform'}
        >
          <line x1="12" y1="19" x2="12" y2="5"/>
          <polyline points="5 12 12 5 19 12"/>
        </svg>
        {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
      </button>

      {/* Count */}
      <span className="text-gray-600 text-sm ml-auto tabular-nums">
        {totalShown !== totalAll
          ? `${totalShown} of ${totalAll}`
          : `${totalAll} recording${totalAll !== 1 ? 's' : ''}`}
      </span>
    </div>
  )
}
