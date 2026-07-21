import { useMemo, useState } from 'react'
import type { Song } from '@shared/types'
import { useApp } from '../store'
import { SongEditor } from './SongEditor'
import { errorToast, toast } from '../ui'

export function SongsPanel(): JSX.Element {
  const { songs, deck } = useApp()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Song | null>(null)
  const [showEditor, setShowEditor] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return songs
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.author ?? '').toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)) ||
        s.lyrics.toLowerCase().includes(q)
    )
  }, [songs, query])

  const openNew = (): void => {
    setEditing(null)
    setShowEditor(true)
  }
  const openEdit = (song: Song): void => {
    setEditing(song)
    setShowEditor(true)
  }

  const remove = async (song: Song): Promise<void> => {
    if (!confirm(`Delete "${song.title}"?`)) return
    await window.api.songs.remove(song.id)
    await useApp.getState().refreshSongs()
    toast('Song deleted')
  }

  const addToService = async (song: Song): Promise<void> => {
    await useApp.getState().addToSchedule({ type: 'song', title: song.title, songId: song.id }).catch(errorToast)
    toast(`Added "${song.title}" to service`)
  }

  return (
    <>
      <div className="searchbar">
        <input
          className="input"
          placeholder="Search songs…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn primary" onClick={openNew} title="Add a new song">
          ＋ New
        </button>
      </div>

      <div className="col-body">
        {songs.length === 0 ? (
          <div className="empty">
            No songs yet.
            <br />
            <br />
            Click <b>＋ New</b> to add your first song.
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">No songs match “{query}”.</div>
        ) : (
          <div className="list">
            {filtered.map((song) => (
              <div
                key={song.id}
                className={`list-item ${deck?.source.itemId === song.id ? 'active' : ''}`}
                onClick={() => useApp.getState().loadSong(song)}
                onDoubleClick={() => {
                  useApp.getState().loadSong(song)
                  const d = useApp.getState().deck
                  if (d) useApp.getState().goLiveSlide(d, 0).catch(errorToast)
                }}
                title="Click to load slides · double-click to go live"
              >
                <div className="grow">
                  <div className="title">{song.title}</div>
                  {(song.author || song.tags.length > 0) && (
                    <div className="sub">
                      {song.author}
                      {song.author && song.tags.length > 0 ? ' · ' : ''}
                      {song.tags.join(', ')}
                    </div>
                  )}
                </div>
                <div className="row" onClick={(e) => e.stopPropagation()}>
                  <button className="btn sm ghost" title="Add to service" onClick={() => addToService(song)}>
                    ＋
                  </button>
                  <button className="btn sm ghost" title="Edit" onClick={() => openEdit(song)}>
                    ✎
                  </button>
                  <button className="btn sm ghost" title="Delete" onClick={() => remove(song)}>
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showEditor && <SongEditor song={editing} onClose={() => setShowEditor(false)} />}
    </>
  )
}
