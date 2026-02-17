import type { Player } from '../types'

interface Props {
  players: Player[]
  scoreInputs: Record<string, string>
  onScoreChange: (playerId: string, value: string) => void
  onAdjust: (playerId: string, delta: number) => void
  onSubmit: () => void
}

export default function ScoreEntry({ players, scoreInputs, onScoreChange, onAdjust, onSubmit }: Props) {
  return (
    <div className="section">
      <div className="section-title">🎴 Nhập điểm</div>
      <div className="score-entry">
        {players.map((p) => {
          const val = scoreInputs[p.id] || ''
          const numVal = parseInt(val, 10) || 0
          return (
            <div key={p.id} className="score-row">
              <span className="score-row-avatar">{p.avatar}</span>
              <div className="score-row-name">{p.name}</div>
              <div className="score-input-wrapper">
                <button className="score-quick-btn minus" onClick={() => onAdjust(p.id, -10)} type="button">−</button>
                <input
                  className={`score-input ${numVal > 0 ? 'has-positive' : numVal < 0 ? 'has-negative' : ''}`}
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={val}
                  onChange={(e) => onScoreChange(p.id, e.target.value)}
                />
                <button className="score-quick-btn plus" onClick={() => onAdjust(p.id, 10)} type="button">+</button>
              </div>
            </div>
          )
        })}
        <button className="btn btn-gold btn-block" onClick={onSubmit} type="button">
          ✓ Ghi điểm
        </button>
      </div>
    </div>
  )
}
