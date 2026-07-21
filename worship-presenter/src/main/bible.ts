import { app } from 'electron'
import { promises as fs } from 'fs'
import { join } from 'path'
import { BIBLE_BOOKS } from '../shared/books'
import type { BibleBook, BibleChapter, BibleVersionMeta } from '../shared/types'
import { getSettings, saveSettings } from './store'

// Bible data comes from the open wldeh/bible-api dataset served over jsDelivr.
// We fetch on demand and cache each chapter locally so the app works offline
// after a passage has been viewed once.
const CDN = 'https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles'
const VERSIONS_URL = `${CDN}/bibles.json`
const VERSIONS_TTL = 1000 * 60 * 60 * 24 // 1 day

function cacheRoot(): string {
  return join(app.getPath('userData'), 'bible-cache')
}

function chapterCachePath(versionId: string, bookSlug: string, chapter: number): string {
  return join(cacheRoot(), versionId, bookSlug, `${chapter}.json`)
}

function versionsCachePath(): string {
  return join(cacheRoot(), 'versions.json')
}

export function getBooks(): BibleBook[] {
  return BIBLE_BOOKS
}

async function readJson<T>(path: string): Promise<T | null> {
  try {
    return JSON.parse(await fs.readFile(path, 'utf-8')) as T
  } catch {
    return null
  }
}

async function writeJson(path: string, data: unknown): Promise<void> {
  await fs.mkdir(join(path, '..'), { recursive: true })
  await fs.writeFile(path, JSON.stringify(data), 'utf-8')
}

interface RawVersion {
  id: string
  version: string
  scope?: string
  language?: { name?: string; code?: string }
  localVersionAbbreviation?: string
}

function mapVersion(v: RawVersion): BibleVersionMeta {
  return {
    id: v.id,
    version: v.version,
    scope: v.scope,
    abbreviation: v.localVersionAbbreviation || v.id.toUpperCase(),
    language: { name: v.language?.name || 'Unknown', code: v.language?.code || '' }
  }
}

export async function availableVersions(): Promise<BibleVersionMeta[]> {
  const cachePath = versionsCachePath()
  const cached = await readJson<{ fetchedAt: number; versions: RawVersion[] }>(cachePath)
  if (cached && Date.now() - cached.fetchedAt < VERSIONS_TTL) {
    return cached.versions.map(mapVersion)
  }
  try {
    const res = await fetch(VERSIONS_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const versions = (await res.json()) as RawVersion[]
    await writeJson(cachePath, { fetchedAt: Date.now(), versions })
    return versions.map(mapVersion)
  } catch (err) {
    if (cached) return cached.versions.map(mapVersion)
    throw new Error('Could not load the Bible version list. Please connect to the internet once to download it.')
  }
}

export async function installedVersions(): Promise<BibleVersionMeta[]> {
  const settings = await getSettings()
  const ids = settings.installedBibleVersions
  if (ids.length === 0) return []
  let all: BibleVersionMeta[] = []
  try {
    all = await availableVersions()
  } catch {
    // Offline: fall back to bare ids.
  }
  const byId = new Map(all.map((v) => [v.id, v]))
  return ids.map(
    (id) =>
      byId.get(id) ?? {
        id,
        version: id,
        abbreviation: id.toUpperCase(),
        language: { name: '', code: '' }
      }
  )
}

export async function installVersion(id: string): Promise<BibleVersionMeta> {
  const all = await availableVersions()
  const meta = all.find((v) => v.id === id)
  if (!meta) throw new Error(`Unknown Bible version: ${id}`)
  const settings = await getSettings()
  const set = new Set(settings.installedBibleVersions)
  set.add(id)
  await saveSettings({
    installedBibleVersions: [...set],
    defaultBibleVersion: settings.defaultBibleVersion ?? id
  })
  // Warm the cache with a common chapter so it is usable offline right away.
  try {
    await getChapter(id, 'john', 3)
  } catch {
    /* best effort */
  }
  return meta
}

export async function removeVersion(id: string): Promise<void> {
  const settings = await getSettings()
  const remaining = settings.installedBibleVersions.filter((v) => v !== id)
  await saveSettings({
    installedBibleVersions: remaining,
    defaultBibleVersion: settings.defaultBibleVersion === id ? remaining[0] : settings.defaultBibleVersion
  })
  try {
    await fs.rm(join(cacheRoot(), id), { recursive: true, force: true })
  } catch {
    /* ignore */
  }
}

// The upstream data appends translator footnotes directly onto the verse text,
// e.g. "...still waters.23.2 green…: Heb. pastures of tender grass". Strip them.
function cleanVerseText(text: string, chapter: number, verse: number): string {
  let t = text
  const markerIdx = t.search(new RegExp(`${chapter}\\.${verse}(?![0-9])`))
  if (markerIdx > 0) t = t.slice(0, markerIdx)
  // Remove any leftover note fragments and collapse whitespace.
  t = t.replace(/\s*\u2026:[\s\S]*$/, '')
  return t.replace(/\s+/g, ' ').trim()
}

interface RawChapter {
  data?: { book?: string; chapter?: string; verse?: string; text?: string }[]
}

export async function getChapter(versionId: string, bookSlug: string, chapter: number): Promise<BibleChapter> {
  const cachePath = chapterCachePath(versionId, bookSlug, chapter)
  const cached = await readJson<BibleChapter>(cachePath)
  if (cached) return cached

  const book = BIBLE_BOOKS.find((b) => b.slug === bookSlug)
  const url = `${CDN}/${versionId}/books/${bookSlug}/chapters/${chapter}.json`
  let raw: RawChapter
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    raw = (await res.json()) as RawChapter
  } catch (err) {
    throw new Error(
      `Could not load ${book?.name ?? bookSlug} ${chapter}. Connect to the internet to download this passage (it will then be available offline).`
    )
  }
  const verses = (raw.data ?? [])
    .map((v) => ({
      verse: Number(v.verse) || 0,
      text: cleanVerseText(v.text ?? '', chapter, Number(v.verse) || 0)
    }))
    .filter((v) => v.verse > 0 && v.text.length > 0)

  const result: BibleChapter = {
    versionId,
    book: book?.name ?? bookSlug,
    bookSlug,
    chapter,
    verses
  }
  await writeJson(cachePath, result)
  return result
}

// Full-text search across whatever chapters have already been cached locally
// for the given version. (Reference lookup in the UI works without this.)
export async function search(
  versionId: string,
  query: string,
  limit = 100
): Promise<{ book: string; bookSlug: string; chapter: number; verse: number; text: string }[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const results: { book: string; bookSlug: string; chapter: number; verse: number; text: string }[] = []
  const versionDir = join(cacheRoot(), versionId)
  let bookDirs: string[] = []
  try {
    bookDirs = await fs.readdir(versionDir)
  } catch {
    return []
  }
  for (const bookSlug of bookDirs) {
    let chapterFiles: string[] = []
    try {
      chapterFiles = await fs.readdir(join(versionDir, bookSlug))
    } catch {
      continue
    }
    for (const file of chapterFiles) {
      const ch = await readJson<BibleChapter>(join(versionDir, bookSlug, file))
      if (!ch) continue
      for (const v of ch.verses) {
        if (v.text.toLowerCase().includes(q)) {
          results.push({ book: ch.book, bookSlug: ch.bookSlug, chapter: ch.chapter, verse: v.verse, text: v.text })
          if (results.length >= limit) return results
        }
      }
    }
  }
  return results
}
