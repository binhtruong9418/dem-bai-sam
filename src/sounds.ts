// Web Audio API sound effects - no external files needed
let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

// --- Background music (pentatonic Tết melody) ---
let bgGain: GainNode | null = null
let bgPlaying = false
let bgTimeout: ReturnType<typeof setTimeout> | null = null

// Pentatonic scale notes for a cheerful Tết feel
const BG_MELODY = [
  // phrase 1
  523, 587, 659, 784, 659, 587, 523, 0,
  // phrase 2
  784, 659, 587, 523, 587, 659, 784, 0,
  // phrase 3
  523, 659, 784, 880, 784, 659, 523, 0,
  // phrase 4
  880, 784, 659, 523, 587, 523, 440, 0,
]
const BG_NOTE_DURATION = 0.28
const BG_VOLUME = 0.04

function playBgLoop() {
  if (!bgPlaying) return
  try {
    const ctx = getCtx()
    if (!bgGain) {
      bgGain = ctx.createGain()
      bgGain.gain.setValueAtTime(BG_VOLUME, ctx.currentTime)
      bgGain.connect(ctx.destination)
    }

    BG_MELODY.forEach((freq, i) => {
      if (freq === 0) return // rest
      const osc = ctx.createOscillator()
      const noteGain = ctx.createGain()
      osc.connect(noteGain)
      noteGain.connect(bgGain!)
      osc.type = 'sine'
      const startTime = ctx.currentTime + i * BG_NOTE_DURATION
      osc.frequency.setValueAtTime(freq, startTime)
      noteGain.gain.setValueAtTime(1, startTime)
      noteGain.gain.exponentialRampToValueAtTime(0.01, startTime + BG_NOTE_DURATION * 0.9)
      osc.start(startTime)
      osc.stop(startTime + BG_NOTE_DURATION)
    })

    // Schedule next loop
    const loopDuration = BG_MELODY.length * BG_NOTE_DURATION * 1000
    bgTimeout = setTimeout(() => playBgLoop(), loopDuration)
  } catch { /* ignore */ }
}

export function startBgMusic() {
  if (bgPlaying) return
  bgPlaying = true
  playBgLoop()
}

export function stopBgMusic() {
  bgPlaying = false
  if (bgTimeout) { clearTimeout(bgTimeout); bgTimeout = null }
  bgGain = null
}

export function playScoreSound() {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08)
    osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.2)
  } catch { /* ignore audio errors */ }
}

export function playAddPlayerSound() {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(500, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.12)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.15)
  } catch { /* ignore */ }
}

export function playEndGameSound() {
  try {
    const ctx = getCtx()
    const notes = [523, 659, 784, 1047] // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12)
      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.12)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.3)
      osc.start(ctx.currentTime + i * 0.12)
      osc.stop(ctx.currentTime + i * 0.12 + 0.3)
    })
  } catch { /* ignore */ }
}

export function playUndoSound() {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.15)
  } catch { /* ignore */ }
}
