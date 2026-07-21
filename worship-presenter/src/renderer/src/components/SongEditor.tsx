import { useState } from 'react'
import type { Song } from '@shared/types'
import { useApp } from '../store'
import { errorToast, toast } from '../ui'

interface Props {
  song: Song | null
  onClose(): void
}

const PLACEHOLDER = `Verse 1
Amazing grace, how sweet the sound
That saved a wretch like me

Chorus
My chains are gone, I've been set free

Verse 2
'Twas grace that taught my heart to fear`

export function SongEditor({ song, onClose }: Props): JSX.Element {
  const [title, setTitle] = useState(song?.title ?? '')
  const [author, setAuthor] = useState(song?.author ?? '')
  const [copyright, setCopyright] = useState(song?.copyright ?? '')
  const [lyrics, setLyrics] = useState(song?.lyrics ?? '')
  const [tagsText, setTagsText] = useState((song?.tags ?? []).join(', '))
  const [saving, setSaving] = useState(false)

  const save = async (): Promise<void> => {
    if (!title.trim()) return toast('Please enter a song title', 'error')
    setSaving(true)
    try {
      await window.api.songs.save({
        id: song?.id,
        title: title.trim(),
        author: author.trim() || undefined,
        copyright: copyright.trim() || undefined,
        lyrics,
        tags: tagsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      })
      await useApp.getState().refreshSongs()
      toast('Song saved')
      onClose()
    } catch (err) {
      errorToast(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal wide" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{song ? 'Edit song' : 'New song'}</h3>
          <button className="btn ghost" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="grid-2">
            <div className="field">
              <label>Title *</label>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
            </div>
            <div className="field">
              <label>Author</label>
              <input className="input" value={author} onChange={(e) => setAuthor(e.target.value)} />
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Copyright / CCLI</label>
              <input className="input" value={copyright} onChange={(e) => setCopyright(e.target.value)} />
            </div>
            <div className="field">
              <label>Tags (comma separated)</label>
              <input
                className="input"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="worship, hymn, christmas"
              />
            </div>
          </div>
          <div className="field">
            <label>Lyrics</label>
            <textarea
              className="textarea"
              style={{ minHeight: 260 }}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder={PLACEHOLDER}
            />
            <div className="help">
              Leave a <b>blank line</b> between sections — each section becomes its own slide. Start a section with a
              label like <b>Verse 1</b>, <b>Chorus</b>, or <b>Bridge</b> and it will be tagged automatically. Long
              sections are split so text always fits on screen.
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save song'}
          </button>
        </div>
      </div>
    </div>
  )
}
