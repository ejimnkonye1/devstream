import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

export default function useRecordings() {
  const [recordings, setRecordings] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

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

  const remove = useCallback(async (id) => {
    const rec = recordings.find((r) => r.id === id)
    if (rec?.storage_path) {
      await supabase.storage.from('recordings').remove([rec.storage_path])
    }
    const { error } = await supabase.from('recordings').delete().eq('id', id)
    if (!error) setRecordings((prev) => prev.filter((r) => r.id !== id))
  }, [recordings])

  return { recordings, loading, error, refetch, remove }
}
