/**
 * devices.js — Device presets for the mobile emulator.
 *
 * shell geometry:
 *   outerWidth / outerHeight  — total frame size including border
 *   borderWidth               — frame border thickness (px, uniform)
 *   topBarH                   — height reserved for status bar chrome
 *   bottomBarH                — height reserved for home-indicator area
 *   type                      — 'ios' | 'android' (controls chrome rendering)
 *
 * viewportWidth — the CSS pixel width the site renders at inside the iframe.
 * platform      — 'ios' | 'android' — used by DeviceSelector badge
 * overlayScale  — CSS scale applied when the device floats as overlay
 *                 on top of the desktop view (both mode).
 */

export const DEVICES = [
  // ── iPhones ──────────────────────────────────────────────────────────────
  {
    id: 'iphone-se',
    label: 'iPhone SE (3rd gen)',
    viewportWidth: 375,
    platform: 'ios',
    overlayScale: 0.76,
    shell: {
      outerWidth: 393, outerHeight: 720,
      borderWidth: 4, borderRadius: '2.5rem',
      borderColor: '#374151', bg: '#030712',
      topBarH: 44, bottomBarH: 20,
      type: 'ios',
    },
  },
  {
    id: 'iphone-14',
    label: 'iPhone 14',
    viewportWidth: 390,
    platform: 'ios',
    overlayScale: 0.76,
    shell: {
      outerWidth: 408, outerHeight: 830,
      borderWidth: 4, borderRadius: '2.5rem',
      borderColor: '#374151', bg: '#030712',
      topBarH: 55, bottomBarH: 28,
      type: 'ios',
    },
  },
  {
    id: 'iphone-14-pro',
    label: 'iPhone 14 Pro',
    viewportWidth: 393,
    platform: 'ios',
    overlayScale: 0.76,
    shell: {
      outerWidth: 411, outerHeight: 852,
      borderWidth: 4, borderRadius: '2.5rem',
      borderColor: '#374151', bg: '#030712',
      topBarH: 55, bottomBarH: 28,
      type: 'ios',
    },
  },
  {
    id: 'iphone-14-pro-max',
    label: 'iPhone 14 Pro Max',
    viewportWidth: 430,
    platform: 'ios',
    overlayScale: 0.72,
    shell: {
      outerWidth: 448, outerHeight: 932,
      borderWidth: 4, borderRadius: '2.5rem',
      borderColor: '#374151', bg: '#030712',
      topBarH: 55, bottomBarH: 28,
      type: 'ios',
    },
  },
  {
    id: 'iphone-15-pro',
    label: 'iPhone 15 Pro',
    viewportWidth: 393,
    platform: 'ios',
    overlayScale: 0.76,
    shell: {
      outerWidth: 411, outerHeight: 852,
      borderWidth: 4, borderRadius: '2.75rem',
      borderColor: '#4B5563', bg: '#030712',
      topBarH: 55, bottomBarH: 28,
      type: 'ios',
    },
  },

  // ── Android ───────────────────────────────────────────────────────────────
  {
    id: 'galaxy-s24',
    label: 'Galaxy S24',
    viewportWidth: 360,
    platform: 'android',
    overlayScale: 0.76,
    shell: {
      outerWidth: 375, outerHeight: 780,
      borderWidth: 4, borderRadius: '2rem',
      borderColor: '#1e293b', bg: '#0a0a0f',
      topBarH: 44, bottomBarH: 20,
      type: 'android',
    },
  },
  {
    id: 'galaxy-s24-ultra',
    label: 'Galaxy S24 Ultra',
    viewportWidth: 412,
    platform: 'android',
    overlayScale: 0.72,
    shell: {
      outerWidth: 430, outerHeight: 900,
      borderWidth: 4, borderRadius: '2rem',
      borderColor: '#1e293b', bg: '#0a0a0f',
      topBarH: 44, bottomBarH: 20,
      type: 'android',
    },
  },
  {
    id: 'pixel-8',
    label: 'Pixel 8',
    viewportWidth: 393,
    platform: 'android',
    overlayScale: 0.76,
    shell: {
      outerWidth: 411, outerHeight: 840,
      borderWidth: 4, borderRadius: '2.25rem',
      borderColor: '#1e293b', bg: '#0a0a0f',
      topBarH: 44, bottomBarH: 20,
      type: 'android',
    },
  },
  {
    id: 'oneplus-12',
    label: 'OnePlus 12',
    viewportWidth: 412,
    platform: 'android',
    overlayScale: 0.72,
    shell: {
      outerWidth: 430, outerHeight: 900,
      borderWidth: 4, borderRadius: '2rem',
      borderColor: '#1e293b', bg: '#0a0a0f',
      topBarH: 44, bottomBarH: 20,
      type: 'android',
    },
  },
  {
    id: 'galaxy-a54',
    label: 'Galaxy A54',
    viewportWidth: 360,
    platform: 'android',
    overlayScale: 0.76,
    shell: {
      outerWidth: 378, outerHeight: 810,
      borderWidth: 4, borderRadius: '2rem',
      borderColor: '#1e293b', bg: '#0a0a0f',
      topBarH: 44, bottomBarH: 20,
      type: 'android',
    },
  },
]

export const DEFAULT_DEVICE_ID = 'iphone-14-pro'

export function findDevice(id) {
  return DEVICES.find((d) => d.id === id) ?? DEVICES[0]
}

export function getDevicesByPlatform() {
  return {
    ios:     DEVICES.filter((d) => d.platform === 'ios'),
    android: DEVICES.filter((d) => d.platform === 'android'),
  }
}
