// Shared data model used by both the Electron main process and the renderer.

export type SlideKind = 'song' | 'scripture' | 'media' | 'black' | 'clear' | 'logo'

/** A single unit of lyrics/verse text that gets shown on the screen. */
export interface Slide {
  id: string
  /** Lines of text shown centered on the live output. */
  lines: string[]
  /** Optional small caption, e.g. "Verse 1" or "John 3:16 (KJV)". */
  label?: string
  /** Optional reference shown in a corner (used for scripture). */
  reference?: string
}

export interface Song {
  id: string
  title: string
  author?: string
  /** Optional copyright / CCLI info. */
  copyright?: string
  /** Raw lyrics text; blank lines separate slides, "Verse 1:" etc become labels. */
  lyrics: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

export interface MediaItem {
  id: string
  title: string
  /** Normalised 11-char YouTube video id. */
  youtubeId: string
  /** Original pasted url, kept for reference. */
  sourceUrl: string
  /** Optional start offset in seconds. */
  startSeconds?: number
  createdAt: number
  updatedAt: number
}

export type ScheduleItemType = 'song' | 'scripture' | 'media'

/** A scripture passage captured into a schedule (snapshot of verses). */
export interface ScripturePassage {
  versionId: string
  versionName: string
  book: string
  bookSlug: string
  chapter: number
  /** Inclusive verse range. */
  fromVerse: number
  toVerse: number
  verses: { verse: number; text: string }[]
}

export interface ScheduleItem {
  id: string
  type: ScheduleItemType
  title: string
  /** For songs. */
  songId?: string
  /** For media. */
  mediaId?: string
  /** For scripture (embedded snapshot so schedules stay portable/offline). */
  passage?: ScripturePassage
}

export interface Schedule {
  id: string
  name: string
  items: ScheduleItem[]
  createdAt: number
  updatedAt: number
}

export interface Theme {
  fontFamily: string
  fontSize: number
  textColor: string
  backgroundColor: string
  /** Optional background image data-url or file path. */
  backgroundImage?: string
  /** 0-1 dark overlay over the background image. */
  overlayOpacity: number
  textAlign: 'left' | 'center' | 'right'
  bold: boolean
  showReference: boolean
  lineHeight: number
  textShadow: boolean
}

export interface Settings {
  theme: Theme
  /** Preferred Bible version ids downloaded/cached locally. */
  installedBibleVersions: string[]
  /** Default version id used when opening the Bible panel. */
  defaultBibleVersion?: string
  /** Optional YouTube Data API key to enable in-app search. */
  youtubeApiKey?: string
  /** Which display index to send the live output to when going full screen. */
  liveDisplayId?: number
}

/** What is currently (or about to be) shown on the live output window. */
export interface LiveState {
  kind: SlideKind
  slide?: Slide
  media?: { youtubeId: string; startSeconds?: number; playing: boolean }
  /** Where this content came from, for the operator UI. */
  source?: { itemId?: string; title?: string; slideIndex?: number; slideCount?: number }
  theme: Theme
  /** Monotonic revision used to force live window refreshes. */
  rev: number
}

// ---- Bible types ----

export interface BibleVersionMeta {
  id: string
  version: string
  language: { name: string; code: string }
  scope?: string
  abbreviation?: string
}

export interface BibleBook {
  name: string
  slug: string
  chapters: number
  testament: 'OT' | 'NT'
}

export interface BibleChapter {
  versionId: string
  book: string
  bookSlug: string
  chapter: number
  verses: { verse: number; text: string }[]
}

// ---- IPC contract exposed on window.api ----

export interface Api {
  songs: {
    list(): Promise<Song[]>
    get(id: string): Promise<Song | null>
    save(song: Partial<Song> & { title: string; lyrics: string }): Promise<Song>
    remove(id: string): Promise<void>
  }
  media: {
    list(): Promise<MediaItem[]>
    save(item: Partial<MediaItem> & { sourceUrl: string; title: string }): Promise<MediaItem>
    remove(id: string): Promise<void>
  }
  schedules: {
    list(): Promise<Schedule[]>
    get(id: string): Promise<Schedule | null>
    save(schedule: Partial<Schedule> & { name: string }): Promise<Schedule>
    remove(id: string): Promise<void>
  }
  settings: {
    get(): Promise<Settings>
    save(patch: Partial<Settings>): Promise<Settings>
  }
  bible: {
    books(): Promise<BibleBook[]>
    installedVersions(): Promise<BibleVersionMeta[]>
    availableVersions(): Promise<BibleVersionMeta[]>
    installVersion(id: string): Promise<BibleVersionMeta>
    removeVersion(id: string): Promise<void>
    chapter(versionId: string, bookSlug: string, chapter: number): Promise<BibleChapter>
    search(versionId: string, query: string, limit?: number): Promise<
      { book: string; bookSlug: string; chapter: number; verse: number; text: string }[]
    >
  }
  live: {
    set(state: Partial<LiveState>): Promise<LiveState>
    get(): Promise<LiveState>
    show(): Promise<void>
    hide(): Promise<void>
    toggleFullscreen(): Promise<boolean>
    onUpdate(cb: (state: LiveState) => void): () => void
  }
  system: {
    displays(): Promise<{ id: number; label: string; bounds: { width: number; height: number } }[]>
    pickBackgroundImage(): Promise<string | null>
  }
}

declare global {
  interface Window {
    api: Api
    /** Present only in the live output window. */
    liveApi?: {
      onUpdate(cb: (state: LiveState) => void): () => void
      ready(): void
    }
  }
}
