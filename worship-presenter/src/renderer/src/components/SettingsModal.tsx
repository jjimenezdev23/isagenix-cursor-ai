import { useEffect, useState } from 'react'
import type { Theme } from '@shared/types'
import { useApp } from '../store'
import { SlideCanvas } from './SlideCanvas'
import { makeSlide } from '../lib/slides'
import { errorToast } from '../ui'

interface Props {
  onClose(): void
}

const FONTS = [
  'Inter, Segoe UI, Roboto, sans-serif',
  'Georgia, "Times New Roman", serif',
  'Arial, Helvetica, sans-serif',
  'Verdana, Geneva, sans-serif',
  '"Trebuchet MS", sans-serif',
  'system-ui, sans-serif'
]

export function SettingsModal({ onClose }: Props): JSX.Element {
  const { settings } = useApp()
  const [theme, setTheme] = useState<Theme | null>(settings?.theme ?? null)
  const [displays, setDisplays] = useState<{ id: number; label: string }[]>([])

  useEffect(() => {
    window.api.system.displays().then(setDisplays).catch(() => undefined)
  }, [])

  if (!theme) return <></>

  const update = (patch: Partial<Theme>): void => {
    const next = { ...theme, ...patch }
    setTheme(next)
    useApp.getState().saveTheme(patch).catch(errorToast)
  }

  const pickBackground = async (): Promise<void> => {
    const dataUrl = await window.api.system.pickBackgroundImage().catch(errorToast)
    if (dataUrl) update({ backgroundImage: dataUrl })
  }

  const preview = makeSlide(['The LORD is my shepherd;', 'I shall not want.'], 'Preview', 'Psalm 23:1 (KJV)')

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal wide" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Appearance & display</h3>
          <button className="btn ghost" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="grid-2">
            <div>
              <div className="field">
                <label>Font</label>
                <select className="select" value={theme.fontFamily} onChange={(e) => update({ fontFamily: e.target.value })}>
                  {FONTS.map((f) => (
                    <option key={f} value={f}>
                      {f.split(',')[0].replace(/"/g, '')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Font size ({theme.fontSize}px)</label>
                <input
                  className="range"
                  type="range"
                  min={28}
                  max={120}
                  value={theme.fontSize}
                  onChange={(e) => update({ fontSize: Number(e.target.value) })}
                />
              </div>
              <div className="field">
                <label>Line spacing ({theme.lineHeight.toFixed(2)})</label>
                <input
                  className="range"
                  type="range"
                  min={1}
                  max={2}
                  step={0.05}
                  value={theme.lineHeight}
                  onChange={(e) => update({ lineHeight: Number(e.target.value) })}
                />
              </div>
              <div className="grid-2">
                <div className="field">
                  <label>Text color</label>
                  <input className="color-input" type="color" value={theme.textColor} onChange={(e) => update({ textColor: e.target.value })} />
                </div>
                <div className="field">
                  <label>Background color</label>
                  <input
                    className="color-input"
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) => update({ backgroundColor: e.target.value })}
                  />
                </div>
              </div>
              <div className="field">
                <label>Alignment</label>
                <div className="seg">
                  {(['left', 'center', 'right'] as const).map((a) => (
                    <button key={a} className={theme.textAlign === a ? 'active' : ''} onClick={() => update({ textAlign: a })}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div className="row" style={{ gap: 16, marginBottom: 12 }}>
                <label className="row" style={{ gap: 6 }}>
                  <input type="checkbox" checked={theme.bold} onChange={(e) => update({ bold: e.target.checked })} /> Bold
                </label>
                <label className="row" style={{ gap: 6 }}>
                  <input type="checkbox" checked={theme.textShadow} onChange={(e) => update({ textShadow: e.target.checked })} /> Shadow
                </label>
                <label className="row" style={{ gap: 6 }}>
                  <input type="checkbox" checked={theme.showReference} onChange={(e) => update({ showReference: e.target.checked })} /> Show
                  reference
                </label>
              </div>
            </div>

            <div>
              <div className="field">
                <label>Background image</label>
                <div className="row">
                  <button className="btn" onClick={pickBackground}>
                    Choose image…
                  </button>
                  {theme.backgroundImage && (
                    <button className="btn ghost" onClick={() => update({ backgroundImage: undefined })}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
              {theme.backgroundImage && (
                <div className="field">
                  <label>Image darkening ({Math.round(theme.overlayOpacity * 100)}%)</label>
                  <input
                    className="range"
                    type="range"
                    min={0}
                    max={0.9}
                    step={0.05}
                    value={theme.overlayOpacity}
                    onChange={(e) => update({ overlayOpacity: Number(e.target.value) })}
                  />
                </div>
              )}
              <div className="field">
                <label>Live preview</label>
                <div className="monitor">
                  <SlideCanvas kind="scripture" slide={preview} theme={theme} />
                </div>
              </div>
              <div className="field">
                <label>Displays detected</label>
                <div className="help">
                  {displays.length === 0
                    ? 'Detecting…'
                    : displays.map((d) => <div key={d.id}>{d.label}</div>)}
                  <br />
                  Connect a projector or TV as a second screen, then click <b>Full screen</b> in the Output panel. The
                  live window opens on the second display automatically.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
