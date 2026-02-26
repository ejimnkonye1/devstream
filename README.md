# DevStream

> Record dual-view (Desktop + Mobile) website sessions as a single MP4 file — directly from your browser, no backend required.

![Phase](https://img.shields.io/badge/phase-1%20MVP-blue) ![Manifest](https://img.shields.io/badge/manifest-v3-green) ![License](https://img.shields.io/badge/license-MIT-gray)

---

## What it does

DevStream opens a **1400 × 900 recorder window** with two live iframes side by side:

| Left | Right |
|------|-------|
| Desktop view — full responsive width | Mobile simulator — iPhone 14 Pro shell, 375 px viewport |

Both views load the same URL, stay scroll-synced, and mirror in-page navigation automatically. Hit **Record**, select the DevStream window in the screen picker, and everything is captured into a single downloadable video file.

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 18 |
| npm | 9 |
| Google Chrome | 116 (MV3 + MediaRecorder MP4 support) |

---

## Installation

### 1. Clone and install

```bash
git clone https://github.com/your-username/devstream.git
cd devstream
npm install
```

### 2. Build the extension

```bash
npm run build
```

This will:
1. Generate the PNG icons (`public/icons/`)
2. Bundle the React recorder UI with Vite
3. Output the ready-to-load extension to `dist/`

### 3. Load in Chrome

1. Open **chrome://extensions** in your browser
2. Toggle **Developer mode** on (top-right corner)
3. Click **Load unpacked**
4. Select the `dist/` folder inside the project

The DevStream icon will appear in your Chrome toolbar.

---

## Usage

### Opening the recorder

Click the **DevStream icon** in the Chrome toolbar. A 1400 × 900 popup window opens with the recorder interface.

> Clicking the icon again while the window is already open will focus the existing window instead of opening a duplicate.

### Loading a URL

1. Type or paste a URL into the address bar (e.g. `example.com` — `https://` is added automatically)
2. Press **Enter** or click **Load**

Both the Desktop and Mobile viewports will load the URL simultaneously.

### Recording

1. Click the red **Record** button
2. Chrome will show a **screen/window picker** — select the DevStream recorder window
3. Click **Share** in the picker to begin recording
4. The button changes to **Stop** with a pulsing indicator while recording is active
5. Click **Stop** when done — the video downloads automatically

> **Output format:** MP4 on Chrome 130+, WebM on older versions. Both play in any modern media player.

### Scroll sync

Scrolling in either the Desktop or Mobile view is automatically mirrored to the other. This works on:

- **Same-origin pages** — fully supported
- **Cross-origin pages** — supported via the injected content script (works on most sites)
- **Sites that block iframes** — not supported (see [Limitations](#limitations))

### Navigation sync

Clicking links or navigating within either viewport mirrors the new URL to the other view and updates the address bar automatically.

---

## Project structure

```
devstream/
├── public/                     # Copied verbatim to dist/ by Vite
│   ├── manifest.json           # Chrome Extension Manifest V3
│   ├── background.js           # Service worker — opens recorder window
│   ├── content.js              # Injected into iframes — scroll & nav bridge
│   └── icons/                  # Generated PNG icons (16, 48, 128 px)
├── src/recorder/
│   ├── App.jsx                 # Root component, owns URL state
│   ├── main.jsx                # React entry point
│   ├── index.css               # Tailwind + custom animations
│   ├── components/
│   │   ├── ControlBar.jsx      # URL input + record/stop controls
│   │   ├── DualView.jsx        # Side-by-side layout
│   │   └── MobileFrame.jsx     # iPhone shell + 375px iframe
│   └── hooks/
│       ├── useRecorder.js      # getDisplayMedia + MediaRecorder logic
│       └── useScrollSync.js    # postMessage scroll/nav sync bridge
├── scripts/
│   └── generate-icons.mjs     # Zero-dep PNG icon generator
├── recorder.html               # Vite HTML entry point
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Available scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Generate icons + full production build → `dist/` |
| `npm run build:ext` | Vite build only (skip icon generation) |
| `npm run generate-icons` | Regenerate PNG icons only |
| `npm run dev` | Vite dev server (UI preview only, not a loaded extension) |

---

## How scroll sync works

Cross-origin iframes cannot be scripted directly due to the browser's Same-Origin Policy. DevStream works around this using the **content script** (`content.js`), which the extension injects into every frame:

```
User scrolls in Desktop iframe
  → content.js detects scroll event
  → postMessage("DS_SCROLL_REPORT") to recorder window
  → recorder window forwards DS_SCROLL_SET to Mobile iframe's contentWindow
  → content.js in Mobile iframe calls window.scrollTo()
```

The same pattern handles navigation sync via `DS_NAVIGATE` messages.

---

## Limitations

| Limitation | Reason | Phase 2 plan |
|------------|--------|--------------|
| Sites with `X-Frame-Options: DENY` or `frame-ancestors 'none'` will show a blank iframe | Browser-enforced, no client-side workaround | Reverse proxy to strip security headers |
| Recording requires the user to manually select the window in the OS screen picker | `getDisplayMedia` mandates user gesture + explicit selection | No bypass possible by design (browser security) |
| Output may be WebM on Chrome < 130 | MP4 MediaRecorder support was added in Chrome 130 | Ship ffmpeg.wasm conversion in Phase 2 |
| No time limit enforced | MVP scope — record as long as needed | Configurable limits in Phase 2 |

---

## Permissions used

| Permission | Why |
|------------|-----|
| `tabs` | Reserved for future tab URL reading |
| `windows` | Create and focus the recorder popup window |
| `content_scripts` on `<all_urls>` | Inject scroll/nav bridge into iframe pages |

---

## Rebuilding after code changes

```bash
# After editing any source file:
npm run build

# Then reload the extension in Chrome:
# chrome://extensions → DevStream → click the ↺ refresh icon
```

---

## Phase 2 roadmap

- [ ] Reverse proxy to bypass iframe-blocking headers
- [ ] MP4 conversion via ffmpeg.wasm for older Chrome versions
- [ ] Configurable mobile device presets (Android, tablet, etc.)
- [ ] Annotation overlay (draw/highlight during recording)
- [ ] Cloud upload and shareable links
- [ ] Auth + team workspaces

---

## License

MIT © DevStream
