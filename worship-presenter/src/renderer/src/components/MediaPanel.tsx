import { useMemo, useState } from 'react'
import type { MediaItem } from '@shared/types'
import { useApp } from '../store'
import { parseStartSeconds, parseYouTubeId, youTubeThumb } from '../lib/youtube'
import { errorToast, toast } from '../ui'

export function MediaPanel(): JSX.Element {
  const { media, deck } = useApp()
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return media
    return media.filter((m) => m.title.toLowerCase().includes(q))
  }, [media, query])

  const add = async (): Promise<void> => {
    const id = parseYouTubeId(url)
    if (!id) return toast('Could not find a YouTube video id in that link', 'error')
    try {
      await window.api.media.save({
        title: title.trim() || 'YouTube video',
        sourceUrl: url.trim(),
        youtubeId: id,
        startSeconds: parseStartSeconds(url)
      })
      await useApp.getState().refreshMedia()
      setUrl('')
      setTitle('')
      setAdding(false)
      toast('Video added')
    } catch (err) {
      errorToast(err)
    }
  }

  const remove = async (item: MediaItem): Promise<void> => {
    if (!confirm(`Remove "${item.title}"?`)) return
    await window.api.media.remove(item.id)
    await useApp.getState().refreshMedia()
  }

  const addToService = async (item: MediaItem): Promise<void> => {
    await useApp.getState().addToSchedule({ type: 'media', title: item.title, mediaId: item.id }).catch(errorToast)
    toast(`Added "${item.title}" to service`)
  }

  return (
    <>
      <div className="searchbar">
        <input className="input" placeholder="Search videos…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="btn primary" onClick={() => setAdding((a) => !a)}>
          ＋ Add
        </button>
      </div>

      {adding && (
        <div className="bible-controls">
          <div className="field" style={{ margin: 0 }}>
            <label>YouTube link or video id</label>
            <input
              className="input"
              placeholder="https://www.youtube.com/watch?v=…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoFocus
            />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Title (optional)</label>
            <input className="input" placeholder="e.g. Psalm 23 — Shane & Shane" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="row">
            <button className="btn primary" onClick={add}>
              Save video
            </button>
            <button className="btn ghost" onClick={() => setAdding(false)}>
              Cancel
            </button>
          </div>
          <div className="help">
            Paste any YouTube link — worship songs, Psalms, hymns, lyric videos. It plays full screen on the projector.
          </div>
        </div>
      )}

      <div className="col-body">
        {media.length === 0 ? (
          <div className="empty">
            No videos yet.
            <br />
            <br />
            Click <b>＋ Add</b> and paste a YouTube link (e.g. a Psalm or worship song).
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">No videos match “{query}”.</div>
        ) : (
          <div className="list">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`list-item ${deck?.source.itemId === item.id ? 'active' : ''}`}
                onClick={() => useApp.getState().loadMedia(item)}
                onDoubleClick={() => {
                  useApp.getState().loadMedia(item)
                  const d = useApp.getState().deck
                  if (d) useApp.getState().goLiveMedia(d, true).catch(errorToast)
                }}
                title="Click to load · double-click to play live"
              >
                <img
                  src={youTubeThumb(item.youtubeId)}
                  alt=""
                  style={{ width: 64, height: 36, objectFit: 'cover', borderRadius: 4, flex: 'none', background: '#000' }}
                />
                <div className="grow">
                  <div className="title">{item.title}</div>
                  <div className="sub">YouTube</div>
                </div>
                <div className="row" onClick={(e) => e.stopPropagation()}>
                  <button className="btn sm ghost" title="Add to service" onClick={() => addToService(item)}>
                    ＋
                  </button>
                  <button className="btn sm ghost" title="Remove" onClick={() => remove(item)}>
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
