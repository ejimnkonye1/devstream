/**
 * useScrollSync — Bi-directional scroll & navigation sync between two iframes.
 *
 * Architecture
 * ────────────
 * Cross-origin iframes cannot be scripted directly (Same-Origin Policy).
 * We work around this via the DevStream content script (content.js) which is
 * injected into every frame by the Chrome extension:
 *
 *   iframe page  →  content script  →  postMessage(DS_SCROLL_REPORT)  →  recorder window
 *   recorder window  →  postMessage(DS_SCROLL_SET)  →  content script  →  iframe.scrollTo()
 *
 * Navigation sync follows the same pattern using DS_NAVIGATE / DS_NAV_SET.
 *
 * Same-origin iframes (e.g. localhost) work with the same mechanism AND can
 * also be accessed directly; we still use postMessage to keep the code path
 * uniform.
 *
 * Scroll loop prevention
 * ──────────────────────
 * When we apply a scroll command to frame B because frame A scrolled, frame B
 * fires a scroll event which would echo back. We suppress this by setting a
 * short-lived "applying" flag before issuing DS_SCROLL_SET, and the content
 * script itself also suppresses re-reporting for one frame.
 */

import { useEffect, useRef, useCallback } from 'react'

export default function useScrollSync(desktopIframeRef, mobileIframeRef, onNavigate, enabled = true) {
  // True while we are programmatically scrolling the opposite frame.
  const isSyncingRef = useRef(false)

  // ── Send scroll position to the *other* iframe ────────────────────────────
  const syncScroll = useCallback((targetIframe, scrollTop, scrollLeft) => {
    if (!targetIframe?.contentWindow) return
    isSyncingRef.current = true
    targetIframe.contentWindow.postMessage(
      { type: 'DS_SCROLL_SET', scrollTop, scrollLeft },
      '*'
    )
    // Release suppression after the browser has processed one paint cycle.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isSyncingRef.current = false
      })
    })
  }, [])

  useEffect(() => {
    if (!enabled) return

    const handleMessage = (event) => {
      if (!event.data || typeof event.data !== 'object') return

      const { type } = event.data

      // ── Scroll report from one of our iframes ──────────────────────────
      if (type === 'DS_SCROLL_REPORT') {
        if (isSyncingRef.current) return

        const { scrollTop, scrollLeft } = event.data
        const fromDesktop = event.source === desktopIframeRef.current?.contentWindow
        const fromMobile  = event.source === mobileIframeRef.current?.contentWindow

        if (fromDesktop) {
          syncScroll(mobileIframeRef.current, scrollTop, scrollLeft)
        } else if (fromMobile) {
          syncScroll(desktopIframeRef.current, scrollTop, scrollLeft)
        }
      }

      // ── Navigation report from one of our iframes ──────────────────────
      if (type === 'DS_NAVIGATE') {
        const { url } = event.data
        if (!url) return

        const fromDesktop = event.source === desktopIframeRef.current?.contentWindow
        const fromMobile  = event.source === mobileIframeRef.current?.contentWindow

        if (!fromDesktop && !fromMobile) return

        // Mirror the navigation to the other viewport.
        const targetIframe = fromDesktop
          ? mobileIframeRef.current
          : desktopIframeRef.current

        if (targetIframe && targetIframe.src !== url) {
          targetIframe.src = url
        }

        // Lift URL to the parent App so the URL bar stays in sync.
        if (typeof onNavigate === 'function') {
          onNavigate(url)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [desktopIframeRef, mobileIframeRef, syncScroll, onNavigate, enabled])
}
