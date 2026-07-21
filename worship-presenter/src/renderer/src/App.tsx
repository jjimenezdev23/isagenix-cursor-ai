import { useEffect, useState } from 'react'
import { useApp } from './store'
import { useToast } from './ui'
import { LeftPanel } from './components/LeftPanel'
import { SlideDeck } from './components/SlideDeck'
import { RightPanel } from './components/RightPanel'
import { SettingsModal } from './components/SettingsModal'
import { errorToast } from './ui'

function isTyping(): boolean {
  const el = document.activeElement as HTMLElement | null
  if (!el) return false
  const tag = el.tagName.toLowerCase()
  return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable
}

export function App(): JSX.Element {
  const { ready, init } = useApp()
  const toast = useToast()
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    init().catch(errorToast)
  }, [init])

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (isTyping()) return
      const app = useApp.getState()
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
          e.preventDefault()
          app.next().catch(errorToast)
          break
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault()
          app.prev().catch(errorToast)
          break
        case 'Enter': {
          e.preventDefault()
          const deck = app.deck
          if (deck) {
            if (deck.kind === 'media') app.goLiveMedia(deck, true).catch(errorToast)
            else app.goLiveSlide(deck, app.previewIndex).catch(errorToast)
          }
          break
        }
        case 'b':
        case 'B':
          app.showBlack().catch(errorToast)
          break
        case 'c':
        case 'C':
          app.showClear().catch(errorToast)
          break
        case 'l':
        case 'L':
          app.showLogo().catch(errorToast)
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!ready) {
    return (
      <div className="app" style={{ placeItems: 'center', display: 'grid' }}>
        <div className="brand" style={{ fontSize: 20 }}>
          <span className="logo">✝</span> Worship Presenter
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand">
          <span className="logo">✝</span>
          Worship Presenter <small>2.0</small>
        </div>
        <div className="topbar-spacer" />
        <button className="btn" onClick={() => useApp.getState().showLogo().catch(errorToast)} title="Show logo (L)">
          ✝ Logo
        </button>
        <button className="btn" onClick={() => useApp.getState().showBlack().catch(errorToast)} title="Black screen (B)">
          ■ Black
        </button>
        <button
          className="btn primary"
          onClick={() => window.api.live.toggleFullscreen().catch(errorToast)}
          title="Send live output full screen on the projector"
        >
          ⛶ Go full screen
        </button>
        <button className="btn ghost" onClick={() => setShowSettings(true)} title="Settings">
          ⚙ Settings
        </button>
      </div>

      <div className="main">
        <LeftPanel />
        <SlideDeck />
        <RightPanel />
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {toast.message && <div className={`toast ${toast.kind === 'error' ? 'error' : ''}`}>{toast.message}</div>}
    </div>
  )
}
