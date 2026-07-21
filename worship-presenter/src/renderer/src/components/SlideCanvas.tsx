import type { CSSProperties } from 'react'
import type { SlideKind, Slide, Theme } from '@shared/types'

interface Props {
  kind: SlideKind
  slide?: Slide
  theme: Theme
  /** Reference thumbnail for media slides in the operator UI. */
  mediaThumb?: string
}

// A single reusable "screen" that looks identical in the small operator
// monitors and the full-screen live output (it scales with its container
// using container-query units).
export function SlideCanvas({ kind, slide, theme, mediaThumb }: Props): JSX.Element {
  const baseFont = theme.fontSize / 19.2 // px designed for a 1920px-wide screen -> cqw

  const stageStyle: CSSProperties = {
    backgroundColor: theme.backgroundColor,
    containerType: 'inline-size' as CSSProperties['containerType'],
    color: theme.textColor,
    fontFamily: theme.fontFamily,
    fontWeight: theme.bold ? 700 : 400,
    fontSize: `${baseFont}cqw`
  }

  const contentStyle: CSSProperties = {
    textAlign: theme.textAlign,
    lineHeight: theme.lineHeight,
    alignItems: theme.textAlign === 'center' ? 'center' : theme.textAlign === 'right' ? 'flex-end' : 'flex-start',
    textShadow: theme.textShadow ? '0 2px 14px rgba(0,0,0,0.6)' : 'none'
  }

  if (kind === 'black') {
    return <div className="canvas black" style={{ ...stageStyle, backgroundColor: '#000' }} />
  }

  if (kind === 'clear') {
    return (
      <div className="canvas clear" style={stageStyle}>
        {theme.backgroundImage && (
          <div className="bg" style={{ backgroundImage: `url(${theme.backgroundImage})` }} />
        )}
      </div>
    )
  }

  if (kind === 'logo') {
    return (
      <div className="canvas logo" style={stageStyle}>
        {theme.backgroundImage && (
          <div className="bg" style={{ backgroundImage: `url(${theme.backgroundImage})` }} />
        )}
        <div className="overlay" style={{ opacity: theme.backgroundImage ? theme.overlayOpacity : 0 }} />
        <div className="content" style={contentStyle}>
          <div className="logo-mark">
            <span className="mark">✝</span>
            <span style={{ fontSize: '0.5em', fontWeight: 700 }}>Worship Presenter</span>
          </div>
        </div>
      </div>
    )
  }

  if (kind === 'media') {
    return (
      <div className="canvas media" style={{ ...stageStyle, backgroundColor: '#000' }}>
        {mediaThumb && <div className="bg" style={{ backgroundImage: `url(${mediaThumb})`, opacity: 0.9 }} />}
        <div className="content" style={{ ...contentStyle, alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.5em', opacity: 0.85 }}>▶ YouTube</span>
        </div>
      </div>
    )
  }

  return (
    <div className="canvas text" style={stageStyle}>
      {theme.backgroundImage && (
        <div className="bg" style={{ backgroundImage: `url(${theme.backgroundImage})` }} />
      )}
      <div className="overlay" style={{ opacity: theme.backgroundImage ? theme.overlayOpacity : 0 }} />
      <div className="content" style={contentStyle}>
        {slide?.lines.map((line, i) => (
          <p className="line" key={i}>
            {line || '\u00a0'}
          </p>
        ))}
      </div>
      {theme.showReference && slide?.reference && <div className="reference">{slide.reference}</div>}
    </div>
  )
}
