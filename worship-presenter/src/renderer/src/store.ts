import { create } from 'zustand'
import type {
  LiveState,
  MediaItem,
  Schedule,
  ScheduleItem,
  ScripturePassage,
  Settings,
  Slide,
  Song,
  Theme
} from '@shared/types'
import { youTubeEmbedUrl } from './lib/youtube'
import { passageToSlides, songToSlides } from './lib/slides'

export type NavTab = 'service' | 'songs' | 'bible' | 'media'

/** The item currently loaded into the center slide deck. */
export interface ActiveDeck {
  kind: 'song' | 'scripture' | 'media'
  title: string
  slides: Slide[]
  /** For media items. */
  youtubeId?: string
  startSeconds?: number
  source: { itemId?: string; title: string }
}

interface AppState {
  ready: boolean
  nav: NavTab
  songs: Song[]
  media: MediaItem[]
  schedules: Schedule[]
  activeScheduleId: string | null
  settings: Settings | null

  deck: ActiveDeck | null
  previewIndex: number

  live: LiveState | null
  /** The deck that is currently being presented live (drives next/prev). */
  liveDeck: ActiveDeck | null
  liveIndex: number

  // actions
  init(): Promise<void>
  setNav(tab: NavTab): void
  refreshSongs(): Promise<void>
  refreshMedia(): Promise<void>
  refreshSchedules(): Promise<void>

  setActiveSchedule(id: string | null): void
  loadDeck(deck: ActiveDeck): void
  setPreviewIndex(i: number): void

  // deck builders
  loadSong(song: Song): void
  loadMedia(item: MediaItem): void
  loadPassage(passage: ScripturePassage): void
  openScheduleItem(item: ScheduleItem): Promise<void>

  // schedule mutations
  createSchedule(name: string): Promise<Schedule>
  renameSchedule(id: string, name: string): Promise<void>
  deleteSchedule(id: string): Promise<void>
  addToSchedule(item: Omit<ScheduleItem, 'id'>): Promise<void>
  removeScheduleItem(itemId: string): Promise<void>
  moveScheduleItem(itemId: string, dir: -1 | 1): Promise<void>

  goLiveSlide(deck: ActiveDeck, index: number): Promise<void>
  goLiveMedia(deck: ActiveDeck, playing: boolean): Promise<void>
  next(): Promise<void>
  prev(): Promise<void>
  showBlack(): Promise<void>
  showClear(): Promise<void>
  showLogo(): Promise<void>
  saveTheme(patch: Partial<Theme>): Promise<void>
  refreshSettings(): Promise<void>
}

