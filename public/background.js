/**
 * background.js — DevStream Service Worker (Manifest V3)
 *
 * Responsibilities:
 *  1. Open the recorder window when the extension icon is clicked.
 *  2. Relay messages between the recorder page and any content scripts
 *     (future-proofing for Phase 2 features like proxy navigation).
 *
 * NOTE: Service workers are stateless between events — do NOT store
 * mutable state here. Use chrome.storage if persistence is needed.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const RECORDER_WINDOW = {
  width: 1400,
  height: 900,
  type: 'popup',
}

// Track the recorder window ID so we don't open duplicates.
let recorderWindowId = null

// ─── Action click: open recorder window ───────────────────────────────────────

chrome.action.onClicked.addListener(async () => {
  // If a recorder window is already open, focus it instead of creating another.
  if (recorderWindowId !== null) {
    try {
      await chrome.windows.update(recorderWindowId, { focused: true })
      return
    } catch {
      // Window was closed externally — fall through to create a new one.
      recorderWindowId = null
    }
  }

  const win = await chrome.windows.create({
    url: chrome.runtime.getURL('recorder.html'),
    type: RECORDER_WINDOW.type,
    width: RECORDER_WINDOW.width,
    height: RECORDER_WINDOW.height,
    focused: true,
  })

  recorderWindowId = win.id
})

// ─── Clean up when the recorder window is closed ──────────────────────────────

chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === recorderWindowId) {
    recorderWindowId = null
  }
})

// ─── Message relay ────────────────────────────────────────────────────────────
// The recorder page can send messages to the background worker for actions
// that require chrome.* APIs unavailable in regular extension pages.

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'PING':
      sendResponse({ type: 'PONG', version: chrome.runtime.getManifest().version })
      break

    default:
      // Unknown message — ignore silently.
      break
  }
  // Return true only when sendResponse will be called asynchronously.
  return false
})
