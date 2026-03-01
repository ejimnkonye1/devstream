import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

const EXTENSION_ID = import.meta.env.VITE_EXTENSION_ID

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const viaExtension = searchParams.get('via') === 'extension'

  const [mode, setMode]       = useState('signin')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [info, setInfo]       = useState(null)
  const [session, setSession] = useState(null)
  const [synced, setSynced]   = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session && !viaExtension) navigate('/dashboard', { replace: true })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      if (event === 'SIGNED_IN' && !viaExtension) navigate('/dashboard', { replace: true })
    })

    return () => subscription.unsubscribe()
  }, [navigate, viaExtension])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null); setInfo(null); setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setInfo('Check your email for a confirmation link, then sign in.')
        setMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' },
    })
    if (error) setError(error.message)
  }

  async function syncToExtension() {
    if (!session || !EXTENSION_ID) {
      setError(
        EXTENSION_ID
          ? 'No active session found.'
          : 'VITE_EXTENSION_ID is not set in dashboard/.env'
      )
      return
    }
    try {
      await chrome.runtime.sendMessage(EXTENSION_ID, {
        type: 'SYNC_SESSION',
        accessToken:  session.access_token,
        refreshToken: session.refresh_token,
      })
      setSynced(true)
      setInfo('Synced! You can close this tab and return to the extension.')
    } catch (err) {
      setError(
        'Could not connect to the DevStream extension. ' +
        'Make sure it is installed and the Extension ID in dashboard/.env is correct. ' +
        `(${err?.message ?? String(err)})`
      )
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 px-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 select-none">
        <svg width="28" height="28" viewBox="0 0 22 22" fill="none">
          <rect width="22" height="22" rx="5" fill="#3B82F6"/>
          <polygon points="8,6 17,11 8,16" fill="white"/>
          <rect x="5" y="6" width="2" height="10" rx="1" fill="white"/>
        </svg>
        <span className="text-white font-bold text-lg tracking-tight">DevStream</span>
      </div>

      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-xl p-6">

        {/* ── Signed in + via extension: show sync button ── */}
        {viaExtension && session && (
          <>
            <h1 className="text-white font-semibold text-base mb-5">Signed in</h1>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span className="font-medium">{session.user.email}</span>
              </div>

              {!synced ? (
                <button
                  onClick={syncToExtension}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Sync to Extension
                </button>
              ) : (
                <div className="flex items-center gap-2 text-blue-400 text-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Extension synced — you can close this tab.</span>
                </div>
              )}

              {error && <p className="text-red-400 text-xs">{error}</p>}
              {info  && <p className="text-blue-400 text-xs">{info}</p>}
            </div>
          </>
        )}

        {/* ── Not signed in (or non-extension flow): show auth form ── */}
        {!(viaExtension && session) && (
          <>
            <h1 className="text-white font-semibold text-base mb-5">
              {mode === 'signin' ? 'Sign in to DevStream' : 'Create your account'}
            </h1>

            {/* Google */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2.5 py-2 px-4 bg-white hover:bg-gray-100 text-gray-800 text-sm font-medium rounded-lg transition-colors mb-4"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-800"/>
              <span className="text-gray-600 text-xs">or</span>
              <div className="flex-1 h-px bg-gray-800"/>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email" placeholder="Email" value={email} required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <input
                type="password" placeholder="Password" value={password} required minLength={6}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />

              {error && <p className="text-red-400 text-xs">{error}</p>}
              {info  && <p className="text-blue-400 text-xs">{info}</p>}

              <button
                type="submit" disabled={loading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            <p className="text-gray-500 text-xs text-center mt-4">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setMode((m) => m === 'signin' ? 'signup' : 'signin'); setError(null); setInfo(null) }}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </>
        )}

      </div>
    </div>
  )
}
