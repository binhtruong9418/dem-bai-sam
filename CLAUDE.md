# CLAUDE.md — Đếm Bài Sâm

## Project overview

Mini web app ghi chú tiền thắng/thua khi chơi bài Sâm dịp Tết. Mobile-first, theme đỏ-vàng, dữ liệu localStorage.

**Tech:** React 19 + TypeScript + Vite 7. Packages: `recharts` (biểu đồ), `qrcode.react` (QR).

## Commands

```bash
yarn dev        # Dev server → http://localhost:5173
yarn build      # Production build (tsc + vite build)
yarn preview    # Preview production build
```

## Project structure

```
src/
├── types.ts              # Interfaces (Player, GameSession, SharedGame), constants (AVATARS, CHART_COLORS)
├── utils.ts              # Helpers: localStorage, format, expression builder, share encode/decode, chart data
├── sounds.ts             # Web Audio API sound effects (no mp3 files)
├── components/
│   ├── Confetti.tsx       # CSS confetti animation overlay
│   ├── Dialogs.tsx        # NewGameDialog, ConfirmDialog, AvatarPicker, ShareDialog
│   ├── GameCard.tsx       # Game card in home list
│   ├── PlayerSummary.tsx  # Player card: rank, expression history, stats chips, fly animation
│   ├── ScoreEntry.tsx     # Score input form with +/- buttons
│   └── StatsSection.tsx   # Recharts LineChart + stat cards per player
├── App.tsx                # Main app: state management, game/player/score logic, view routing
├── App.css                # Component styles
├── index.css              # Global styles, CSS variables, Tet theme
└── main.tsx               # Entry point
```

## Architecture

- **Single-page app** with 3 views: `home` | `game` | `review` — managed by `view` state in App.tsx
- **State lives in App.tsx** — passed down as props. No context/redux needed at this scale.
- **Data flow:** `games: GameSession[]` is the single source of truth. Each game has `players: Player[]`, each player has `history: number[]` and `total: number`.
- **Persistence:** `useEffect` auto-saves `games` to `localStorage['sam_games']` on every change.

## Key patterns

- **Score entry:** Users type numbers or use +/- buttons (±10). `submitScores()` reads all inputs, updates each player's `history` and `total`, then clears inputs.
- **Expression display:** `buildExpressionParts()` in utils.ts converts `[10, -5, 20]` → colored parts `"10" "- 5" "+ 20"`.
- **Sharing:** `encodeGame()` compresses game data to base64 URL param. On mount, `decodeGame()` checks URL for shared game.
- **Sounds:** Generated via Web Audio API oscillators in sounds.ts. Toggle saved in `localStorage['sam_sound']`.
- **Animations:** CSS-only — confetti particles, score fly-up, pulse-win, shake-lose. Triggered by state flags with setTimeout cleanup.

## Conventions

- All component files use default exports
- CSS class names use kebab-case
- Vietnamese UI text throughout (button labels, placeholders, section titles)
- Money formatted with `toLocaleString('vi-VN')` and `k` suffix
- Player sorting: always by `total` descending via `getSorted()`

## Data model

```typescript
interface Player {
  id: string          // Date.now().toString()
  name: string
  avatar: string      // Single emoji from AVATARS constant
  history: number[]   // Raw score entries, e.g. [10, -5, 20]
  total: number       // Sum of history (denormalized for perf)
}

interface GameSession {
  id: string
  name: string
  createdAt: number
  endedAt?: number    // Undefined = active, set = ended
  players: Player[]
}
```

## Common tasks

**Add a new sound effect:**
1. Add function in `sounds.ts` using `AudioContext` + `OscillatorNode`
2. Import and call via `playSound(fn)` wrapper in App.tsx (respects sound toggle)

**Add a new dialog:**
1. Export component from `components/Dialogs.tsx`
2. Add `show` state in App.tsx, render conditionally at bottom of JSX

**Add a new stat:**
1. Compute from `player.history` array
2. Display in `PlayerSummary.tsx` (inline chips) or `StatsSection.tsx` (detailed cards)
