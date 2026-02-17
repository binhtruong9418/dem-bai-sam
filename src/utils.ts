import type { GameSession, Player, SharedGame } from './types'
import { AVATARS, STORAGE_KEY, SOUND_KEY } from './types'

// --- LocalStorage ---
export function loadGames(): GameSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveGames(games: GameSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games))
}

export function loadSoundEnabled(): boolean {
  return localStorage.getItem(SOUND_KEY) === 'true'
}

// --- Format ---
export function formatMoney(amount: number): string {
  if (amount === 0) return '0'
  const prefix = amount > 0 ? '+' : ''
  return prefix + amount.toLocaleString('vi-VN')
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function buildExpressionParts(history: number[]): { text: string; type: 'pos' | 'neg' | 'op' }[] {
  if (history.length === 0) return []
  const parts: { text: string; type: 'pos' | 'neg' | 'op' }[] = []
  history.forEach((v, i) => {
    if (i === 0) {
      parts.push({ text: v.toString(), type: v >= 0 ? 'pos' : 'neg' })
    } else if (v >= 0) {
      parts.push({ text: ' + ', type: 'op' })
      parts.push({ text: v.toString(), type: 'pos' })
    } else {
      parts.push({ text: ' - ', type: 'op' })
      parts.push({ text: Math.abs(v).toString(), type: 'neg' })
    }
  })
  return parts
}

// --- Stats ---
export function getMaxStreak(history: number[]): number {
  let max = 0, current = 0
  for (const v of history) {
    if (v > 0) { current++; max = Math.max(max, current) } else { current = 0 }
  }
  return max
}

export function getLoseStreak(history: number[]): number {
  let max = 0, current = 0
  for (const v of history) {
    if (v < 0) { current++; max = Math.max(max, current) } else { current = 0 }
  }
  return max
}

// --- Share ---
export function encodeGame(game: GameSession): string {
  const compact: SharedGame = {
    n: game.name,
    p: game.players.map((p) => ({ n: p.name, a: p.avatar, h: p.history, t: p.total })),
  }
  return btoa(encodeURIComponent(JSON.stringify(compact)))
}

export function decodeGame(encoded: string): GameSession | null {
  try {
    const json = decodeURIComponent(atob(encoded))
    const data: SharedGame = JSON.parse(json)
    return {
      id: 'shared_' + Date.now(),
      name: data.n,
      createdAt: Date.now(),
      endedAt: Date.now(),
      players: data.p.map((p, i) => ({
        id: 'sp_' + i,
        name: p.n,
        avatar: p.a,
        history: p.h,
        total: p.t,
      })),
    }
  } catch {
    return null
  }
}

export function getRandomAvatar(usedAvatars: string[]): string {
  const available = AVATARS.filter((a) => !usedAvatars.includes(a))
  const pool = available.length > 0 ? available : AVATARS
  return pool[Math.floor(Math.random() * pool.length)]
}

// --- Sort ---
export function getSorted(players: Player[]): Player[] {
  return [...players].sort((a, b) => b.total - a.total)
}

// --- Chart ---
export function buildChartData(players: Player[]): Record<string, number | string>[] {
  if (players.length === 0) return []
  const maxLen = Math.max(...players.map((p) => p.history.length))
  const data: Record<string, number | string>[] = []
  for (let i = 0; i <= maxLen; i++) {
    const point: Record<string, number | string> = { x: i === 0 ? 'Bắt đầu' : `#${i}` }
    players.forEach((p) => {
      let cumulative = 0
      for (let j = 0; j < i && j < p.history.length; j++) {
        cumulative += p.history[j]
      }
      point[p.name] = cumulative
    })
    data.push(point)
  }
  return data
}
