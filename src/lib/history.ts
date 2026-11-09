import type { ScanResult } from '../types'

const HISTORY_KEY = 'sh.history.v1'
const MAX_ENTRIES = 40

export interface HistoryEntry {
  result: ScanResult
  thumb?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(isRecord)
      .map((entry): HistoryEntry | null => {
        const result = entry.result
        if (!isRecord(result) || typeof result.id !== 'string' || typeof result.title !== 'string') return null
        return {
          result: result as unknown as ScanResult,
          thumb: typeof entry.thumb === 'string' ? entry.thumb : undefined,
        }
      })
      .filter((entry): entry is HistoryEntry => entry !== null)
      .slice(0, MAX_ENTRIES)
  } catch {
    return []
  }
}

function writeHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
  } catch {
    // History is a convenience; a full or blocked storage must not break scans.
  }
}

export function loadHistory(): HistoryEntry[] {
  return readHistory()
}

export function addHistoryEntry(entry: HistoryEntry): HistoryEntry[] {
  const entries = readHistory().filter((existing) => existing.result.id !== entry.result.id)
  const next = [entry, ...entries].slice(0, MAX_ENTRIES)
  writeHistory(next)
  return next
}

export function removeHistoryEntry(id: string): HistoryEntry[] {
  const next = readHistory().filter((entry) => entry.result.id !== id)
  writeHistory(next)
  return next
}

export function clearHistory(): HistoryEntry[] {
  writeHistory([])
  return []
}
