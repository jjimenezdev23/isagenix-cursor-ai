import { app } from 'electron'
import { promises as fs } from 'fs'
import { join } from 'path'
import type { Schedule, Settings, Song, MediaItem, Theme } from '../shared/types'

// Simple, dependency-free JSON storage in the OS userData directory.
// This keeps everything local to the machine (no server, no cloud).

interface Db {
  songs: Song[]
  media: MediaItem[]
  schedules: Schedule[]
  settings: Settings
}

const DEFAULT_THEME: Theme = {
  fontFamily: 'Inter, Segoe UI, Roboto, sans-serif',
  fontSize: 64,
  textColor: '#ffffff',
  backgroundColor: '#0b132b',
  overlayOpacity: 0.35,
  textAlign: 'center',
  bold: true,
  showReference: true,
  lineHeight: 1.25,
  textShadow: true
}

const DEFAULT_SETTINGS: Settings = {
  theme: DEFAULT_THEME,
  installedBibleVersions: [],
  defaultBibleVersion: undefined,
  youtubeApiKey: undefined,
  liveDisplayId: undefined
}

function emptyDb(): Db {
  return { songs: [], media: [], schedules: [], settings: DEFAULT_SETTINGS }
}

let cache: Db | null = null
let writeQueue: Promise<void> = Promise.resolve()

function dbPath(): string {
  return join(app.getPath('userData'), 'worship-data.json')
}

export async function loadDb(): Promise<Db> {
  if (cache) return cache
  try {
    const raw = await fs.readFile(dbPath(), 'utf-8')
    const parsed = JSON.parse(raw) as Partial<Db>
    cache = {
      songs: parsed.songs ?? [],
      media: parsed.media ?? [],
      schedules: parsed.schedules ?? [],
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings, theme: { ...DEFAULT_THEME, ...parsed.settings?.theme } }
    }
  } catch {
    cache = emptyDb()
    await persist()
  }
  return cache
}

async function persist(): Promise<void> {
  const data = cache ?? emptyDb()
  // Serialise writes so concurrent saves never corrupt the file.
  writeQueue = writeQueue.then(async () => {
    const tmp = dbPath() + '.tmp'
    await fs.mkdir(app.getPath('userData'), { recursive: true })
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8')
    await fs.rename(tmp, dbPath())
  })
  return writeQueue
}

export const now = (): number => Date.now()
export const newId = (): string => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`)

// ---- Songs ----
export async function listSongs(): Promise<Song[]> {
  const db = await loadDb()
  return [...db.songs].sort((a, b) => a.title.localeCompare(b.title))
}

export async function getSong(id: string): Promise<Song | null> {
  const db = await loadDb()
  return db.songs.find((s) => s.id === id) ?? null
}

export async function saveSong(input: Partial<Song> & { title: string; lyrics: string }): Promise<Song> {
  const db = await loadDb()
  if (input.id) {
    const existing = db.songs.find((s) => s.id === input.id)
    if (existing) {
      Object.assign(existing, {
        title: input.title,
        author: input.author,
        copyright: input.copyright,
        lyrics: input.lyrics,
        tags: input.tags ?? existing.tags,
        updatedAt: now()
      })
      await persist()
      return existing
    }
  }
  const song: Song = {
    id: newId(),
    title: input.title,
    author: input.author,
    copyright: input.copyright,
    lyrics: input.lyrics,
    tags: input.tags ?? [],
    createdAt: now(),
    updatedAt: now()
  }
  db.songs.push(song)
  await persist()
  return song
}

export async function removeSong(id: string): Promise<void> {
  const db = await loadDb()
  db.songs = db.songs.filter((s) => s.id !== id)
  await persist()
}

// ---- Media ----
export async function listMedia(): Promise<MediaItem[]> {
  const db = await loadDb()
  return [...db.media].sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function saveMedia(input: Partial<MediaItem> & { sourceUrl: string; title: string; youtubeId?: string }): Promise<MediaItem> {
  const db = await loadDb()
  if (input.id) {
    const existing = db.media.find((m) => m.id === input.id)
    if (existing) {
      Object.assign(existing, {
        title: input.title,
        sourceUrl: input.sourceUrl,
        youtubeId: input.youtubeId ?? existing.youtubeId,
        startSeconds: input.startSeconds,
        updatedAt: now()
      })
      await persist()
      return existing
    }
  }
  const item: MediaItem = {
    id: newId(),
    title: input.title,
    youtubeId: input.youtubeId ?? '',
    sourceUrl: input.sourceUrl,
    startSeconds: input.startSeconds,
    createdAt: now(),
    updatedAt: now()
  }
  db.media.push(item)
  await persist()
  return item
}

export async function removeMedia(id: string): Promise<void> {
  const db = await loadDb()
  db.media = db.media.filter((m) => m.id !== id)
  await persist()
}

// ---- Schedules ----
export async function listSchedules(): Promise<Schedule[]> {
  const db = await loadDb()
  return [...db.schedules].sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function getSchedule(id: string): Promise<Schedule | null> {
  const db = await loadDb()
  return db.schedules.find((s) => s.id === id) ?? null
}

export async function saveSchedule(input: Partial<Schedule> & { name: string }): Promise<Schedule> {
  const db = await loadDb()
  if (input.id) {
    const existing = db.schedules.find((s) => s.id === input.id)
    if (existing) {
      Object.assign(existing, {
        name: input.name,
        items: input.items ?? existing.items,
        updatedAt: now()
      })
      await persist()
      return existing
    }
  }
  const schedule: Schedule = {
    id: newId(),
    name: input.name,
    items: input.items ?? [],
    createdAt: now(),
    updatedAt: now()
  }
  db.schedules.push(schedule)
  await persist()
  return schedule
}

export async function removeSchedule(id: string): Promise<void> {
  const db = await loadDb()
  db.schedules = db.schedules.filter((s) => s.id !== id)
  await persist()
}

// ---- Settings ----
export async function getSettings(): Promise<Settings> {
  const db = await loadDb()
  return db.settings
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const db = await loadDb()
  db.settings = {
    ...db.settings,
    ...patch,
    theme: { ...db.settings.theme, ...patch.theme }
  }
  await persist()
  return db.settings
}
