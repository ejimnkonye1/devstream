/**
 * AuthApp — Extension sign-in window (400 × 560).
 *
 * Supports:
 *  • Email + Password  (sign in / sign up)
 *  • "Sign in with Google" → opens the web dashboard in a new tab;
 *    once logged in there the user clicks "Sync to Extension" which
 *    sends the session via chrome.runtime.sendMessage.
 *
 * On successful auth, this window closes itself and the recorder
 * window re-checks its session state.
 */

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:5174'

export default function AuthApp() {
  const [mode, setMode]         = useState('signin')   // 'signin' | 'signup'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [info, setInfo]         = useState(null)

  // If already signed in, close this window immediately.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) window.close()
    })
  }, [])

  // Listen for session pushed from the dashboard via background.js.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') window.close()
    })
    return () => subscription.unsubscribe()
  }, [])

  // Receive SET_SESSION relayed by background.js from the web dashboard.
  useEffect(() => {
    async function onMessage(message) {
      if (message.type === 'SET_SESSION' && message.accessToken) {
        await supabase.auth.setSession({
          access_token:  message.accessToken,
          refresh_token: message.refreshToken,
        })
        // onAuthStateChange fires SIGNED_IN → window.close()
      }
    }
    chrome.runtime.onMessage.addListener(onMessage)
    return () => chrome.runtime.onMessage.removeListener(onMessage)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setInfo('Check your email for a confirmation link, then sign in.')
        setMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // onAuthStateChange fires → window.close()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function openDashboardAuth() {
    chrome.tabs.create({ url: `${DASHBOARD_URL}/login?via=extension` })
    setInfo('Sign in on the dashboard, then click "Sync to Extension" there.')
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-950 px-6">
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
        <h1 className="text-white font-semibold text-base mb-5">
          {mode === 'signin' ? 'Sign in to DevStream' : 'Create your account'}
        </h1>

        {/* Google OAuth → dashboard */}
        <button
          onClick={openDashboardAuth}
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

        {/* Email / password form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />

          {error && <p className="text-red-400 text-xs">{error}</p>}
          {info  && <p className="text-blue-400 text-xs">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="text-gray-500 text-xs text-center mt-4">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setInfo(null) }}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
