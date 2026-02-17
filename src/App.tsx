import { useState, useEffect, useRef, useCallback } from 'react'
import type { GameSession, View } from './types'
import { SOUND_KEY } from './types'
import {
  loadGames, saveGames, loadSoundEnabled,
  formatMoney, getSorted, getRandomAvatar, decodeGame, encodeGame,
} from './utils'
import { playScoreSound, playAddPlayerSound, playEndGameSound, playUndoSound } from './sounds'
import Confetti from './components/Confetti'
import GameCard from './components/GameCard'
import ScoreEntry from './components/ScoreEntry'
import PlayerSummary from './components/PlayerSummary'
import StatsSection from './components/StatsSection'
import { NewGameDialog, ConfirmDialog, AvatarPicker, ShareDialog } from './components/Dialogs'
import './App.css'

function App() {
  const [games, setGames] = useState<GameSession[]>(loadGames)
  const [view, setView] = useState<View>('home')
  const [activeGameId, setActiveGameId] = useState<string | null>(null)
  const [reviewGameId, setReviewGameId] = useState<string | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(loadSoundEnabled)

  // UI state
  const [showNewGameDialog, setShowNewGameDialog] = useState(false)
  const [newGameName, setNewGameName] = useState('')
  const [newPlayerName, setNewPlayerName] = useState('')
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({})
  const [showEndGameDialog, setShowEndGameDialog] = useState(false)
  const [showDeleteGameDialog, setShowDeleteGameDialog] = useState<string | null>(null)
  const [showUndoDialog, setShowUndoDialog] = useState<string | null>(null)
  const [showRemovePlayerDialog, setShowRemovePlayerDialog] = useState<string | null>(null)
  const [showAvatarPicker, setShowAvatarPicker] = useState<string | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showStatsSection, setShowStatsSection] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  // Animations
  const [showConfetti, setShowConfetti] = useState(false)
  const [scoreAnimations, setScoreAnimations] = useState<Record<string, number>>({})

  const playerInputRef = useRef<HTMLInputElement>(null)
  const gameNameInputRef = useRef<HTMLInputElement>(null)

  // Persist
  useEffect(() => saveGames(games), [games])
  useEffect(() => localStorage.setItem(SOUND_KEY, soundEnabled.toString()), [soundEnabled])

  // Check URL for shared game on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const shared = params.get('game')
    if (shared) {
      const game = decodeGame(shared)
      if (game) {
        setGames((prev) => [game, ...prev])
        setReviewGameId(game.id)
        setView('review')
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [])

  const activeGame = games.find((g) => g.id === activeGameId) ?? null
  const reviewGame = games.find((g) => g.id === reviewGameId) ?? null
  const currentShareGame = activeGame || reviewGame

  const playSound = useCallback((fn: () => void) => {
    if (soundEnabled) fn()
  }, [soundEnabled])

  // --- Game management ---
  const createGame = useCallback(() => {
    const name = newGameName.trim() || `Ván ${games.length + 1}`
    const game: GameSession = { id: Date.now().toString(), name, createdAt: Date.now(), players: [] }
    setGames((prev) => [game, ...prev])
    setActiveGameId(game.id)
    setView('game')
    setNewGameName('')
    setShowNewGameDialog(false)
    setScoreInputs({})
  }, [newGameName, games.length])

  const endGame = () => {
    setGames((prev) => prev.map((g) => g.id === activeGameId ? { ...g, endedAt: Date.now() } : g))
    playSound(playEndGameSound)
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
    setShowEndGameDialog(false)
    setReviewGameId(activeGameId)
    setView('review')
    setActiveGameId(null)
    setScoreInputs({})
  }

  const deleteGame = (gameId: string) => {
    setGames((prev) => prev.filter((g) => g.id !== gameId))
    if (activeGameId === gameId) { setActiveGameId(null); setView('home') }
    if (reviewGameId === gameId) { setReviewGameId(null); setView('home') }
    setShowDeleteGameDialog(null)
  }

  const openGame = (gameId: string) => {
    const game = games.find((g) => g.id === gameId)
    if (!game) return
    if (game.endedAt) { setReviewGameId(gameId); setView('review') }
    else { setActiveGameId(gameId); setView('game'); setScoreInputs({}) }
  }

  // --- Player management ---
  const addPlayer = useCallback(() => {
    const name = newPlayerName.trim()
    if (!name || !activeGameId) return
    setGames((prev) => prev.map((g) => {
      if (g.id !== activeGameId) return g
      if (g.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) return g
      const usedAvatars = g.players.map((p) => p.avatar)
      return { ...g, players: [...g.players, { id: Date.now().toString(), name, avatar: getRandomAvatar(usedAvatars), history: [], total: 0 }] }
    }))
    playSound(playAddPlayerSound)
    setNewPlayerName('')
    playerInputRef.current?.focus()
  }, [newPlayerName, activeGameId, playSound])

  const removePlayer = (playerId: string) => {
    setGames((prev) => prev.map((g) => {
      if (g.id !== activeGameId) return g
      return { ...g, players: g.players.filter((p) => p.id !== playerId) }
    }))
    setScoreInputs((prev) => { const next = { ...prev }; delete next[playerId]; return next })
  }

  const changeAvatar = (playerId: string, avatar: string) => {
    const gameId = activeGameId || reviewGameId
    setGames((prev) => prev.map((g) => {
      if (g.id !== gameId) return g
      return { ...g, players: g.players.map((p) => p.id === playerId ? { ...p, avatar } : p) }
    }))
    setShowAvatarPicker(null)
  }

  // --- Score entry ---
  const handleScoreChange = (playerId: string, value: string) => {
    if (value === '' || value === '-' || /^-?\d*$/.test(value)) {
      setScoreInputs((prev) => ({ ...prev, [playerId]: value }))
    }
  }

  const adjustScore = (playerId: string, delta: number) => {
    setScoreInputs((prev) => {
      const current = parseInt(prev[playerId] || '0', 10) || 0
      return { ...prev, [playerId]: (current + delta).toString() }
    })
  }

  const submitScores = () => {
    if (!activeGame) return
    let hasAny = false
    const anims: Record<string, number> = {}
    const updatedPlayers = activeGame.players.map((p) => {
      const val = parseInt(scoreInputs[p.id] || '0', 10) || 0
      if (val !== 0) { hasAny = true; anims[p.id] = val }
      if (val === 0) return p
      return { ...p, history: [...p.history, val], total: p.total + val }
    })
    if (!hasAny) return
    playSound(playScoreSound)
    setScoreAnimations(anims)
    setTimeout(() => setScoreAnimations({}), 800)
    setGames((prev) => prev.map((g) => g.id === activeGameId ? { ...g, players: updatedPlayers } : g))
    setScoreInputs({})
  }

  const undoLastEntry = (playerId: string) => {
    setGames((prev) => prev.map((g) => {
      if (g.id !== activeGameId) return g
      return { ...g, players: g.players.map((p) => {
        if (p.id !== playerId || p.history.length === 0) return p
        const lastVal = p.history[p.history.length - 1]
        return { ...p, history: p.history.slice(0, -1), total: p.total - lastVal }
      }) }
    }))
    playSound(playUndoSound)
    setShowUndoDialog(null)
  }

  // --- Share ---
  const copyResults = async () => {
    if (!currentShareGame) return
    const sorted = getSorted(currentShareGame.players)
    const text = `🧧 ${currentShareGame.name}\n` +
      sorted.map((p, i) => `${i === 0 ? '👑' : `#${i + 1}`} ${p.avatar} ${p.name}: ${formatMoney(p.total)}`).join('\n')
    await navigator.clipboard.writeText(text)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const copyShareLink = () => {
    if (!currentShareGame) return
    const encoded = encodeGame(currentShareGame)
    const url = `${window.location.origin}${window.location.pathname}?game=${encoded}`
    navigator.clipboard.writeText(url)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const goHome = () => {
    setView('home'); setActiveGameId(null); setReviewGameId(null); setShowStatsSection(false)
  }

  // --- Render ---
  return (
    <div className="app">
      {showConfetti && <Confetti />}

      {/* Header */}
      <div className="header">
        <h1>🧧 Đếm Bài Sâm</h1>
        <div className="header-actions">
          <button
            className={`sound-toggle ${soundEnabled ? 'on' : ''}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
        {view !== 'home' && <button className="back-btn" onClick={goHome}>← Trang chủ</button>}
      </div>

      {/* ===== HOME ===== */}
      {view === 'home' && (
        <>
          <button
            className="btn btn-gold btn-block"
            onClick={() => { setShowNewGameDialog(true); setTimeout(() => gameNameInputRef.current?.focus(), 100) }}
          >
            + Tạo cuộc chơi mới
          </button>
          {games.length === 0 ? (
            <div className="empty-state">Chưa có cuộc chơi nào.<br />Bấm nút trên để bắt đầu!</div>
          ) : (
            <div className="game-list">
              {games.map((g) => (
                <GameCard key={g.id} game={g} onOpen={openGame} onDelete={(id) => setShowDeleteGameDialog(id)} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ===== ACTIVE GAME ===== */}
      {view === 'game' && activeGame && (
        <>
          <div className="game-title-bar">
            <h2>{activeGame.name}</h2>
            <div style={{ display: 'flex', gap: 6 }}>
              {activeGame.players.some((p) => p.history.length > 0) && (
                <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--gold-primary)' }} onClick={() => setShowShareDialog(true)}>📤</button>
              )}
              <button className="btn btn-danger btn-sm" onClick={() => setShowEndGameDialog(true)}>Kết thúc</button>
            </div>
          </div>

          <div className="section">
            <div className="section-title">👥 Người chơi</div>
            <form className="add-player-form" onSubmit={(e) => { e.preventDefault(); addPlayer() }}>
              <input ref={playerInputRef} type="text" placeholder="Tên người chơi..." value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} maxLength={20} />
              <button type="submit" className="btn btn-gold">Thêm</button>
            </form>
          </div>

          {activeGame.players.length > 0 && (
            <ScoreEntry players={activeGame.players} scoreInputs={scoreInputs} onScoreChange={handleScoreChange} onAdjust={adjustScore} onSubmit={submitScores} />
          )}

          {activeGame.players.length > 0 && (
            <div className="section">
              <div className="section-title">📊 Tổng kết</div>
              <PlayerSummary players={activeGame.players} isActive scoreAnimations={scoreAnimations} onAvatarClick={(id) => setShowAvatarPicker(id)} onUndo={(id) => setShowUndoDialog(id)} onRemove={(id) => setShowRemovePlayerDialog(id)} />
            </div>
          )}

          {activeGame.players.some((p) => p.history.length > 1) && (
            <StatsSection players={activeGame.players} expanded={showStatsSection} onToggle={() => setShowStatsSection(!showStatsSection)} />
          )}
        </>
      )}

      {/* ===== REVIEW GAME ===== */}
      {view === 'review' && reviewGame && (
        <>
          <div className="game-title-bar">
            <h2>{reviewGame.name}</h2>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--gold-primary)' }} onClick={() => setShowShareDialog(true)}>📤 Chia sẻ</button>
              <span className="game-card-badge ended">Đã kết thúc</span>
            </div>
          </div>

          <div className="section">
            <div className="section-title">🏆 Bảng xếp hạng</div>
            <div className="scoreboard">
              {getSorted(reviewGame.players).map((p, i) => (
                <div key={p.id} className="scoreboard-row">
                  <div className={`scoreboard-rank ${i === 0 ? 'rank-1' : ''}`}>{i + 1}</div>
                  <span className="scoreboard-avatar">{p.avatar}</span>
                  <div className="scoreboard-name">{p.name}</div>
                  <div className={`scoreboard-total ${p.total > 0 ? 'positive' : p.total < 0 ? 'negative' : 'zero'}`}>
                    {formatMoney(p.total)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <div className="section-title">📋 Chi tiết</div>
            <PlayerSummary players={reviewGame.players} isActive={false} scoreAnimations={{}} />
          </div>

          {reviewGame.players.some((p) => p.history.length > 1) && (
            <StatsSection players={reviewGame.players} expanded={showStatsSection} onToggle={() => setShowStatsSection(!showStatsSection)} />
          )}
        </>
      )}

      {/* ===== DIALOGS ===== */}
      {showNewGameDialog && (
        <NewGameDialog gameNameInputRef={gameNameInputRef} newGameName={newGameName} setNewGameName={setNewGameName} onCreate={createGame} onClose={() => setShowNewGameDialog(false)} />
      )}
      {showEndGameDialog && (
        <ConfirmDialog title="🏁 Kết thúc cuộc chơi?" message="Cuộc chơi sẽ được lưu lại để xem sau." cancelLabel="Tiếp tục chơi" confirmLabel="Kết thúc" onConfirm={endGame} onClose={() => setShowEndGameDialog(false)} />
      )}
      {showDeleteGameDialog && (
        <ConfirmDialog title="🗑 Xóa cuộc chơi?" message="Không thể hoàn tác!" confirmLabel="Xóa" onConfirm={() => deleteGame(showDeleteGameDialog)} onClose={() => setShowDeleteGameDialog(null)} />
      )}
      {showUndoDialog && (
        <ConfirmDialog title="↩ Hoàn tác lần nhập cuối?" message="Sẽ xóa số điểm cuối cùng đã nhập cho người chơi này." confirmLabel="Hoàn tác" onConfirm={() => undoLastEntry(showUndoDialog)} onClose={() => setShowUndoDialog(null)} />
      )}
      {showRemovePlayerDialog && (
        <ConfirmDialog title="✕ Xóa người chơi?" message="Người chơi và toàn bộ lịch sử điểm sẽ bị xóa khỏi cuộc chơi này." confirmLabel="Xóa" onConfirm={() => { removePlayer(showRemovePlayerDialog); setShowRemovePlayerDialog(null) }} onClose={() => setShowRemovePlayerDialog(null)} />
      )}
      {showAvatarPicker && (
        <AvatarPicker onSelect={(emoji) => changeAvatar(showAvatarPicker, emoji)} onClose={() => setShowAvatarPicker(null)} />
      )}
      {showShareDialog && currentShareGame && (
        <ShareDialog game={currentShareGame} copySuccess={copySuccess} onCopyResults={copyResults} onCopyLink={copyShareLink} onClose={() => { setShowShareDialog(false); setCopySuccess(false) }} />
      )}
    </div>
  )
}

export default App
