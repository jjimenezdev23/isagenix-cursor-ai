import type { LiveState, Slide, Theme } from '@shared/types'
import { SlideCanvas } from './SlideCanvas'
import { youTubeThumb } from '../lib/youtube'

interface Props {
  kind: 'live' | 'preview'
  label: string
  theme: Theme
  live?: LiveState | null
  slide?: Slide
  slideKind?: LiveState['kind']
  mediaId?: string
  right?: JSX.Element
}

export function Monitor({ kind, label, theme, live, slide, slideKind, mediaId, right }: Props): JSX.Element {
  const resolvedKind = kind === 'live' ? live?.kind ?? 'logo' : slideKind ?? 'song'
  const resolvedSlide = kind === 'live' ? live?.slide : slide
  const resolvedMediaId = kind === 'live' ? live?.media?.youtubeId : mediaId

  return (
    <div className={`monitor ${kind}`}>
      <div className="mon-head">
        <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          <span className="dot" />
          {label}
        </span>
        {right}
      </div>
      <SlideCanvas
        kind={resolvedKind}
        slide={resolvedSlide}
        theme={theme}
        mediaThumb={resolvedMediaId ? youTubeThumb(resolvedMediaId) : undefined}
      />
    </div>
  )
}
