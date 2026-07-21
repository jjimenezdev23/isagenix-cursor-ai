// Extracts an 11-character YouTube video id from the many URL formats,
// or accepts a bare id that was pasted directly.
export function parseYouTubeId(input: string): string | null {
  const value = input.trim()
  if (!value) return null

  // Bare id.
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value

  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = url.pathname.slice(1, 12)
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = url.searchParams.get('v')
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v
      // /embed/<id>, /shorts/<id>, /live/<id>
      const m = url.pathname.match(/\/(embed|shorts|live|v)\/([a-zA-Z0-9_-]{11})/)
      if (m) return m[2]
    }
  } catch {
    // not a URL; fall through
  }
  // Last resort: find an 11-char token in the string.
  const m = value.match(/[a-zA-Z0-9_-]{11}/)
  return m ? m[0] : null
}

export function parseStartSeconds(input: string): number | undefined {
  try {
    const url = new URL(input.trim())
    const t = url.searchParams.get('t') || url.searchParams.get('start')
    if (!t) return undefined
    if (/^\d+$/.test(t)) return Number(t)
    // Format like 1h2m3s
    const m = t.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/)
    if (m) {
      const [, h, mm, s] = m
      return (Number(h || 0) * 3600) + (Number(mm || 0) * 60) + Number(s || 0)
    }
  } catch {
    /* ignore */
  }
  return undefined
}

export function youTubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}

export function youTubeEmbedUrl(id: string, opts: { autoplay?: boolean; start?: number; controls?: boolean } = {}): string {
  const params = new URLSearchParams({
    autoplay: opts.autoplay ? '1' : '0',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    controls: opts.controls === false ? '0' : '1'
  })
  if (opts.start) params.set('start', String(opts.start))
  // youtube-nocookie keeps things private-friendly for a local church setup.
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`
}
