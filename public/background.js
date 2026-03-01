/**
 * background.js — DevStream Service Worker (Manifest V3)
 *
 * Responsibilities:
 *  1. Open the recorder window when the extension icon is clicked.
 *  2. Open a sign-in popup when the recorder requests it.
 *  3. Relay the Supabase session from the web dashboard to the auth window.
 *
 * NOTE: Service workers are stateless between events — do NOT store
 * mutable state here. Use chrome.storage if persistence is needed.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const RECORDER_WINDOW = { width: 1400, height: 900,  type: 'popup' }
const AUTH_WINDOW     = { width: 400,  height: 560,  type: 'popup' }

// Track window IDs to avoid duplicates.
let recorderWindowId = null
let authWindowId     = null

// ─── Action click: open recorder window ───────────────────────────────────────

chrome.action.onClicked.addListener(async () => {
  if (recorderWindowId !== null) {
    try {
      await chrome.windows.update(recorderWindowId, { focused: true })
      return
    } catch {
      recorderWindowId = null
    }
  }

  const win = await chrome.windows.create({
    url: chrome.runtime.getURL('recorder.html'),
    ...RECORDER_WINDOW,
    focused: true,
  })
  recorderWindowId = win.id
})

// ─── Clean up when windows are closed ─────────────────────────────────────────

chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === recorderWindowId) recorderWindowId = null
  if (windowId === authWindowId)     authWindowId     = null
})

// ─── Internal messages (from extension pages / content scripts) ───────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {

    case 'PING':
      sendResponse({ type: 'PONG', version: chrome.runtime.getManifest().version })
      return false

    case 'OPEN_AUTH_WINDOW':
      openAuthWindow()
      return false

    default:
      return false
  }
})

// ─── External messages (from the web dashboard at localhost:5174) ─────────────
// chrome.runtime.onMessage does NOT receive messages sent by web pages —
// those arrive on onMessageExternal instead.

chrome.runtime.onMessageExternal.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SYNC_SESSION') {
    const { accessToken, refreshToken } = message
    // Broadcast to all open extension pages so they can call setSession()
    chrome.runtime.sendMessage({ type: 'SET_SESSION', accessToken, refreshToken })
      .catch(() => {}) // ignore if no extension page is currently open
    sendResponse({ ok: true })
    return true
  }
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function openAuthWindow() {
  if (authWindowId !== null) {
    try {
      await chrome.windows.update(authWindowId, { focused: true })
      return
    } catch {
      authWindowId = null
    }
  }

  const win = await chrome.windows.create({
    url: chrome.runtime.getURL('auth.html'),
    ...AUTH_WINDOW,
    focused: true,
  })
  authWindowId = win.id
}
