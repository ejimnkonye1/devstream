import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase.js'

export default function useRecordings() {
  const [recordings, setRecordings] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  // ── Filter / sort / search state ─────────────────────────────────────────
  const [search, setSearch]               = useState('')
  const [deviceFilter, setDeviceFilter]   = useState('')   // '' = all
  const [sortOrder, setSortOrder]         = useState('desc') // 'asc'|'desc'

  // ── Derived: unique device labels for the filter dropdown ────────────────
  const uniqueDevices = useMemo(
    () => [...new Set(recordings.map((r) => r.meta?.device).filter(Boolean))].sort(),
    [recordings]
  )

  // ── Derived: filtered + sorted list ──────────────────────────────────────
  const filteredRecordings = useMemo(() => {
    let result = recordings

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((r) => r.title?.toLowerCase().includes(q))
    }

    if (deviceFilter) {
      result = result.filter((r) => r.meta?.device === deviceFilter)
    }

    if (sortOrder === 'asc') {
      result = [...result].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      )
    }
    // 'desc' is already the server-side default order

    return result
  }, [recordings, search, deviceFilter, sortOrder])

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('recordings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setRecordings(data ?? [])

    setLoading(false)
  }, [])

  useEffect(() => { refetch() }, [refetch])

  // ── Delete ────────────────────────────────────────────────────────────────
  const remove = useCallback(async (id) => {
    const rec = recordings.find((r) => r.id === id)
    if (rec?.storage_path) {
      await supabase.storage.from('recordings').remove([rec.storage_path])
    }
    const { error } = await supabase.from('recordings').delete().eq('id', id)
    if (!error) setRecordings((prev) => prev.filter((r) => r.id !== id))
  }, [recordings])

  return {
    // Filtered list — what the grid renders
    recordings: filteredRecordings,
    // Unfiltered list — for analytics totals
    rawRecordings: recordings,
    loading,
    error,
    refetch,
    remove,
    // Filter controls
    search,       setSearch,
    deviceFilter, setDeviceFilter,
    sortOrder,    setSortOrder,
    uniqueDevices,
  }
}
