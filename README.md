# DevStream

> Record your website in **desktop + mobile views simultaneously** — perfectly scroll-synced — then share a link in seconds.

![Phase](https://img.shields.io/badge/phase-3%20complete-blue)
![Manifest](https://img.shields.io/badge/manifest-v3-green)
![License](https://img.shields.io/badge/license-MIT-gray)

---

## What it does

DevStream is a Chrome extension that opens a **1400 × 900 recorder window** showing two live viewports side by side:

| Left | Right |
|------|-------|
| Desktop — full responsive width | Mobile — real device shell (10 presets) |

Both views load the same URL, stay **percentage-based scroll-synced**, mirror anchor-click navigation automatically, and are recorded as a single video. Recordings upload to the cloud and get a **shareable link** with one click.

---

## Install (no build required)

### Option A — Download the prebuilt extension

1. Go to the [**Releases**](../../releases) page
2. Download `devstream-extension.zip` from the latest release
3. Unzip it anywhere on your machine
4. Open **chrome://extensions** in Chrome
5. Toggle **Developer mode** ON (top-right)
6. Click **Load unpacked** → select the unzipped folder

The DevStream icon will appear in your Chrome toolbar. Click it to open the recorder.

> Works on Chrome, Edge, and Brave.

---

### Option B — Build from source

#### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | 9+ |
| Chrome / Edge / Brave | 116+ |

#### 1. Clone and install

```bash
git clone https://github.com/ejimnkonye1/devstream.git
cd devstream
npm install
```

#### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in your Supabase project values in `.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_DASHBOARD_URL=http://localhost:5174
VITE_EXTENSION_ID=   # fill in after loading the extension
```

> **Note:** The anon key is safe to expose in the client — Supabase RLS enforces access control.

#### 3. Build the extension

```bash
npm run build:ext
```

Output goes to `dist/`.

#### 4. Load in Chrome

1. Open **chrome://extensions**
2. Toggle **Developer mode** ON
3. Click **Load unpacked** → select the `dist/` folder

---

## Cloud dashboard (optional)

The dashboard lets you manage recordings, search/filter, and share links.

```bash
cd dashboard
cp .env.example .env   # fill in Supabase values + extension ID
npm install
npm run dev            # runs at http://localhost:5174
```

### Supabase setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Run the migration in **SQL Editor**:

```bash
# paste the contents of supabase/migrations/001_schema.sql
```

3. Create a **Storage bucket** named `recordings` (set to private)
4. Enable **Google OAuth** under Auth → Providers

---

## Using the recorder

### Load a URL
Type any URL in the address bar (e.g. `example.com`) and press **Enter** or click **Load**.

### Device picker
Click the device dropdown to choose from 10 presets:

| iOS | Android |
|-----|---------|
| iPhone SE (3rd gen) | Galaxy S24 |
| iPhone 14 | Galaxy S24 Ultra |
| iPhone 14 Pro | Pixel 8 |
| iPhone 14 Pro Max | OnePlus 12 |
| iPhone 15 Pro | Galaxy A54 |

### Sync toggle
The **Sync** button (green = ON) enables percentage-based scroll sync and anchor-click mirroring between the two views. Toggle it off to scroll each view independently.

### Height modes
| Mode | Description |
|------|-------------|
| **Preset** | Device's native aspect ratio |
| **Fill** | 90% of your window height |
| **½** | 45% of your window height |

### Width slider
Drag the slider (300–500 px) to override the viewport width of the mobile view.

### Recording
1. Click **Record** (red button)
2. Select the DevStream window in the screen picker → click **Share**
3. Click **Stop** when done
4. A save dialog appears — title your recording and upload it to the cloud, or skip to download locally

> Output: MP4 on Chrome 130+, WebM on older versions.

---

## Project structure

```
devstream/
├── public/
│   ├── manifest.json        # Chrome Extension Manifest V3
│   ├── background.js        # Service worker
│   └── content.js           # Injected scroll/navigation bridge
├── src/recorder/
│   ├── App.jsx              # Root — owns all state
│   ├── devices.js           # 10 device presets
│   ├── components/
│   │   ├── ControlBar.jsx   # URL bar, device picker, recording controls
│   │   ├── DualView.jsx     # Layout manager (desktop / both / mobile)
│   │   ├── MobileFrame.jsx  # Phone shell + iframe
│   │   └── DeviceSelector.jsx
│   └── hooks/
│       ├── useRecorder.js   # getDisplayMedia + MediaRecorder
│       └── useScrollSync.js # postMessage scroll/nav bridge
├── dashboard/               # Standalone web dashboard (Vite + React)
│   └── src/
│       ├── pages/           # Dashboard, Login, Share
│       ├── components/      # VideoCard, FilterBar, AnalyticsSummary
│       └── hooks/           # useRecordings, useAuth
├── landing/
│   └── index.html           # Marketing landing page (no build needed)
├── supabase/
│   └── migrations/          # SQL schema
└── .env.example
```

---

## How scroll sync works

```
User scrolls Desktop iframe
  → content.js reports scrollTopPct (0–1) via postMessage DS_SCROLL_REPORT
  → useScrollSync forwards DS_SCROLL_SET with the same pct to Mobile iframe
  → content.js in Mobile resolves pct × maxScrollY and calls scrollTo()
```

Percentage-based sync means the two views stay aligned even when the desktop
and mobile page heights differ significantly.

Anchor clicks are also intercepted (capture phase) and mirrored via `DS_ANCHOR_CLICK`
so both views navigate together without waiting for a page-load event.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build:ext` | Build extension → `dist/` |
| `npm run dev` | Vite dev server (UI preview only) |
| `cd dashboard && npm run dev` | Run the dashboard locally |
| `cd dashboard && npm run build` | Build the dashboard |

---

## Limitations

| Issue | Reason |
|-------|--------|
| Sites with `X-Frame-Options: DENY` show a blank iframe | Browser-enforced |
| Recording requires manually selecting the window | `getDisplayMedia` security requirement |
| No iOS/Android real-device testing | Simulated viewport only |

---

## License

MIT © DevStream
