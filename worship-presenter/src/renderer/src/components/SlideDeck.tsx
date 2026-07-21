import { useApp } from '../store'
import { SlideCanvas } from './SlideCanvas'
import { youTubeThumb } from '../lib/youtube'
import { errorToast } from '../ui'

export function SlideDeck(): JSX.Element {
  const { deck, previewIndex, live, settings, setPreviewIndex } = useApp()
  const theme = settings?.theme

  if (!theme) return <div className="col" />

  if (!deck) {
    return (
      <div className="col">
        <div className="col-head">
          <h2>Slides</h2>
        </div>
        <div className="empty">
          Select a song, scripture passage, or video from the left to load its slides here.
          <br />
          <br />
          Click a slide to preview it, then press <span className="kbd">Enter</span> or “Go Live”.
        </div>
      </div>
    )
  }

  const isLiveDeck = live?.source?.title === deck.title
  const liveIndex = isLiveDeck ? live?.source?.slideIndex ?? -1 : -1

  const present = (index: number): void => {
    if (deck.kind === 'media') useApp.getState().goLiveMedia(deck, true).catch(errorToast)
    else useApp.getState().goLiveSlide(deck, index).catch(errorToast)
  }

  return (
    <div className="col">
      <div className="deck-head">
        <div className="grow" style={{ minWidth: 0 }}>
          <div className="title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {deck.title}
          </div>
          <div className="sub">
            {deck.kind === 'media' ? 'YouTube video' : `${deck.slides.length} slide${deck.slides.length === 1 ? '' : 's'} · click to preview, double-click to go live`}
          </div>
        </div>
      </div>

      {deck.kind === 'media' && deck.youtubeId ? (
        <div className="deck-grid">
          <div className="slide-card live" style={{ gridColumn: '1 / -1', maxWidth: 520 }} onClick={() => present(0)}>
            <div className="canvas" style={{ backgroundColor: '#000' }}>
              <div className="bg" style={{ backgroundImage: `url(${youTubeThumb(deck.youtubeId)})` }} />
              <div className="content" style={{ alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <span style={{ fontSize: 40 }}>▶</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="deck-grid">
          {deck.slides.map((slide, i) => {
            const cls = i === liveIndex ? 'live' : i === previewIndex ? 'preview' : ''
            return (
              <div
                key={slide.id}
                className={`slide-card ${cls}`}
                onClick={() => setPreviewIndex(i)}
                onDoubleClick={() => present(i)}
                title="Click to preview · double-click to go live"
              >
                <span className="num">{i + 1}</span>
                {slide.label && <span className="card-label">{slide.label}</span>}
                <SlideCanvas kind={deck.kind === 'scripture' ? 'scripture' : 'song'} slide={slide} theme={theme} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
