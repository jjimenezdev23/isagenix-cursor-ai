import { useEffect, useState } from 'react'
import { BIBLE_BOOKS } from '@shared/books'
import type { BibleChapter, BibleVersionMeta, ScripturePassage } from '@shared/types'
import { useApp } from '../store'
import { VersionManager } from './VersionManager'
import { parseReference } from '../lib/reference'
import { errorToast, toast } from '../ui'

export function BiblePanel(): JSX.Element {
  const { settings } = useApp()
  const [versions, setVersions] = useState<BibleVersionMeta[]>([])
  const [versionId, setVersionId] = useState<string>('')
  const [bookSlug, setBookSlug] = useState<string>('psalms')
  const [chapter, setChapter] = useState<number>(23)
  const [data, setData] = useState<BibleChapter | null>(null)
  const [loading, setLoading] = useState(false)
  const [sel, setSel] = useState<{ from: number; to: number } | null>(null)
  const [refInput, setRefInput] = useState('')
  const [showManager, setShowManager] = useState(false)

  const book = BIBLE_BOOKS.find((b) => b.slug === bookSlug)
  const version = versions.find((v) => v.id === versionId)

  const loadVersions = async (): Promise<void> => {
    const installed = await window.api.bible.installedVersions()
    setVersions(installed)
    if (installed.length > 0) {
      setVersionId((cur) => (cur && installed.some((v) => v.id === cur) ? cur : settings?.defaultBibleVersion ?? installed[0].id))
    } else {
      setVersionId('')
    }
  }

  useEffect(() => {
    loadVersions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.installedBibleVersions?.length])

  const loadChapter = async (vId: string, bSlug: string, ch: number): Promise<void> => {
    if (!vId) return
    setLoading(true)
    setData(null)
    try {
      const result = await window.api.bible.chapter(vId, bSlug, ch)
      setData(result)
    } catch (err) {
      errorToast(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (versionId) loadChapter(versionId, bookSlug, chapter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versionId, bookSlug, chapter])

  const clickVerse = (v: number): void => {
    setSel((cur) => {
      if (!cur || cur.from !== cur.to || v === cur.from) return { from: v, to: v }
      // Second click extends the range.
      return { from: Math.min(cur.from, v), to: Math.max(cur.from, v) }
    })
  }

  const buildPassage = (): ScripturePassage | null => {
    if (!data || !version || !book) return null
    const from = sel?.from ?? data.verses[0]?.verse ?? 1
    const to = sel?.to ?? from
    const verses = data.verses.filter((v) => v.verse >= from && v.verse <= to)
    if (verses.length === 0) return null
    return {
      versionId: version.id,
      versionName: version.abbreviation ?? version.id.toUpperCase(),
      book: book.name,
      bookSlug: book.slug,
      chapter,
      fromVerse: from,
      toVerse: to,
      verses
    }
  }

  const loadToDeck = (): void => {
    const passage = buildPassage()
    if (!passage) return toast('Select one or more verses first', 'error')
    useApp.getState().loadPassage(passage)
  }

  const addToService = async (): Promise<void> => {
    const passage = buildPassage()
    if (!passage) return toast('Select one or more verses first', 'error')
    const title = `${passage.book} ${passage.chapter}:${passage.fromVerse}${
      passage.toVerse !== passage.fromVerse ? '-' + passage.toVerse : ''
    } (${passage.versionName})`
    await useApp.getState().addToSchedule({ type: 'scripture', title, passage }).catch(errorToast)
    toast(`Added ${title} to service`)
  }

  const goToReference = (): void => {
    const parsed = parseReference(refInput)
    if (!parsed) return toast('Could not understand that reference', 'error')
    setBookSlug(parsed.book.slug)
    setChapter(parsed.chapter)
    if (parsed.fromVerse) setSel({ from: parsed.fromVerse, to: parsed.toVerse ?? parsed.fromVerse })
    else setSel(null)
  }

  if (versions.length === 0) {
    return (
      <>
        <div className="col-body">
          <div className="empty">
            No Bible versions added yet.
            <br />
            <br />
            <button className="btn primary" onClick={() => setShowManager(true)}>
              ＋ Add Bible versions
            </button>
            <br />
            <br />
            Pick from many translations and languages. The first download needs internet; after that they work offline.
          </div>
        </div>
        {showManager && <VersionManager onClose={() => setShowManager(false)} />}
      </>
    )
  }

  return (
    <>
      <div className="bible-controls">
        <div className="row">
          <input
            className="input"
            placeholder='Go to reference — e.g. "John 3:16-18", "Psalm 23"'
            value={refInput}
            onChange={(e) => setRefInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && goToReference()}
          />
          <button className="btn" onClick={goToReference} title="Go">
            Go
          </button>
        </div>
        <div className="row">
          <select className="select" value={versionId} onChange={(e) => setVersionId(e.target.value)}>
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.abbreviation ?? v.version} — {v.version}
              </option>
            ))}
          </select>
          <button className="btn icon" title="Manage versions" onClick={() => setShowManager(true)}>
            ⚙
          </button>
        </div>
        <div className="row">
          <select
            className="select"
            value={bookSlug}
            onChange={(e) => {
              setBookSlug(e.target.value)
              setChapter(1)
              setSel(null)
            }}
          >
            {BIBLE_BOOKS.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
          <select
            className="select"
            style={{ maxWidth: 90 }}
            value={chapter}
            onChange={(e) => {
              setChapter(Number(e.target.value))
              setSel(null)
            }}
          >
            {Array.from({ length: book?.chapters ?? 1 }, (_, i) => i + 1).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="row">
          <button className="btn primary grow" onClick={loadToDeck} style={{ justifyContent: 'center' }}>
            Load to slides
          </button>
          <button className="btn grow" onClick={addToService} style={{ justifyContent: 'center' }}>
            ＋ Add to service
          </button>
        </div>
        {sel && (
          <div className="status-line">
            Selected: {book?.name} {chapter}:{sel.from}
            {sel.to !== sel.from ? `-${sel.to}` : ''} · click another verse to extend ·{' '}
            <button className="btn sm ghost" onClick={() => setSel(null)}>
              clear
            </button>
          </div>
        )}
      </div>

      <div className="col-body">
        {loading ? (
          <div className="empty">Loading {book?.name} {chapter}…</div>
        ) : !data ? (
          <div className="empty">Choose a book and chapter.</div>
        ) : (
          <div className="verse-list">
            {data.verses.map((v) => {
              const selected = sel && v.verse >= sel.from && v.verse <= sel.to
              return (
                <div
                  key={v.verse}
                  className={`verse ${selected ? 'selected' : ''}`}
                  onClick={() => clickVerse(v.verse)}
                  onDoubleClick={() => {
                    setSel({ from: v.verse, to: v.verse })
                    setTimeout(loadToDeck, 0)
                  }}
                >
                  <span className="vn">{v.verse}</span>
                  <span>{v.text}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showManager && <VersionManager onClose={() => setShowManager(false)} />}
    </>
  )
}
