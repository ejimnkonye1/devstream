import { supabase } from '../lib/supabase.js'
import useAuth from '../hooks/useAuth.js'

export default function Navbar() {
  const user = useAuth()

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-gray-800 bg-gray-950 flex-shrink-0">
      <div className="flex items-center gap-2 select-none">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect width="22" height="22" rx="5" fill="#3B82F6"/>
          <polygon points="8,6 17,11 8,16" fill="white"/>
          <rect x="5" y="6" width="2" height="10" rx="1" fill="white"/>
        </svg>
        <span className="text-white font-bold text-sm tracking-tight">DevStream</span>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-xs truncate max-w-48">{user.email}</span>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-xs text-gray-500 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  )
}
