/* ── 날짜별 걸음 수 localStorage 저장 ─────────────────────── */

const KEY_STEPS = 'mandogi_steps'
const KEY_GOAL = 'mandogi_goal'
const KEY_STRIDE = 'mandogi_stride'

export interface HistoryItem {
  date: string
  label: string
  steps: number
}

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function readMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(KEY_STEPS)
    return raw ? (JSON.parse(raw) as Record<string, number>) : {}
  } catch {
    return {}
  }
}

function writeMap(map: Record<string, number>) {
  try {
    localStorage.setItem(KEY_STEPS, JSON.stringify(map))
  } catch {
    /* 저장 실패 무시 (시크릿 모드 등) */
  }
}

export function getSteps(dateKey: string = todayKey()): number {
  return readMap()[dateKey] ?? 0
}

export function addSteps(n: number, dateKey: string = todayKey()): number {
  const map = readMap()
  map[dateKey] = Math.max(0, (map[dateKey] ?? 0) + n)
  writeMap(map)
  return map[dateKey]
}

export function resetToday(dateKey: string = todayKey()) {
  const map = readMap()
  delete map[dateKey]
  writeMap(map)
}

const WEEK = ['일', '월', '화', '수', '목', '금', '토']

export function getHistory(days: number): HistoryItem[] {
  const map = readMap()
  const now = new Date()
  const out: HistoryItem[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const key = todayKey(d)
    out.push({ date: key, label: WEEK[d.getDay()], steps: map[key] ?? 0 })
  }
  return out
}

export function getGoal(): number {
  const v = Number(localStorage.getItem(KEY_GOAL))
  return Number.isFinite(v) && v > 0 ? v : 10000
}

export function setGoal(g: number) {
  try {
    localStorage.setItem(KEY_GOAL, String(g))
  } catch {
    /* ignore */
  }
}

export function getStrideCm(): number {
  const v = Number(localStorage.getItem(KEY_STRIDE))
  return Number.isFinite(v) && v >= 40 && v <= 120 ? v : 70
}

export function setStrideCm(s: number) {
  try {
    localStorage.setItem(KEY_STRIDE, String(s))
  } catch {
    /* ignore */
  }
}