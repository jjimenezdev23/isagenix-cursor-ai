# Worship Presenter 2.0

An easy-to-use, **offline-first church presentation app** — think "EasyWorship 2.0" for your
local church. Show **songs**, the **Bible in many versions/languages**, and **YouTube worship
videos / Psalms** on a projector or second screen, all from one simple operator window.

It is built to run **on one computer, locally**. Nothing is published online and there is no
account or server. The only time it uses the internet is to *download* Bible translations and to
*stream* the YouTube videos you add — everything else (songs, service plans, settings, and any
Bible passages you have already opened) is stored on the machine and works with no connection.

---

## What it can do

- **Songs** — add songs with lyrics, author, copyright/CCLI and tags. Lyrics are turned into
  slides automatically (blank lines separate slides; `Verse 1`, `Chorus`, `Bridge`… become
  labels). Long sections are split so text always fits on screen.
- **Bible** — pick from **many translations in many languages**. Browse by book/chapter, jump to a
  reference like `John 3:16-18` or `Psalm 23`, select verses, and send them to the screen. Passages
  you open are cached so they work offline afterwards.
- **YouTube (Psalms / worship videos)** — paste any YouTube link (or video id). It plays full
  screen on the projector. Great for Psalms, hymns and lyric videos.
- **Service plan** — build an ordered "service" from songs, scriptures and videos. Reorder, remove,
  click to load, double-click to go live.
- **Two-screen output** — a separate **Live Output** window goes full screen on your projector/TV
  (second display detected automatically). The operator window has **Live** and **Preview**
  monitors so you always see what's on screen and what's next.
- **Appearance** — fonts, sizes, colors, alignment, background image + darkening, and reference
  display, with a live preview.
- **Fast keyboard control** — `Space`/`→` next, `←` previous, `Enter` go live, `B` black,
  `C` clear, `L` logo.

## Getting started (development)

Requirements: **Node.js 18+** (tested on Node 22).

```bash
cd worship-presenter
npm install
npm run dev        # launches the app with hot reload
```

On first run, open the **Bible** tab → **Add Bible versions**, pick one or more translations
(needs internet once), then start browsing.

## Building an installable app

```bash
npm run build          # compile everything into ./out
npm run dist           # package an installer for the current OS (./release)
# or target a platform explicitly:
npm run dist:win       # Windows (.exe / NSIS)
npm run dist:mac       # macOS (.dmg)
npm run dist:linux     # Linux (AppImage)
```

Copy the resulting installer from `release/` to the church computer and install it — no internet
required to run (only to download new Bible versions or stream YouTube).

## How to run a service

1. **Build your service** — in **Songs**, **Bible**, or **Media**, click the **＋** on an item to
   add it to the current service (left **Service** tab). Create/rename services with the selector
   at the top.
2. **Connect the projector** as a second screen, then click **Go full screen** (top bar). The
   Live Output opens full screen on it.
3. **Present** — click an item to load its slides in the center, click a slide to *preview* it,
   then press **Enter** / **Go Live**. Use `Space`/arrow keys to move through slides. Use **Black**,
   **Clear**, or **Logo** at any time.

## Where is my data stored?

Everything is saved locally in Electron's per-user data folder:

- `worship-data.json` — songs, videos, service plans, and settings.
- `bible-cache/` — downloaded Bible version list and every chapter you've opened (for offline use).

Typical locations:
- Windows: `%APPDATA%/worship-presenter`
- macOS: `~/Library/Application Support/worship-presenter`
- Linux: `~/.config/worship-presenter`

## Tech

Electron + Vite + React + TypeScript. Local JSON storage (no database/native modules to install).
Bible text comes from the open [wldeh/bible-api](https://github.com/wldeh/bible-api) dataset and is
cached locally after first use.

## Notes & ideas for later

- In-app YouTube *search* (currently you paste links) can be enabled by adding a YouTube Data API
  key — a settings field for the key is already reserved.
- Import/export of song libraries and services (e.g. to move between computers).
- Importing songs from other apps' formats.
