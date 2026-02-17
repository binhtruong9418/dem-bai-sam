const COLORS = ['#ffd700', '#ff6b6b', '#4caf50', '#ff8a65', '#ba68c8', '#64b5f6']

export default function Confetti() {
  return (
    <div className="confetti-overlay">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${1.5 + Math.random() * 2}s`,
            background: COLORS[i % COLORS.length],
          }}
        />
      ))}
    </div>
  )
}
