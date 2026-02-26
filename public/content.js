/**
 * content.js — DevStream Content Script
 *
 * Injected into ALL frames (including cross-origin iframes loaded in the
 * recorder's dual view). Provides the bridge between iframe pages and the
 * recorder window for:
 *
 *  1. Scroll synchronisation  — reports scroll position to the parent recorder
 *     and applies scroll commands received from it.
 *
 *  2. Navigation sync         — reports URL changes so the recorder can mirror
 *     navigation to the opposite viewport.
 *
 * Security note: We only communicate with our direct parent window using
 * structured-clone-safe plain objects. We validate the `type` field on every
 * incoming message and ignore anything we don't recognise.
 */

;(function devstreamContentScript() {
  // Avoid double-injection (can happen with dynamic iframes).
  if (window.__devstreamInjected) return
  window.__devstreamInjected = true

  // ── Scroll reporting ──────────────────────────────────────────────────────

  let scrollReportTimer = null

  window.addEventListener(
    'scroll',
    () => {
      // Throttle to one message per animation frame.
      if (scrollReportTimer) return
      scrollReportTimer = requestAnimationFrame(() => {
        scrollReportTimer = null
        window.parent.postMessage(
          {
            type: 'DS_SCROLL_REPORT',
            scrollTop: window.scrollY,
            scrollLeft: window.scrollX,
          },
          '*'
        )
      })
    },
    { passive: true }
  )

  // ── Scroll command handler ────────────────────────────────────────────────

  // Flag to suppress re-reporting a scroll triggered by DS_SCROLL_SET.
  let applyingExternalScroll = false

  window.addEventListener('message', (event) => {
    // Only accept plain-object messages.
    if (!event.data || typeof event.data !== 'object') return

    switch (event.data.type) {
      case 'DS_SCROLL_SET': {
        applyingExternalScroll = true
        window.scrollTo({
          top: event.data.scrollTop,
          left: event.data.scrollLeft,
          behavior: 'instant',
        })
        // Release the suppression flag after the next scroll event fires.
        requestAnimationFrame(() => {
          applyingExternalScroll = false
        })
        break
      }

      default:
        // Ignore unrecognised messages.
        break
    }
  })

  // ── Navigation sync ───────────────────────────────────────────────────────
  // Detect client-side navigation (SPA pushState / replaceState / hashchange)
  // and report the new URL to the parent recorder window.

  let lastHref = location.href

  function reportNavigation() {
    if (location.href !== lastHref) {
      lastHref = location.href
      window.parent.postMessage(
        {
          type: 'DS_NAVIGATE',
          url: location.href,
        },
        '*'
      )
    }
  }

  // Patch history API — these are not real events so we wrap them.
  const _pushState = history.pushState.bind(history)
  const _replaceState = history.replaceState.bind(history)

  history.pushState = function (...args) {
    _pushState(...args)
    reportNavigation()
  }

  history.replaceState = function (...args) {
    _replaceState(...args)
    reportNavigation()
  }

  window.addEventListener('popstate', reportNavigation)
  window.addEventListener('hashchange', reportNavigation)

  // Also poll as a fallback for edge-case navigations (e.g. meta refresh).
  setInterval(reportNavigation, 1500)
})()
