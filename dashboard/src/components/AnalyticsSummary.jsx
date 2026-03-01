function formatTotalDuration(recordings) {
  const total = recordings.reduce((acc, r) => acc + (r.duration ?? 0), 0)
  if (!total) return '0s'
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function formatTotalStorage(recordings) {
  const total = recordings.reduce((acc, r) => acc + (r.file_size ?? 0), 0)
  if (!total) return '0 KB'
  if (total < 1024 * 1024)      return `${(total / 1024).toFixed(1)} KB`
  if (total < 1024 ** 3)        return `${(total / 1024 ** 2).toFixed(1)} MB`
  return `${(total / 1024 ** 3).toFixed(2)} GB`
}

export default function AnalyticsSummary({ recordings }) {
  const stats = [
    { label: 'Total Recordings', value: recordings.length },
    { label: 'Total Duration',   value: formatTotalDuration(recordings) },
    { label: 'Storage Used',     value: formatTotalStorage(recordings) },
  ]

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {stats.map(({ label, value }) => (
        <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
          <p className="text-gray-500 text-xs mb-1">{label}</p>
          <p className="text-white text-xl font-semibold tabular-nums">{value}</p>
        </div>
      ))}
    </div>
  )
}
