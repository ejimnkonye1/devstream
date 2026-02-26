/**
 * devices.js — Emulator device presets
 *
 * shell geometry:
 *   outerWidth / outerHeight  — total frame size including border
 *   borderWidth               — frame border thickness (px, uniform)
 *   topBarH                   — height reserved for status bar chrome
 *   bottomBarH                — height reserved for home-indicator area
 *   type                      — 'ios' | 'android' | 'tablet'  (controls chrome rendering)
 *
 * viewportWidth — the CSS pixel width the site is asked to render at.
 *   For phones this fits naturally inside the content area.
 *   For iPad (744 > contentAreaWidth 554), the iframe is CSS-scaled down
 *   so the site still renders at 744 px but is displayed smaller.
 *
 * overlayScale — how much to shrink the shell when shown as a
 *   floating overlay on top of the desktop view (both mode).
 */

export const DEVICES = [
  {
    id: 'iphone-14-pro',
    label: 'iPhone 14 Pro',
    viewportWidth: 375,
    overlayScale: 0.76,
    shell: {
      outerWidth: 393,
      outerHeight: 780,
      borderWidth: 4,
      borderRadius: '2.5rem',
      borderColor: '#374151',
      bg: '#030712',
      topBarH: 55,
      bottomBarH: 28,
      type: 'ios',
    },
  },
  {
    id: 'galaxy-s24',
    label: 'Galaxy S24',
    viewportWidth: 360,
    overlayScale: 0.76,
    shell: {
      outerWidth: 375,
      outerHeight: 780,
      borderWidth: 4,
      borderRadius: '2rem',
      borderColor: '#1e293b',
      bg: '#0a0a0f',
      topBarH: 44,
      bottomBarH: 20,
      type: 'android',
    },
  },
  {
    id: 'ipad-mini',
    label: 'iPad Mini',
    viewportWidth: 744,
    overlayScale: 0.62,
    shell: {
      outerWidth: 570,
      outerHeight: 780,
      borderWidth: 8,
      borderRadius: '1.5rem',
      borderColor: '#3a3a3c',
      bg: '#1c1c1e',
      topBarH: 40,
      bottomBarH: 30,
      type: 'tablet',
    },
  },
]

export const DEFAULT_DEVICE_ID = 'iphone-14-pro'

export function findDevice(id) {
  return DEVICES.find((d) => d.id === id) ?? DEVICES[0]
}