export const useApp = create<AppState>((set, get) => ({
  ready: false,
  nav: 'service',
  songs: [],
  media: [],
  schedules: [],
  activeScheduleId: null,
  settings: null,
  deck: null,
  previewIndex: 0,
  live: null,
  liveDeck: null,
  liveIndex: 0,

  async init() {
    const [songs, media, schedules, settings, live] = await Promise.all([
      window.api.songs.list(),
      window.api.media.list(),
      window.api.schedules.list(),
      window.api.settings.get(),
      window.api.live.get()
    ])
    set({
      songs,
      media,
      schedules,
      settings,
      live,
      activeScheduleId: schedules[0]?.id ?? null,
      ready: true
    })
    window.api.live.onUpdate((state) => set({ live: state }))
  },

  setNav: (tab) => set({ nav: tab }),

  async refreshSongs() {
    set({ songs: await window.api.songs.list() })
  },
  async refreshMedia() {
    set({ media: await window.api.media.list() })
  },
  async refreshSchedules() {
    const schedules = await window.api.schedules.list()
    const { activeScheduleId } = get()
    set({
      schedules,
      activeScheduleId: activeScheduleId && schedules.some((s) => s.id === activeScheduleId) ? activeScheduleId : schedules[0]?.id ?? null
    })
  },
  async refreshSettings() {
    set({ settings: await window.api.settings.get() })
  },

  setActiveSchedule: (id) => set({ activeScheduleId: id }),

  loadDeck: (deck) => set({ deck, previewIndex: 0 }),
  setPreviewIndex: (i) => set({ previewIndex: i }),

  loadSong(song) {
    set({
      deck: {
        kind: 'song',
        title: song.title,
        slides: songToSlides(song),
        source: { itemId: song.id, title: song.title }
      },
      previewIndex: 0
    })
  },
  loadMedia(item) {
    set({
      deck: {
        kind: 'media',
        title: item.title,
        slides: [],
        youtubeId: item.youtubeId,
        startSeconds: item.startSeconds,
        source: { itemId: item.id, title: item.title }
      },
      previewIndex: 0
    })
  },
  loadPassage(passage) {
    const title = `${passage.book} ${passage.chapter}:${passage.fromVerse}${
      passage.toVerse !== passage.fromVerse ? '-' + passage.toVerse : ''
    } (${passage.versionName})`
    set({
      deck: {
        kind: 'scripture',
        title,
        slides: passageToSlides(passage),
        source: { title }
      },
      previewIndex: 0
    })
  },

  async openScheduleItem(item) {
    if (item.type === 'song' && item.songId) {
      const song = await window.api.songs.get(item.songId)
      if (song) get().loadSong(song)
    } else if (item.type === 'media' && item.mediaId) {
      const media = get().media.find((m) => m.id === item.mediaId)
      if (media) get().loadMedia(media)
    } else if (item.type === 'scripture' && item.passage) {
      get().loadPassage(item.passage)
    }
  },

  async createSchedule(name) {
    const schedule = await window.api.schedules.save({ name })
    await get().refreshSchedules()
    set({ activeScheduleId: schedule.id })
    return schedule
  },
  async renameSchedule(id, name) {
    const current = get().schedules.find((s) => s.id === id)
    if (!current) return
    await window.api.schedules.save({ id, name, items: current.items })
    await get().refreshSchedules()
  },
  async deleteSchedule(id) {
    await window.api.schedules.remove(id)
    await get().refreshSchedules()
  },
  async addToSchedule(item) {
    let { activeScheduleId } = get()
    if (!activeScheduleId) {
      const created = await get().createSchedule('Sunday Service')
      activeScheduleId = created.id
    }
    const current = get().schedules.find((s) => s.id === activeScheduleId)
    if (!current) return
    const newItem: ScheduleItem = { ...item, id: `item-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 6)}` }
    await window.api.schedules.save({ id: current.id, name: current.name, items: [...current.items, newItem] })
    await get().refreshSchedules()
  },
  async removeScheduleItem(itemId) {
    const { activeScheduleId } = get()
    const current = get().schedules.find((s) => s.id === activeScheduleId)
    if (!current) return
    await window.api.schedules.save({ id: current.id, name: current.name, items: current.items.filter((i) => i.id !== itemId) })
    await get().refreshSchedules()
  },
  async moveScheduleItem(itemId, dir) {
    const { activeScheduleId } = get()
    const current = get().schedules.find((s) => s.id === activeScheduleId)
    if (!current) return
    const items = [...current.items]
    const idx = items.findIndex((i) => i.id === itemId)
    const target = idx + dir
    if (idx < 0 || target < 0 || target >= items.length) return
    ;[items[idx], items[target]] = [items[target], items[idx]]
    await window.api.schedules.save({ id: current.id, name: current.name, items })
    await get().refreshSchedules()
  },

  async goLiveSlide(deck, index) {
    const slide = deck.slides[index]
    if (!slide) return
    await window.api.live.show()
    const live = await window.api.live.set({
      kind: deck.kind === 'scripture' ? 'scripture' : 'song',
      slide,
      media: undefined,
      source: { itemId: deck.source.itemId, title: deck.title, slideIndex: index, slideCount: deck.slides.length }
    })
    set({ live, liveDeck: deck, liveIndex: index, deck, previewIndex: index })
  },

  async goLiveMedia(deck, playing) {
    if (!deck.youtubeId) return
    await window.api.live.show()
    const live = await window.api.live.set({
      kind: 'media',
      slide: undefined,
      media: { youtubeId: deck.youtubeId, startSeconds: deck.startSeconds, playing },
      source: { itemId: deck.source.itemId, title: deck.title, slideIndex: 0, slideCount: 1 }
    })
    set({ live, liveDeck: deck, liveIndex: 0, deck })
  },

  async next() {
    const { liveDeck, liveIndex } = get()
    if (!liveDeck) return
    if (liveDeck.kind === 'media') return
    if (liveIndex < liveDeck.slides.length - 1) {
      await get().goLiveSlide(liveDeck, liveIndex + 1)
    }
  },
  async prev() {
    const { liveDeck, liveIndex } = get()
    if (!liveDeck) return
    if (liveDeck.kind === 'media') return
    if (liveIndex > 0) {
      await get().goLiveSlide(liveDeck, liveIndex - 1)
    }
  },

  async showBlack() {
    const live = await window.api.live.set({ kind: 'black', slide: undefined, media: undefined })
    set({ live })
  },
  async showClear() {
    const live = await window.api.live.set({ kind: 'clear', slide: undefined, media: undefined })
    set({ live })
  },
  async showLogo() {
    const live = await window.api.live.set({ kind: 'logo', slide: undefined, media: undefined })
    set({ live })
  },

  async saveTheme(patch) {
    const settings = await window.api.settings.save({ theme: patch as Theme })
    // Push the new theme to the live output immediately.
    const live = await window.api.live.set({ theme: settings.theme })
    set({ settings, live })
  }
}))

// Helpers used by components
export function scheduleItemLabel(item: ScheduleItem): string {
  return item.title
}

export { youTubeEmbedUrl }
