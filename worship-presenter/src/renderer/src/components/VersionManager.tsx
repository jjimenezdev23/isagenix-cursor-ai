import { useEffect, useMemo, useState } from 'react'
import type { BibleVersionMeta } from '@shared/types'
import { useApp } from '../store'
import { errorToast, toast } from '../ui'

interface Props {
  onClose(): void
}

export function VersionManager({ onClose }: Props): JSX.Element {
  const [available, setAvailable] = useState<BibleVersionMeta[]>([])
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const refresh = async (): Promise<void> => {
    const installed = await window.api.bible.installedVersions()
    setInstalledIds(new Set(installed.map((v) => v.id)))
  }

  useEffect(() => {
    ;(async () => {
      try {
        const [avail] = await Promise.all([window.api.bible.availableVersions()])
        setAvailable(avail)
        await refresh()
      } catch (err) {
        errorToast(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = q
      ? available.filter(
          (v) =>
            v.version.toLowerCase().includes(q) ||
            v.language.name.toLowerCase().includes(q) ||
            (v.abbreviation ?? '').toLowerCase().includes(q)
        )
      : available
    // Installed first, then alphabetical by language then name.
    return [...base]
      .sort((a, b) => a.version.localeCompare(b.version))
      .sort((a, b) => a.language.name.localeCompare(b.language.name))
      .sort((a, b) => Number(installedIds.has(b.id)) - Number(installedIds.has(a.id)))
      .slice(0, 300)
  }, [available, query, installedIds])

  const install = async (v: BibleVersionMeta): Promise<void> => {
    setBusy(v.id)
    try {
      await window.api.bible.installVersion(v.id)
      await refresh()
      await useApp.getState().refreshSettings()
      toast(`Added ${v.version}`)
    } catch (err) {
      errorToast(err)
    } finally {
      setBusy(null)
    }
  }

  const remove = async (v: BibleVersionMeta): Promise<void> => {
    setBusy(v.id)
    try {
      await window.api.bible.removeVersion(v.id)
      await refresh()
      await useApp.getState().refreshSettings()
    } catch (err) {
      errorToast(err)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Bible versions</h3>
          <button className="btn ghost" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="help" style={{ marginBottom: 10 }}>
            Choose one or more translations (there are versions in many languages). Added versions are cached on this
            computer as you use them, so they keep working offline.
          </div>
          <input
            className="input"
            placeholder="Search by name or language (e.g. English, Español, KJV)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ marginBottom: 10 }}
            autoFocus
          />
          {loading ? (
            <div className="empty">Loading version list… (needs internet the first time)</div>
          ) : (
            <div className="version-list">
              {filtered.map((v) => {
                const isInstalled = installedIds.has(v.id)
                return (
                  <div className="version-row" key={v.id}>
                    <div className="grow">
                      <div className="title">
                        {v.version} {v.abbreviation ? <span className="badge">{v.abbreviation}</span> : null}
                      </div>
                      <div className="sub">
                        {v.language.name}
                        {v.scope ? ` · ${v.scope}` : ''}
                      </div>
                    </div>
                    {isInstalled ? (
                      <button className="btn sm" disabled={busy === v.id} onClick={() => remove(v)}>
                        Remove
                      </button>
                    ) : (
                      <button className="btn sm primary" disabled={busy === v.id} onClick={() => install(v)}>
                        {busy === v.id ? 'Adding…' : 'Add'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
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
