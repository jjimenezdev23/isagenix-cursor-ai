import { useApp } from '../store'
import { Monitor } from './Monitor'
import { errorToast } from '../ui'

export function RightPanel(): JSX.Element {
  const { live, deck, previewIndex, settings, liveDeck, liveIndex } = useApp()
  const theme = settings?.theme
  if (!theme) return <div className="col" />

  const previewSlide = deck && deck.kind !== 'media' ? deck.slides[previewIndex] : undefined
  const previewMediaId = deck?.kind === 'media' ? deck.youtubeId : undefined

  const canGoLivePreview = !!deck
  const liveTitle = live?.source?.title
  const liveProgress =
    live?.source && live.source.slideCount && live.source.slideCount > 1
      ? `${(live.source.slideIndex ?? 0) + 1} / ${live.source.slideCount}`
      : ''

  const goLiveFromPreview = async (): Promise<void> => {
    if (!deck) return
    try {
      if (deck.kind === 'media') await useApp.getState().goLiveMedia(deck, true)
      else await useApp.getState().goLiveSlide(deck, previewIndex)
    } catch (err) {
      errorToast(err)
    }
  }

  return (
    <div className="col">
      <div className="col-head">
        <h2>Output</h2>
        <div className="topbar-spacer" />
        <button
          className="btn sm"
          onClick={() => window.api.live.toggleFullscreen().catch(errorToast)}
          title="Send live output full screen on the projector"
        >
          ⛶ Full screen
        </button>
      </div>
      <div className="monitors">
        <Monitor
          kind="live"
          label={live ? `Live${liveTitle ? ' · ' + liveTitle : ''}${liveProgress ? ' · ' + liveProgress : ''}` : 'Live'}
          theme={theme}
          live={live}
        />

        <div className="nav-row">
          <button className="btn" disabled={!liveDeck || liveIndex <= 0} onClick={() => useApp.getState().prev().catch(errorToast)}>
            ◀ Previous
          </button>
          <button
            className="btn"
            disabled={!liveDeck || liveDeck.kind === 'media' || liveIndex >= (liveDeck?.slides.length ?? 0) - 1}
            onClick={() => useApp.getState().next().catch(errorToast)}
          >
            Next ▶
          </button>
        </div>

        <div className="controls">
          <button className="btn" onClick={() => useApp.getState().showBlack().catch(errorToast)} title="Black screen (B)">
            ■ Black
          </button>
          <button className="btn" onClick={() => useApp.getState().showClear().catch(errorToast)} title="Clear text (C)">
            ▢ Clear
          </button>
          <button className="btn" onClick={() => useApp.getState().showLogo().catch(errorToast)} title="Logo (L)">
            ✝ Logo
          </button>
        </div>

        <Monitor
          kind="preview"
          label={deck ? `Preview · ${deck.title}` : 'Preview'}
          theme={theme}
          slide={previewSlide}
          slideKind={deck?.kind === 'media' ? 'media' : deck?.kind === 'scripture' ? 'scripture' : 'song'}
          mediaId={previewMediaId}
        />

        <button className="btn live" disabled={!canGoLivePreview} onClick={goLiveFromPreview}>
          Go Live ⏎
        </button>

        <div className="status-line">
          Shortcuts: <span className="kbd">Space</span>/<span className="kbd">→</span> next ·{' '}
          <span className="kbd">←</span> previous · <span className="kbd">B</span> black · <span className="kbd">C</span>{' '}
          clear · <span className="kbd">L</span> logo · <span className="kbd">Enter</span> go live
        </div>
      </div>
    </div>
  )
}
