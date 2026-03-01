/**
 * useScrollSync — bidirectional scroll & navigation sync between two iframes.
 *
 * Scroll sync uses PERCENTAGE positions (0–1) so pages with different total
 * heights stay aligned (desktop vs mobile layout heights always differ).
 *
 * Loop prevention:
 *   isSyncingRef — set before posting DS_SCROLL_SET, cleared after two
 *   animation frames (enough for the content script to apply the scroll
 *   and suppress its own DS_SCROLL_REPORT reply).
 *
 * Interaction sync:
 *   DS_ANCHOR_CLICK — fired in capture phase before the browser follows
 *                     the link; navigates the opposite frame immediately.
 *   DS_NAVIGATE     — post-navigation confirmation for SPA routers,
 *                     popstate, and meta-refresh fallbacks.
 *
 * @param {React.RefObject} desktopIframeRef
 * @param {React.RefObject} mobileIframeRef
 * @param {Function}        onNavigate   called with new URL on any navigation
 * @param {boolean}         enabled      false = Independent Mode (no sync)
 */

import { useEffect, useRef } from 'react'

export default function useScrollSync(
  desktopIframeRef,
  mobileIframeRef,
  onNavigate,
  enabled = true
) {
  const isSyncingRef = useRef(false)

  useEffect(() => {
    if (!enabled) return

    function handleMessage(event) {
      if (!event.data || typeof event.data !== 'object') return
      const { type } = event.data

      // ── Scroll report: sync opposite frame ─────────────────────────────
      if (type === 'DS_SCROLL_REPORT') {
        if (isSyncingRef.current) return

        const fromDesktop = event.source === desktopIframeRef.current?.contentWindow
        const fromMobile  = event.source === mobileIframeRef.current?.contentWindow
        if (!fromDesktop && !fromMobile) return

        const targetIframe = fromDesktop ? mobileIframeRef.current : desktopIframeRef.current
        const targetWin    = targetIframe?.contentWindow
        if (!targetWin) return

        isSyncingRef.current = true
        targetWin.postMessage(
          {
            type: 'DS_SCROLL_SET',
            scrollTopPct:  Math.max(0, Math.min(1, event.data.scrollTopPct  ?? 0)),
            scrollLeftPct: Math.max(0, Math.min(1, event.data.scrollLeftPct ?? 0)),
          },
          '*'
        )

        // Clear lock after two frames — content script needs one frame to
        // apply the scroll and one frame to clear its own suppression flag.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            isSyncingRef.current = false
          })
        })
        return
      }

      // ── Anchor click: pre-navigation sync ──────────────────────────────
      if (type === 'DS_ANCHOR_CLICK') {
        const { url } = event.data
        if (!url) return

        const fromDesktop = event.source === desktopIframeRef.current?.contentWindow
        const fromMobile  = event.source === mobileIframeRef.current?.contentWindow
        if (!fromDesktop && !fromMobile) return

        const targetIframe = fromDesktop ? mobileIframeRef.current : desktopIframeRef.current
        if (targetIframe && targetIframe.src !== url) targetIframe.src = url
        onNavigate?.(url)
        return
      }

      // ── Post-navigation confirmation ────────────────────────────────────
      if (type === 'DS_NAVIGATE') {
        const { url } = event.data
        if (!url) return

        const fromDesktop = event.source === desktopIframeRef.current?.contentWindow
        const fromMobile  = event.source === mobileIframeRef.current?.contentWindow
        if (!fromDesktop && !fromMobile) return

        const targetIframe = fromDesktop ? mobileIframeRef.current : desktopIframeRef.current
        if (targetIframe && targetIframe.src !== url) targetIframe.src = url
        onNavigate?.(url)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [enabled, desktopIframeRef, mobileIframeRef, onNavigate])
}
