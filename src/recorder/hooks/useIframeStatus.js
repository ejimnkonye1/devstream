/**
 * useIframeStatus — Detects whether an iframe loaded successfully or was
 * blocked by X-Frame-Options / CSP frame-ancestors.
 *
 * Detection strategy
 * ──────────────────
 * On iframe load we send DS_PING with a random token.
 * The content script echoes the token back in DS_PONG.
 * We match by token — no window-reference comparison needed,
 * which avoids the cross-origin WindowProxy equality quirk.
 *
 * Secondary proof-of-life: if DS_SCROLL_REPORT or DS_NAVIGATE arrive from
 * any frame before the timeout, we also mark the iframe as loaded (handles
 * edge cases where the page doesn't scroll and doesn't receive the ping
 * in time on slow connections).
 *
 * Timeout: 5 s (generous — handles slow/heavy pages and cold-cache loads).
 */

import { useState, useRef, useEffect, useCallback } from 'react'

const PONG_TIMEOUT_MS = 5000

export default function useIframeStatus(iframeRef, activeUrl) {
  const [status, setStatus] = useState('idle')

  const timeoutRef = useRef(null)
  const tokenRef   = useRef(null)   // current ping token
  const resolvedRef = useRef(false) // true once we've confirmed loaded/blocked

  // ── Reset on every URL change ─────────────────────────────────────────
  useEffect(() => {
    clearTimeout(timeoutRef.current)
    tokenRef.current   = null
    resolvedRef.current = false
    setStatus(activeUrl ? 'loading' : 'idle')
  }, [activeUrl])

  // ── Listen for proof-of-life messages ─────────────────────────────────
  useEffect(() => {
    if (!activeUrl) return

    const resolve = () => {
      if (resolvedRef.current) return
      resolvedRef.current = true
      clearTimeout(timeoutRef.current)
      setStatus('loaded')
    }

    const handleMessage = (e) => {
      if (!e.data || typeof e.data !== 'object') return
      const { type, token } = e.data

      // Primary: token-matched pong
      if (type === 'DS_PONG' && token && token === tokenRef.current) {
        resolve()
        return
      }

      // Secondary: any DS message means the content script is running
      if (type === 'DS_SCROLL_REPORT' || type === 'DS_NAVIGATE') {
        resolve()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [activeUrl])

  // ── Called by the iframe's onLoad prop ────────────────────────────────
  const onLoad = useCallback(() => {
    if (resolvedRef.current) return
    clearTimeout(timeoutRef.current)

    const iframe = iframeRef.current
    if (!iframe) return

    setStatus('checking')

    // Unique token so stale pongs from previous loads are ignored.
    const token = Math.random().toString(36).slice(2)
    tokenRef.current = token

    iframe.contentWindow?.postMessage({ type: 'DS_PING', token }, '*')

    timeoutRef.current = setTimeout(() => {
      if (!resolvedRef.current) {
        resolvedRef.current = true
        setStatus('blocked')
      }
    }, PONG_TIMEOUT_MS)
  }, [iframeRef])

  return { status, onLoad }
}
