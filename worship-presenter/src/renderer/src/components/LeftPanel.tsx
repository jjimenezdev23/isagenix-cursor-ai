import { useApp, type NavTab } from '../store'
import { ServicePanel } from './ServicePanel'
import { SongsPanel } from './SongsPanel'
import { BiblePanel } from './BiblePanel'
import { MediaPanel } from './MediaPanel'

const TABS: { id: NavTab; label: string; icon: string }[] = [
  { id: 'service', label: 'Service', icon: '☰' },
  { id: 'songs', label: 'Songs', icon: '♪' },
  { id: 'bible', label: 'Bible', icon: '✝' },
  { id: 'media', label: 'Media', icon: '▶' }
]

export function LeftPanel(): JSX.Element {
  const { nav, setNav } = useApp()
  return (
    <div className="col">
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`tab ${nav === t.id ? 'active' : ''}`} onClick={() => setNav(t.id)}>
            <span style={{ marginRight: 6 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
      {nav === 'service' && <ServicePanel />}
      {nav === 'songs' && <SongsPanel />}
      {nav === 'bible' && <BiblePanel />}
      {nav === 'media' && <MediaPanel />}
    </div>
  )
}
