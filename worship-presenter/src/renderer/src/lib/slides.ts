import type { ScripturePassage, Slide, Song } from '@shared/types'

let counter = 0
const sid = (): string => `slide-${Date.now().toString(36)}-${(counter++).toString(36)}`

const SECTION_KEYWORDS = /^(verse|chorus|pre-?chorus|bridge|intro|outro|tag|refrain|ending|interlude|vamp|coda)\b/i

function isLabelLine(line: string): boolean {
  const t = line.trim()
  if (!t) return false
  if (SECTION_KEYWORDS.test(t)) return true
  // Bracketed labels like [Chorus] or (Verse 2)
  if (/^[[(].*[)\]]$/.test(t) && t.length <= 24) return true
  // Short line ending in a colon, e.g. "Chorus:"
  if (t.endsWith(':') && t.length <= 24) return true
  return false
}

function cleanLabel(line: string): string {
  return line.trim().replace(/^[[(]/, '').replace(/[)\]:]+$/, '').trim()
}

// Turns free-form lyrics into presentable slides.
// Blank lines separate sections; long sections are split so text stays readable.
export function songToSlides(song: Song, maxLinesPerSlide = 6): Slide[] {
  const blocks = song.lyrics
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((b) => b.replace(/\s+$/g, ''))
    .filter((b) => b.trim().length > 0)

  const slides: Slide[] = []
  for (const block of blocks) {
    const rawLines = block.split('\n')
    let label: string | undefined
    let lines = rawLines
    if (rawLines.length > 0 && isLabelLine(rawLines[0])) {
      label = cleanLabel(rawLines[0])
      lines = rawLines.slice(1)
    }
    lines = lines.map((l) => l.trim()).filter((l) => l.length > 0)
    if (lines.length === 0) {
      if (label) slides.push({ id: sid(), lines: [label], label })
      continue
    }
    for (let i = 0; i < lines.length; i += maxLinesPerSlide) {
      const chunk = lines.slice(i, i + maxLinesPerSlide)
      slides.push({
        id: sid(),
        lines: chunk,
        label: lines.length > maxLinesPerSlide && label ? `${label} (${Math.floor(i / maxLinesPerSlide) + 1})` : label
      })
    }
  }
  if (slides.length === 0) slides.push({ id: sid(), lines: [song.title], label: 'Title' })
  return slides
}

// Turns a scripture passage into slides (default one verse per slide).
export function passageToSlides(passage: ScripturePassage, versesPerSlide = 1): Slide[] {
  const abbr = passage.versionName
  const slides: Slide[] = []
  for (let i = 0; i < passage.verses.length; i += versesPerSlide) {
    const group = passage.verses.slice(i, i + versesPerSlide)
    const first = group[0].verse
    const last = group[group.length - 1].verse
    const range = first === last ? `${first}` : `${first}-${last}`
    const reference = `${passage.book} ${passage.chapter}:${range}`
    slides.push({
      id: sid(),
      lines: group.map((v) => (versesPerSlide > 1 ? `${v.verse}. ${v.text}` : v.text)),
      label: `${reference} · ${abbr}`,
      reference: `${reference} (${abbr})`
    })
  }
  if (slides.length === 0) slides.push({ id: sid(), lines: ['(no verses)'], label: passage.book })
  return slides
}

export function makeSlide(lines: string[], label?: string, reference?: string): Slide {
  return { id: sid(), lines, label, reference }
}
