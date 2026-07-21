import { useState } from 'react'
import { useApp } from '../store'
import { errorToast, toast } from '../ui'

export function ServicePanel(): JSX.Element {
  const { schedules, activeScheduleId, setActiveSchedule, deck } = useApp()
  const [renaming, setRenaming] = useState(false)
  const [nameDraft, setNameDraft] = useState('')

  const active = schedules.find((s) => s.id === activeScheduleId) ?? null

  const newSchedule = async (): Promise<void> => {
    const name = prompt('Name this service (e.g. "Sunday Morning")', 'Sunday Service')
    if (!name) return
    try {
      await useApp.getState().createSchedule(name.trim())
      toast('Service created')
    } catch (err) {
      errorToast(err)
    }
  }

  const saveRename = async (): Promise<void> => {
    if (!active || !nameDraft.trim()) return setRenaming(false)
    await useApp.getState().renameSchedule(active.id, nameDraft.trim()).catch(errorToast)
    setRenaming(false)
  }

  const deleteSchedule = async (): Promise<void> => {
    if (!active) return
    if (!confirm(`Delete service "${active.name}"? This cannot be undone.`)) return
    await useApp.getState().deleteSchedule(active.id).catch(errorToast)
  }

  return (
    <>
      <div className="searchbar" style={{ flexDirection: 'column', gap: 8 }}>
        <div className="row">
          <select
            className="select"
            value={activeScheduleId ?? ''}
            onChange={(e) => setActiveSchedule(e.target.value || null)}
          >
            {schedules.length === 0 && <option value="">No services yet</option>}
            {schedules.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button className="btn icon" title="New service" onClick={newSchedule}>
            ＋
          </button>
        </div>
        {active && (
          <div className="row">
            <button
              className="btn sm ghost"
              onClick={() => {
                setNameDraft(active.name)
                setRenaming(true)
              }}
            >
              ✎ Rename
            </button>
            <button className="btn sm ghost" onClick={deleteSchedule}>
              🗑 Delete
            </button>
          </div>
        )}
        {renaming && (
          <div className="row">
            <input
              className="input"
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveRename()}
            />
            <button className="btn sm primary" onClick={saveRename}>
              Save
            </button>
          </div>
        )}
      </div>

      <div className="col-body">
        {!active || active.items.length === 0 ? (
          <div className="empty">
            This service is empty.
            <br />
            <br />
            Go to <b>Songs</b>, <b>Bible</b>, or <b>Media</b> and use “Add to service” to build your order.
          </div>
        ) : (
          <div className="list">
            {active.items.map((item, idx) => (
              <div
                key={item.id}
                className={`list-item ${deck?.source.itemId === item.songId || deck?.source.itemId === item.mediaId ? 'active' : ''}`}
                onClick={() => useApp.getState().openScheduleItem(item).catch(errorToast)}
                onDoubleClick={async () => {
                  await useApp.getState().openScheduleItem(item).catch(errorToast)
                  const d = useApp.getState().deck
                  if (d) {
                    if (d.kind === 'media') useApp.getState().goLiveMedia(d, true).catch(errorToast)
                    else useApp.getState().goLiveSlide(d, 0).catch(errorToast)
                  }
                }}
                title="Click to load · double-click to go live"
              >
                <span className={`badge ${item.type}`}>{item.type === 'scripture' ? 'Bible' : item.type}</span>
                <div className="grow">
                  <div className="title">{item.title}</div>
                </div>
                <div className="row" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn sm ghost"
                    disabled={idx === 0}
                    onClick={() => useApp.getState().moveScheduleItem(item.id, -1).catch(errorToast)}
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    className="btn sm ghost"
                    disabled={idx === active.items.length - 1}
                    onClick={() => useApp.getState().moveScheduleItem(item.id, 1).catch(errorToast)}
                    title="Move down"
                  >
                    ▼
                  </button>
                  <button
                    className="btn sm ghost"
                    onClick={() => useApp.getState().removeScheduleItem(item.id).catch(errorToast)}
                    title="Remove from service"
                  >
                    ✕
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
