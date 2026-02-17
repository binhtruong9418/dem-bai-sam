import type { RefObject } from 'react'
import type { GameSession } from '../types'
import { AVATARS } from '../types'
import { encodeGame } from '../utils'
import { QRCodeSVG } from 'qrcode.react'

interface DialogProps {
  onClose: () => void
  children: React.ReactNode
}

function DialogOverlay({ onClose, children }: DialogProps) {
  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

// --- New Game ---
interface NewGameDialogProps {
  gameNameInputRef: RefObject<HTMLInputElement | null>
  newGameName: string
  setNewGameName: (v: string) => void
  onCreate: () => void
  onClose: () => void
}

export function NewGameDialog({ gameNameInputRef, newGameName, setNewGameName, onCreate, onClose }: NewGameDialogProps) {
  return (
    <DialogOverlay onClose={onClose}>
      <h3>🎲 Tạo cuộc chơi mới</h3>
      <form onSubmit={(e) => { e.preventDefault(); onCreate() }}>
        <input
          ref={gameNameInputRef}
          className="dialog-input"
          type="text"
          placeholder="Tên cuộc chơi (tùy chọn)..."
          value={newGameName}
          onChange={(e) => setNewGameName(e.target.value)}
          maxLength={30}
        />
        <div className="dialog-actions">
          <button type="button" className="btn btn-danger" onClick={onClose}>Hủy</button>
          <button type="submit" className="btn btn-gold">Tạo</button>
        </div>
      </form>
    </DialogOverlay>
  )
}

// --- Confirm Dialog ---
interface ConfirmDialogProps {
  title: string
  message: string
  cancelLabel?: string
  confirmLabel: string
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({ title, message, cancelLabel = 'Hủy', confirmLabel, onConfirm, onClose }: ConfirmDialogProps) {
  return (
    <DialogOverlay onClose={onClose}>
      <h3>{title}</h3>
      <p>{message}</p>
      <div className="dialog-actions">
        <button className="btn btn-gold" onClick={onClose}>{cancelLabel}</button>
        <button className="btn btn-danger" onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </DialogOverlay>
  )
}

// --- Avatar Picker ---
interface AvatarPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

export function AvatarPicker({ onSelect, onClose }: AvatarPickerProps) {
  return (
    <DialogOverlay onClose={onClose}>
      <h3>Chọn avatar</h3>
      <div className="avatar-grid">
        {AVATARS.map((emoji) => (
          <button key={emoji} className="avatar-option" onClick={() => onSelect(emoji)}>
            {emoji}
          </button>
        ))}
      </div>
    </DialogOverlay>
  )
}

// --- Share Dialog ---
interface ShareDialogProps {
  game: GameSession
  copySuccess: boolean
  onCopyResults: () => void
  onCopyLink: () => void
  onClose: () => void
}

export function ShareDialog({ game, copySuccess, onCopyResults, onCopyLink, onClose }: ShareDialogProps) {
  const encoded = encodeGame(game)
  const shareUrl = `${window.location.origin}${window.location.pathname}?game=${encoded}`

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog share-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>📤 Chia sẻ kết quả</h3>
        <div className="qr-container">
          <QRCodeSVG value={shareUrl} size={180} bgColor="transparent" fgColor="#ffd700" level="L" />
        </div>
        <p style={{ fontSize: 11, marginBottom: 12, opacity: 0.6 }}>Quét QR hoặc chia sẻ link</p>
        <div className="dialog-actions" style={{ flexDirection: 'column', gap: 8 }}>
          <button className="btn btn-gold" style={{ width: '100%' }} onClick={onCopyResults}>
            {copySuccess ? '✓ Đã copy!' : '📋 Copy kết quả'}
          </button>
          <button
            className="btn"
            style={{ width: '100%', background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
            onClick={onCopyLink}
          >
            🔗 Copy link
          </button>
          <button className="btn btn-danger" style={{ width: '100%' }} onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
