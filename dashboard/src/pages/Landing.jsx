import { Link } from 'react-router-dom'

const CHROME_STORE_URL = '#' // replace with CWS link once published

function Logo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect width="22" height="22" rx="5" fill="#3B82F6"/>
      <polygon points="8,6 17,11 8,16" fill="white"/>
      <rect x="5" y="6" width="2" height="10" rx="1" fill="white"/>
    </svg>
  )
}

export default function Landing() {
  return (
    <div className="bg-[#030712] text-white antialiased">

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#030712]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 select-none">
            <Logo />
            <span className="font-semibold text-[15px] tracking-tight">DevStream</span>
          </a>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="hidden sm:inline text-sm text-gray-400 hover:text-white transition-colors">
              Dashboard →
            </Link>
            <a href={CHROME_STORE_URL}
               className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-600/20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              Add to Chrome
            </a>
          </div>
        </div>
      </header>


      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="hero-glow pt-24 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-950/50 border border-blue-900/50 rounded-full text-blue-400 text-xs font-medium mb-8 select-none">
            <Logo size={11} />
            Chrome Extension &nbsp;·&nbsp; Free
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.08] mb-6">
            Record responsive.<br/>
            <span className="text-blue-400">Share instantly.</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 leading-relaxed mb-10 max-w-2xl mx-auto">
            Capture your website in desktop&nbsp;+&nbsp;mobile views simultaneously —
            perfectly scroll-synced — then share a link in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a href={CHROME_STORE_URL}
               className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5 shadow-xl shadow-blue-600/25">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              Add to Chrome — it's free
            </a>
            <Link to="/dashboard"
               className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.10] hover:border-white/[0.18] text-white text-sm font-medium rounded-xl transition-colors">
              View Dashboard
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>

          <p className="text-xs text-gray-600 tracking-wide">
            Built for frontend developers &amp; QA engineers
          </p>
        </div>

        {/* Product mockup */}
        <div className="max-w-5xl mx-auto mt-16 px-2 sm:px-0">
          <div className="rounded-2xl border border-white/[0.08] bg-gray-900/50 shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden">

            {/* Browser chrome */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#111827] border-b border-gray-800">
              <div className="flex gap-1.5 flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-red-500/60"/>
                <div className="w-3 h-3 rounded-full bg-yellow-500/60"/>
                <div className="w-3 h-3 rounded-full bg-green-500/60"/>
              </div>
              <div className="flex-1 flex items-center gap-3 min-w-0">
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Logo size={15} />
                  <span className="text-white text-xs font-semibold">DevStream</span>
                </div>
                <div className="flex-1 min-w-0 hidden sm:block">
                  <div className="max-w-xs bg-[#1F2937] rounded px-3 py-1 text-xs text-gray-500 font-mono truncate">
                    https://your-site.com
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1F2937] rounded-md flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 rec-dot flex-shrink-0"/>
                  <span className="text-white text-xs font-mono tabular-nums">00:42</span>
                  <span className="hidden sm:inline text-gray-600 text-xs">·</span>
                  <span className="hidden sm:inline text-gray-400 text-xs">iPhone 14 Pro</span>
                  <span className="hidden sm:inline text-gray-600 text-xs">·</span>
                  <span className="hidden sm:inline text-gray-500 text-xs tabular-nums">393px</span>
                  <span className="px-1 py-0.5 bg-green-900/50 text-green-400 rounded text-[9px] font-bold tracking-wide leading-none ml-0.5">SYNCED</span>
                </div>
              </div>
            </div>

            {/* Dual-view content area */}
            <div className="flex h-56 sm:h-72 bg-[#030712]">

              {/* Desktop pane */}
              <div className="flex-1 border-r border-gray-800 p-5 flex flex-col gap-3 overflow-hidden">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-4 h-4 bg-blue-600/40 rounded"/>
                  <div className="h-2 bg-gray-800 rounded w-20"/>
                  <div className="flex gap-3 ml-auto">
                    <div className="h-2 bg-gray-800/60 rounded w-10"/>
                    <div className="h-2 bg-gray-800/60 rounded w-10"/>
                    <div className="h-2 bg-gray-800/60 rounded w-10"/>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-3 bg-gray-700/60 rounded w-2/3"/>
                  <div className="h-2 bg-gray-800/60 rounded w-full"/>
                  <div className="h-2 bg-gray-800/60 rounded w-5/6"/>
                </div>
                <div className="flex gap-2 mt-1">
                  <div className="h-7 w-24 bg-blue-700/40 rounded-lg"/>
                  <div className="h-7 w-20 bg-gray-800/50 border border-gray-700/50 rounded-lg"/>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="h-14 bg-gray-800/30 border border-gray-800/50 rounded-lg"/>
                  <div className="h-14 bg-gray-800/30 border border-gray-800/50 rounded-lg"/>
                  <div className="h-14 bg-gray-800/30 border border-gray-800/50 rounded-lg"/>
                </div>
                <div className="mt-auto">
                  <span className="text-[9px] text-gray-700 font-mono tracking-wide">Desktop · 1280px</span>
                </div>
              </div>

              {/* Mobile pane */}
              <div className="w-32 sm:w-44 flex items-center justify-center p-4 bg-[#030712]">
                <div className="relative rounded-[1.4rem] bg-[#111827] overflow-hidden shadow-2xl"
                     style={{ width: '100%', aspectRatio: '9/19.5', border: '4px solid #374151' }}>
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-2.5 bg-black rounded-full z-10"/>
                  <div className="flex items-center justify-between px-3 pt-1.5 pb-0.5">
                    <span className="text-white text-[7px] font-mono">9:41</span>
                    <div className="flex gap-0.5">
                      <div className="w-2.5 h-1.5 bg-gray-600 rounded-sm"/>
                      <div className="w-1.5 h-1.5 bg-gray-600 rounded-sm"/>
                      <div className="w-1.5 h-1.5 bg-gray-600 rounded-sm"/>
                    </div>
                  </div>
                  <div className="px-2 py-1 flex flex-col gap-1.5 bg-[#030712] h-full">
                    <div className="flex items-center gap-1 mb-0.5">
                      <div className="w-2.5 h-2.5 bg-blue-600/40 rounded-sm"/>
                      <div className="h-1.5 bg-gray-800 rounded w-10"/>
                    </div>
                    <div className="h-2 bg-gray-700/50 rounded w-3/5"/>
                    <div className="h-1.5 bg-gray-800/60 rounded w-full"/>
                    <div className="h-1.5 bg-gray-800/60 rounded w-5/6"/>
                    <div className="flex gap-1 mt-0.5">
                      <div className="h-5 flex-1 bg-blue-700/40 rounded"/>
                      <div className="h-5 flex-1 bg-gray-800/50 border border-gray-700/50 rounded"/>
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      <div className="h-8 bg-gray-800/30 border border-gray-800/50 rounded"/>
                      <div className="h-8 bg-gray-800/30 border border-gray-800/50 rounded"/>
                    </div>
                    <div className="mt-auto pb-0.5 flex justify-center">
                      <div className="w-10 h-1 bg-gray-600/60 rounded-full"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-12 bg-gradient-to-t from-[#030712] to-transparent -mt-12 pointer-events-none relative z-10"/>
          </div>
        </div>
      </section>


      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Everything you need to ship faster</h2>
            <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
              Built around the workflow of modern frontend teams — record, review, iterate, and share without friction.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                color: 'blue',
                icon: (
                  <svg width="22" height="16" viewBox="0 0 28 20" fill="none" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round">
                    <rect x="1" y="1" width="17" height="12" rx="1.5"/>
                    <line x1="6" y1="18" x2="13" y2="18"/><line x1="9.5" y1="13" x2="9.5" y2="18"/>
                    <rect x="19" y="5" width="8" height="14" rx="1.2"/>
                  </svg>
                ),
                title: 'Dual-view Recording',
                body: 'Desktop and mobile captured side-by-side in a single video. No stitching, no post-processing.',
              },
              {
                color: 'green',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round">
                    <path d="M21.5 2v6h-6"/><path d="M2.5 22v-6h6"/>
                    <path d="M2 11.5a10 10 0 0 1 18.8-2.3"/><path d="M22 12.5a10 10 0 0 1-18.8 2.2"/>
                  </svg>
                ),
                title: 'Percentage Scroll Sync',
                body: 'Scroll position tracked as a ratio (0–1) so both views stay aligned even when page heights differ.',
              },
              {
                color: 'purple',
                icon: (
                  <svg width="18" height="20" viewBox="0 0 24 24" fill="none" stroke="#C084FC" strokeWidth="2" strokeLinecap="round">
                    <rect x="5" y="2" width="14" height="20" rx="2"/>
                    <circle cx="12" cy="17" r="1" fill="#C084FC" stroke="none"/>
                  </svg>
                ),
                title: '10 Device Presets',
                body: 'iPhone SE through 15 Pro, Galaxy S24 Ultra, Pixel 8, OnePlus 12 — accurate viewports and bezels.',
              },
              {
                color: 'sky',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
                  </svg>
                ),
                title: 'Cloud Storage',
                body: 'Recordings upload to Supabase automatically. Access and manage your sessions from anywhere.',
              },
              {
                color: 'orange',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FB923C" strokeWidth="2" strokeLinecap="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                ),
                title: 'Shareable Links',
                body: 'One-click share URL per recording. Recipients can watch without signing in — perfect for async reviews.',
              },
              {
                color: 'red',
                icon: (
                  <svg width="18" height="20" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                ),
                title: 'Privacy First',
                body: 'Row-level security via Supabase RLS ensures your recordings are only accessible to you.',
              },
            ].map(({ color, icon, title, body }) => (
              <div key={title} className="bg-[#111827] border border-gray-800 hover:border-gray-700 rounded-2xl p-6 transition-colors">
                <div className={`w-11 h-11 bg-${color}-950/60 border border-${color}-900/40 rounded-xl flex items-center justify-center mb-5`}>
                  {icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="py-28 px-6 border-y border-gray-800/50 bg-[#111827]/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Up and running in 60 seconds</h2>
            <p className="text-gray-500 max-w-md mx-auto">No configuration. No accounts to set up first. Install and start recording immediately.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 relative">
            <div className="hidden sm:block absolute top-[2.2rem] left-[calc(16.7%+3rem)] right-[calc(16.7%+3rem)] h-px"
                 style={{ background: 'linear-gradient(90deg, transparent, #374151, transparent)' }}/>

            {[
              {
                step: '01', accent: true,
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                ),
                title: 'Install',
                body: 'Add DevStream from the Chrome Web Store. No sign-in required to start recording locally.',
              },
              {
                step: '02', accent: false,
                icon: <span className="w-4 h-4 rounded-full bg-red-500 rec-dot block"/>,
                title: 'Record',
                body: 'Enter any URL, choose a device, and hit Record. Both views sync and capture simultaneously.',
              },
              {
                step: '03', accent: false,
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                    <polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                ),
                title: 'Share',
                body: 'Upload to the cloud and copy your share link. Anyone can view — no login needed.',
              },
            ].map(({ step, accent, icon, title, body }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className={`relative z-10 w-[4.5rem] h-[4.5rem] rounded-2xl flex items-center justify-center mb-6 ${
                  accent ? 'bg-blue-600 shadow-lg shadow-blue-600/30' : 'bg-[#1F2937] border border-gray-700'
                }`}>
                  {icon}
                </div>
                <p className={`text-xs font-mono tracking-widest uppercase mb-2 ${accent ? 'text-blue-500' : 'text-gray-600'}`}>
                  Step {step}
                </p>
                <h3 className="text-white font-semibold text-lg mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── CTA Banner ──────────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative rounded-3xl overflow-hidden border border-blue-900/40 bg-gradient-to-br from-blue-950/60 via-[#111827] to-[#111827] px-8 py-20">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true"/>
            <h2 className="relative text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
              Start recording in 60 seconds
            </h2>
            <p className="relative text-gray-400 text-lg mb-10">Free forever for personal use. No credit card required.</p>
            <a href={CHROME_STORE_URL}
               className="relative inline-flex items-center gap-2.5 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold rounded-2xl transition-all hover:-translate-y-0.5 shadow-2xl shadow-blue-600/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              Add DevStream to Chrome
            </a>
            <p className="relative text-gray-600 text-xs mt-5 tracking-wide">Works on Chrome · Edge · Brave</p>
          </div>
        </div>
      </section>


      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-800/70 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <a href="/" className="flex items-center gap-2 select-none">
            <Logo />
            <span className="font-semibold text-sm text-white">DevStream</span>
          </a>
          <p className="text-gray-700 text-xs text-center">
            Built with React, Supabase &amp; the Chrome Extension APIs
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <a href="https://github.com/ejimnkonye1/devstream" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
