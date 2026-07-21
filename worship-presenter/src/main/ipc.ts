import { ipcMain } from 'electron'
import * as store from './store'
import * as bible from './bible'

// Registers all data / bible IPC handlers. Live-output handlers live in index.ts
// because they need direct access to the window instances.
export function registerIpc(): void {
  // Songs
  ipcMain.handle('songs:list', () => store.listSongs())
  ipcMain.handle('songs:get', (_e, id: string) => store.getSong(id))
  ipcMain.handle('songs:save', (_e, song) => store.saveSong(song))
  ipcMain.handle('songs:remove', (_e, id: string) => store.removeSong(id))

  // Media
  ipcMain.handle('media:list', () => store.listMedia())
  ipcMain.handle('media:save', (_e, item) => store.saveMedia(item))
  ipcMain.handle('media:remove', (_e, id: string) => store.removeMedia(id))

  // Schedules
  ipcMain.handle('schedules:list', () => store.listSchedules())
  ipcMain.handle('schedules:get', (_e, id: string) => store.getSchedule(id))
  ipcMain.handle('schedules:save', (_e, schedule) => store.saveSchedule(schedule))
  ipcMain.handle('schedules:remove', (_e, id: string) => store.removeSchedule(id))

  // Settings
  ipcMain.handle('settings:get', () => store.getSettings())
  ipcMain.handle('settings:save', (_e, patch) => store.saveSettings(patch))

  // Bible
  ipcMain.handle('bible:books', () => bible.getBooks())
  ipcMain.handle('bible:installedVersions', () => bible.installedVersions())
  ipcMain.handle('bible:availableVersions', () => bible.availableVersions())
  ipcMain.handle('bible:installVersion', (_e, id: string) => bible.installVersion(id))
  ipcMain.handle('bible:removeVersion', (_e, id: string) => bible.removeVersion(id))
  ipcMain.handle('bible:chapter', (_e, versionId: string, bookSlug: string, chapter: number) =>
    bible.getChapter(versionId, bookSlug, chapter)
  )
  ipcMain.handle('bible:search', (_e, versionId: string, query: string, limit?: number) =>
    bible.search(versionId, query, limit)
  )
}
