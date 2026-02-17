import type { Player } from '../types'
import { formatMoney, buildExpressionParts, getMaxStreak, getLoseStreak, getSorted } from '../utils'

interface Props {
  players: Player[]
  isActive: boolean
  scoreAnimations: Record<string, number>
  onAvatarClick?: (playerId: string) => void
  onUndo?: (playerId: string) => void
  onRemove?: (playerId: string) => void
}

export default function PlayerSummary({ players, isActive, scoreAnimations, onAvatarClick, onUndo, onRemove }: Props) {
  return (
    <div className="player-summary-list">
      {getSorted(players).map((p, i) => {
        const anim = scoreAnimations[p.id]
        return (
          <div
            key={p.id}
            className={`player-summary ${
              i === 0 && p.total > 0 ? 'top-player' : ''
            } ${p.total > 0 ? 'winning' : p.total < 0 ? 'losing' : ''} ${
              anim !== undefined ? (anim > 0 ? 'anim-win' : 'anim-lose') : ''
            }`}
          >
            <div className="player-summary-top">
              <div className="player-summary-left">
                <button
                  className="player-avatar"
                  onClick={() => isActive && onAvatarClick?.(p.id)}
                  title={isActive ? 'Đổi avatar' : undefined}
                  disabled={!isActive}
                >
                  {p.avatar}
                </button>
                <div className="player-name-rank">
                  <div className={`player-rank-badge ${i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : ''}`}>
                    {i === 0 ? '👑' : `#${i + 1}`}
                  </div>
                  <span className="player-summary-name">{p.name}</span>
                </div>
              </div>
              <span
                className={`player-summary-total ${
                  p.total > 0 ? 'positive' : p.total < 0 ? 'negative' : 'zero'
                }`}
              >
                {formatMoney(p.total)}
              </span>
              {isActive && (
                <div className="player-summary-actions">
                  {p.history.length > 0 && (
                    <button className="undo-btn" onClick={() => onUndo?.(p.id)} title="Hoàn tác">↩</button>
                  )}
                  <button className="player-remove" onClick={() => onRemove?.(p.id)}>✕</button>
                </div>
              )}
            </div>
            {p.history.length > 0 && (
              <div className="player-expression">
                {buildExpressionParts(p.history).map((part, j) => (
                  <span key={j} className={`expr-${part.type}`}>{part.text}</span>
                ))}
                <span className="expr-eq"> = <strong>{p.total.toLocaleString('vi-VN')}</strong></span>
              </div>
            )}
            {p.history.length > 0 && (
              <div className="player-stats-row">
                <span className="stat-chip">{p.history.length} ván</span>
                <span className="stat-chip">TB: {Math.round(p.total / p.history.length)}</span>
                {getMaxStreak(p.history) >= 2 && (
                  <span className="stat-chip streak-win">🔥{getMaxStreak(p.history)}</span>
                )}
                {getLoseStreak(p.history) >= 2 && (
                  <span className="stat-chip streak-lose">💀{getLoseStreak(p.history)}</span>
                )}
              </div>
            )}
            {anim !== undefined && (
              <div className={`score-fly ${anim > 0 ? 'fly-pos' : 'fly-neg'}`}>
                {formatMoney(anim)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
