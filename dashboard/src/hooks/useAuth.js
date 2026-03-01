import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

/**
 * Returns the current user:
 *   undefined  — still loading
 *   null       — not signed in
 *   User       — authenticated
 */
export default function useAuth() {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user ?? null))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return user
}
