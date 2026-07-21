import { app, BrowserWindow, screen, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { promises as fs } from 'fs'
import { registerIpc } from './ipc'
import { getSettings } from './store'
import type { LiveState, Theme } from '../shared/types'

const RENDERER_URL = process.env['ELECTRON_RENDERER_URL']

let controlWindow: BrowserWindow | null = null
let liveWindow: BrowserWindow | null = null

let liveState: LiveState = {
  kind: 'logo',
  theme: {
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
  },
  rev: 0
}

function broadcast(): void {
  for (const win of [controlWindow, liveWindow]) {
    if (win && !win.isDestroyed()) win.webContents.send('live:update', liveState)
  }
}

export function setLiveState(patch: Partial<LiveState>): LiveState {
  liveState = { ...liveState, ...patch, rev: liveState.rev + 1 }
  broadcast()
  return liveState
}

export function getLiveState(): LiveState {
  return liveState
}

function loadPage(win: BrowserWindow, page: 'index' | 'live'): void {
  if (process.env.WP_DEBUG) {
    win.webContents.on('did-finish-load', () => console.log(`[wp] ${page} loaded`))
    win.webContents.on('did-fail-load', (_e, code, desc) => console.error(`[wp] ${page} failed: ${code} ${desc}`))
    win.webContents.on('console-message', (_e, level, message) => {
      if (level >= 2) console.error(`[wp:${page}] ${message}`)
    })
  }
  if (RENDERER_URL) {
    win.loadURL(page === 'index' ? RENDERER_URL : `${RENDERER_URL}/${page}.html`)
  } else {
    win.loadFile(join(__dirname, `../renderer/${page}.html`))
  }
}

function createControlWindow(): void {
  controlWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    title: 'Worship Presenter',
    backgroundColor: '#11151c',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  controlWindow.on('ready-to-show', () => controlWindow?.show())
  controlWindow.on('closed', () => {
    controlWindow = null
    if (liveWindow && !liveWindow.isDestroyed()) liveWindow.close()
  })
  loadPage(controlWindow, 'index')
}

function createLiveWindow(): void {
  const displays = screen.getAllDisplays()
  const primary = screen.getPrimaryDisplay()
  // Prefer a secondary display (the projector) if one exists.
  const target = displays.find((d) => d.id !== primary.id) ?? primary

  liveWindow = new BrowserWindow({
    x: target.bounds.x + 60,
    y: target.bounds.y + 60,
    width: 960,
    height: 540,
    show: false,
    frame: false,
    backgroundColor: '#000000',
    fullscreenable: true,
    title: 'Live Output',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  liveWindow.on('closed', () => {
    liveWindow = null
  })
  loadPage(liveWindow, 'live')
}

function registerLiveIpc(): void {
  ipcMain.handle('live:set', (_e, patch: Partial<LiveState>) => setLiveState(patch))
  ipcMain.handle('live:get', () => getLiveState())
  ipcMain.handle('live:show', () => {
    if (!liveWindow || liveWindow.isDestroyed()) createLiveWindow()
    liveWindow?.show()
  })
  ipcMain.handle('live:hide', () => {
    liveWindow?.hide()
  })
  ipcMain.handle('live:toggleFullscreen', () => {
    if (!liveWindow || liveWindow.isDestroyed()) createLiveWindow()
    const next = !liveWindow!.isFullScreen()
    liveWindow!.show()
    liveWindow!.setFullScreen(next)
    return next
  })

  ipcMain.handle('system:displays', () =>
    screen.getAllDisplays().map((d, i) => ({
      id: d.id,
      label: `Display ${i + 1} (${d.size.width}×${d.size.height})${d.id === screen.getPrimaryDisplay().id ? ' — primary' : ''}`,
      bounds: { width: d.size.width, height: d.size.height }
    }))
  )

  ipcMain.handle('system:pickBackgroundImage', async () => {
    const res = await dialog.showOpenDialog({
      title: 'Choose a background image',
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'] }]
    })
    if (res.canceled || res.filePaths.length === 0) return null
    const file = res.filePaths[0]
    const ext = file.split('.').pop()?.toLowerCase() || 'png'
    const mime = ext === 'jpg' ? 'jpeg' : ext
    const data = await fs.readFile(file)
    return `data:image/${mime};base64,${data.toString('base64')}`
  })
}

app.whenReady().then(async () => {
  // Sync the initial live theme from saved settings.
  try {
    const settings = await getSettings()
    liveState.theme = settings.theme as Theme
  } catch {
    /* use defaults */
  }

  registerIpc()
  registerLiveIpc()
  createControlWindow()
  createLiveWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createControlWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
