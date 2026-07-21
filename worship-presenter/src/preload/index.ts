import { contextBridge, ipcRenderer } from 'electron'
import type { Api, LiveState } from '../shared/types'

const api: Api = {
  songs: {
    list: () => ipcRenderer.invoke('songs:list'),
    get: (id) => ipcRenderer.invoke('songs:get', id),
    save: (song) => ipcRenderer.invoke('songs:save', song),
    remove: (id) => ipcRenderer.invoke('songs:remove', id)
  },
  media: {
    list: () => ipcRenderer.invoke('media:list'),
    save: (item) => ipcRenderer.invoke('media:save', item),
    remove: (id) => ipcRenderer.invoke('media:remove', id)
  },
  schedules: {
    list: () => ipcRenderer.invoke('schedules:list'),
    get: (id) => ipcRenderer.invoke('schedules:get', id),
    save: (schedule) => ipcRenderer.invoke('schedules:save', schedule),
    remove: (id) => ipcRenderer.invoke('schedules:remove', id)
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    save: (patch) => ipcRenderer.invoke('settings:save', patch)
  },
  bible: {
    books: () => ipcRenderer.invoke('bible:books'),
    installedVersions: () => ipcRenderer.invoke('bible:installedVersions'),
    availableVersions: () => ipcRenderer.invoke('bible:availableVersions'),
    installVersion: (id) => ipcRenderer.invoke('bible:installVersion', id),
    removeVersion: (id) => ipcRenderer.invoke('bible:removeVersion', id),
    chapter: (versionId, bookSlug, chapter) => ipcRenderer.invoke('bible:chapter', versionId, bookSlug, chapter),
    search: (versionId, query, limit) => ipcRenderer.invoke('bible:search', versionId, query, limit)
  },
  live: {
    set: (state) => ipcRenderer.invoke('live:set', state),
    get: () => ipcRenderer.invoke('live:get'),
    show: () => ipcRenderer.invoke('live:show'),
    hide: () => ipcRenderer.invoke('live:hide'),
    toggleFullscreen: () => ipcRenderer.invoke('live:toggleFullscreen'),
    onUpdate: (cb: (state: LiveState) => void) => {
      const listener = (_e: unknown, state: LiveState): void => cb(state)
      ipcRenderer.on('live:update', listener)
      return () => ipcRenderer.removeListener('live:update', listener)
    }
  },
  system: {
    displays: () => ipcRenderer.invoke('system:displays'),
    pickBackgroundImage: () => ipcRenderer.invoke('system:pickBackgroundImage')
  }
}

const liveApi = {
  onUpdate: (cb: (state: LiveState) => void) => {
    const listener = (_e: unknown, state: LiveState): void => cb(state)
    ipcRenderer.on('live:update', listener)
    return () => ipcRenderer.removeListener('live:update', listener)
  },
  ready: () => ipcRenderer.invoke('live:get')
}

contextBridge.exposeInMainWorld('api', api)
contextBridge.exposeInMainWorld('liveApi', liveApi)
