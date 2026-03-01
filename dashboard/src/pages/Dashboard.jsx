import { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import VideoCard from '../components/VideoCard.jsx'
import DeleteDialog from '../components/DeleteDialog.jsx'
import AnalyticsSummary from '../components/AnalyticsSummary.jsx'
import FilterBar from '../components/FilterBar.jsx'
import useRecordings from '../hooks/useRecordings.js'

export default function Dashboard() {
  const {
    recordings, rawRecordings,
    loading, error, remove,
    search, setSearch,
    deviceFilter, setDeviceFilter,
    sortOrder, setSortOrder,
    uniqueDevices,
  } = useRecordings()

  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting]           = useState(false)

  async function handleConfirmDelete() {
    if (!pendingDelete || deleting) return
    setDeleting(true)
    await remove(pendingDelete)
    setDeleting(false)
    setPendingDelete(null)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
      <Navbar />

      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-white font-bold text-xl">My Recordings</h1>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-red-400 text-sm bg-red-950 border border-red-900 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Analytics summary — always uses unfiltered totals */}
              {rawRecordings.length > 0 && (
                <AnalyticsSummary recordings={rawRecordings} />
              )}

              {/* Filter / search / sort bar */}
              <FilterBar
                search={search}             setSearch={setSearch}
                deviceFilter={deviceFilter} setDeviceFilter={setDeviceFilter}
                uniqueDevices={uniqueDevices}
                sortOrder={sortOrder}       setSortOrder={setSortOrder}
                totalShown={recordings.length}
                totalAll={rawRecordings.length}
              />

              {/* Empty state */}
              {rawRecordings.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-gray-600">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="mb-4">
                    <polygon points="23 7 16 12 23 17 23 7"/>
                    <rect x="1" y="5" width="15" height="14" rx="2"/>
                  </svg>
                  <p className="text-sm">No recordings yet.</p>
                  <p className="text-xs mt-1">Use the extension to record a session and upload it to the cloud.</p>
                </div>
              )}

              {/* No results after filtering */}
              {rawRecordings.length > 0 && recordings.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-600">
                  <p className="text-sm">No recordings match your filters.</p>
                </div>
              )}

              {/* Grid */}
              {recordings.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {recordings.map((rec) => (
                    <VideoCard
                      key={rec.id}
                      recording={rec}
                      onDelete={setPendingDelete}
                    />
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </main>

      {pendingDelete && (
        <DeleteDialog
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
          deleting={deleting}
        />
      )}
    </div>
  )
}
