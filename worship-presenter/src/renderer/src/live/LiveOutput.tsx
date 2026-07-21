import { useEffect, useState } from 'react'
import type { LiveState } from '@shared/types'
import { SlideCanvas } from '../components/SlideCanvas'
import { youTubeEmbedUrl } from '../lib/youtube'

export function LiveOutput(): JSX.Element {
  const [state, setState] = useState<LiveState | null>(null)

  useEffect(() => {
    // The preload exposes `window.api` in every window, including this one.
    const unsub = window.api.live.onUpdate((s) => setState(s))
    window.api.live.get().then(setState)
    return () => unsub()
  }, [])

  if (!state) return <div className="live-stage" />

  if (state.kind === 'media' && state.media) {
    return (
      <div className="live-stage">
        <iframe
          className="media-frame"
          title="live-media"
          src={youTubeEmbedUrl(state.media.youtubeId, {
            autoplay: state.media.playing,
            start: state.media.startSeconds,
            controls: true
          })}
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className="live-stage">
      <SlideCanvas kind={state.kind} slide={state.slide} theme={state.theme} />
    </div>
  )
}
