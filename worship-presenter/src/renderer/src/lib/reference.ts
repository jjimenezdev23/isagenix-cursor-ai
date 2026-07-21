import { BIBLE_BOOKS, findBook } from '@shared/books'
import type { BibleBook } from '@shared/types'

export interface ParsedReference {
  book: BibleBook
  chapter: number
  fromVerse?: number
  toVerse?: number
}

// Parses references like "John 3:16", "psalm 23", "1 cor 13:4-7", "gen 1".
export function parseReference(input: string): ParsedReference | null {
  const text = input.trim()
  if (!text) return null

  // Split leading book part (may start with a number for 1/2/3 John etc.)
  const m = text.match(/^\s*((?:[1-3]\s*)?[A-Za-z][A-Za-z.\s]*?)\s*(\d+)?\s*(?::\s*(\d+)(?:\s*-\s*(\d+))?)?\s*$/)
  if (!m) {
    const book = findBook(text)
    return book ? { book, chapter: 1 } : null
  }
  const [, bookPart, chapterStr, fromStr, toStr] = m
  const book = findBook(bookPart.trim())
  if (!book) return null

  const chapter = chapterStr ? Math.min(Math.max(1, Number(chapterStr)), book.chapters) : 1
  const fromVerse = fromStr ? Number(fromStr) : undefined
  const toVerse = toStr ? Number(toStr) : fromVerse
  return { book, chapter, fromVerse, toVerse }
}

export function bookByName(name: string): BibleBook | undefined {
  return BIBLE_BOOKS.find((b) => b.name === name) ?? findBook(name)
}
