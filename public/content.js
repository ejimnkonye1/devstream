/**
 * content.js — DevStream Content Script
 *
 * Injected into ALL frames. Bridges iframe pages and the recorder window for:
 *
 *  1. Scroll synchronisation  — reports scroll percentage to the recorder
 *     and applies percentage-based scroll commands received from it.
 *
 *  2. Navigation sync         — reports URL changes for mirror navigation.
 *
 *  3. Anchor click sync       — intercepts anchor clicks in capture phase
 *     before navigation, posting DS_ANCHOR_CLICK immediately (faster than
 *     the 1500ms polling fallback).
 *
 *  4. Iframe liveness         — DS_PING / DS_PONG token matching.
 */

;(function devstreamContentScript() {
  if (window.__devstreamInjected) return
  window.__devstreamInjected = true

  // ── Scroll reporting (percentage-based) ───────────────────────────────────

  let scrollReportTimer = null

  window.addEventListener(
    'scroll',
    () => {
      // Suppress re-reporting a scroll that WE applied from DS_SCROLL_SET.
      if (applyingExternalScroll) return

      // Debounce: 50 ms quiet period before sending.
      if (scrollReportTimer) clearTimeout(scrollReportTimer)
      scrollReportTimer = setTimeout(() => {
        scrollReportTimer = null

        const maxY = document.documentElement.scrollHeight - document.documentElement.clientHeight
        const maxX = document.documentElement.scrollWidth  - document.documentElement.clientWidth

        window.parent.postMessage(
          {
            type: 'DS_SCROLL_REPORT',
            // Percentage fields (0–1) — primary, used by upgraded recorder
            scrollTopPct:  maxY > 0 ? window.scrollY / maxY : 0,
            scrollLeftPct: maxX > 0 ? window.scrollX / maxX : 0,
            // Raw pixel fields — kept for backwards compatibility
            scrollTop:  window.scrollY,
            scrollLeft: window.scrollX,
          },
          '*'
        )
      }, 50)
    },
    { passive: true }
  )

  // ── Message handler ────────────────────────────────────────────────────────

  let applyingExternalScroll = false

  window.addEventListener('message', (event) => {
    if (!event.data || typeof event.data !== 'object') return

    switch (event.data.type) {

      // ── Apply scroll from recorder ─────────────────────────────────────
      case 'DS_SCROLL_SET': {
        applyingExternalScroll = true

        const maxY = document.documentElement.scrollHeight - document.documentElement.clientHeight
        const maxX = document.documentElement.scrollWidth  - document.documentElement.clientWidth

        // Prefer percentage fields; fall back to raw pixels (old senders).
        const top  = event.data.scrollTopPct  != null
          ? event.data.scrollTopPct  * maxY
          : (event.data.scrollTop  ?? 0)
        const left = event.data.scrollLeftPct != null
          ? event.data.scrollLeftPct * maxX
          : (event.data.scrollLeft ?? 0)

        window.scrollTo({ top, left, behavior: 'instant' })

        requestAnimationFrame(() => {
          applyingExternalScroll = false
        })
        break
      }

      // ── Ping / Pong — iframe liveness detection ────────────────────────
      case 'DS_PING': {
        window.parent.postMessage(
          { type: 'DS_PONG', token: event.data.token, url: location.href },
          '*'
        )
        break
      }

      default:
        break
    }
  })

  // ── Anchor click interception ──────────────────────────────────────────────
  // Fires in capture phase BEFORE the browser follows the link.
  // Posts DS_ANCHOR_CLICK so the opposite iframe can pre-navigate.
  // We never call preventDefault — normal navigation still proceeds.

  document.addEventListener(
    'click',
    (e) => {
      const anchor = e.target.closest('a[href]')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return

      try {
        const resolved = new URL(href, location.href).href
        window.parent.postMessage({ type: 'DS_ANCHOR_CLICK', url: resolved }, '*')
      } catch {
        // Malformed URL — ignore silently.
      }
    },
    true // capture phase
  )

  // ── Navigation sync ────────────────────────────────────────────────────────

  let lastHref = location.href

  function reportNavigation() {
    if (location.href !== lastHref) {
      lastHref = location.href
      window.parent.postMessage({ type: 'DS_NAVIGATE', url: location.href }, '*')
    }
  }

  const _pushState    = history.pushState.bind(history)
  const _replaceState = history.replaceState.bind(history)

  history.pushState = function (...args) {
    _pushState(...args)
    reportNavigation()
  }

  history.replaceState = function (...args) {
    _replaceState(...args)
    reportNavigation()
  }

  window.addEventListener('popstate',   reportNavigation)
  window.addEventListener('hashchange', reportNavigation)

  // Fallback polling for edge-case navigations (meta refresh, etc.)
  setInterval(reportNavigation, 1500)
})()
