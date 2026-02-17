import type { GameSession } from '../types'
import { formatMoney, formatDate, getSorted } from '../utils'

interface Props {
  game: GameSession
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}

export default function GameCard({ game, onOpen, onDelete }: Props) {
  return (
    <div
      className={`game-card ${game.endedAt ? 'ended' : 'active'}`}
      onClick={() => onOpen(game.id)}
    >
      <div className="game-card-header">
        <span className="game-card-name">{game.name}</span>
        <span className={`game-card-badge ${game.endedAt ? 'ended' : 'active'}`}>
          {game.endedAt ? 'Đã kết thúc' : 'Đang chơi'}
        </span>
      </div>
      <div className="game-card-info">
        <span>{game.players.length} người chơi</span>
        <span>{formatDate(game.createdAt)}</span>
      </div>
      {game.players.length > 0 && (
        <div className="game-card-preview">
          {getSorted(game.players)
            .slice(0, 3)
            .map((p) => (
              <span key={p.id} className="game-card-player">
                {p.avatar} {p.name}:{' '}
                <strong className={p.total > 0 ? 'positive' : p.total < 0 ? 'negative' : ''}>
                  {formatMoney(p.total)}
                </strong>
              </span>
            ))}
          {game.players.length > 3 && (
            <span className="game-card-more">+{game.players.length - 3} người khác</span>
          )}
        </div>
      )}
      <button
        className="game-card-delete"
        onClick={(e) => { e.stopPropagation(); onDelete(game.id) }}
      >
        ✕
      </button>
    </div>
  )
}
