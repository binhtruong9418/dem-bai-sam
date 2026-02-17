export interface Player {
  id: string
  name: string
  avatar: string
  history: number[]
  total: number
}

export interface GameSession {
  id: string
  name: string
  createdAt: number
  endedAt?: number
  players: Player[]
}

export interface SharedGame {
  n: string
  p: { n: string; a: string; h: number[]; t: number }[]
}

export type View = 'home' | 'game' | 'review'

export const AVATARS = [
  '🐉', '🐅', '🐇', '🐍', '🐴', '🐏', '🐵', '🐓', '🐕', '🐖', '🐀', '🐂',
  '🎋', '🧧', '🏮', '🎆', '🎇', '🎍', '🍊', '🪷',
]

export const CHART_COLORS = ['#ffd700', '#4caf50', '#ff6b6b', '#64b5f6', '#ba68c8', '#ff8a65', '#4dd0e1', '#aed581']

export const STORAGE_KEY = 'sam_games'
export const SOUND_KEY = 'sam_sound'
export const MUSIC_KEY = 'sam_music'
