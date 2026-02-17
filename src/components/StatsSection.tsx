import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { Player } from '../types'
import { CHART_COLORS } from '../types'
import { formatMoney, getSorted, buildChartData } from '../utils'

interface Props {
  players: Player[]
  expanded: boolean
  onToggle: () => void
}

export default function StatsSection({ players, expanded, onToggle }: Props) {
  const chartData = buildChartData(players)
  if (chartData.length <= 1) return null

  return (
    <div className="section">
      <div className="section-title" style={{ justifyContent: 'space-between' }}>
        <span>📈 Thống kê</span>
        <button
          className="btn btn-sm"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}
          onClick={onToggle}
        >
          {expanded ? 'Thu gọn' : 'Mở rộng'}
        </button>
      </div>
      {expanded && (
        <>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="x" tick={{ fill: 'rgba(255,248,220,0.5)', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,215,0,0.15)' }} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,248,220,0.5)', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,215,0,0.15)' }} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{
                    background: '#2d1010',
                    border: '1px solid rgba(255,215,0,0.2)',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: '#fff8dc',
                  }}
                />
                {players.map((p, idx) => (
                  <Line
                    key={p.id}
                    type="monotone"
                    dataKey={p.name}
                    stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="stats-detail">
            {getSorted(players).map((p) => {
              if (p.history.length === 0) return null
              const wins = p.history.filter((v) => v > 0).length
              const losses = p.history.filter((v) => v < 0).length
              const best = Math.max(...p.history)
              const worst = Math.min(...p.history)
              return (
                <div key={p.id} className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-avatar">{p.avatar}</span>
                    <span className="stat-card-name">{p.name}</span>
                    <span
                      className="stat-card-dot"
                      style={{ background: CHART_COLORS[players.indexOf(p) % CHART_COLORS.length] }}
                    />
                  </div>
                  <div className="stat-card-grid">
                    <div className="stat-item">
                      <span className="stat-label">Thắng/Thua</span>
                      <span className="stat-value">
                        <span className="positive">{wins}</span>/<span className="negative">{losses}</span>
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">% Thắng</span>
                      <span className="stat-value">{Math.round((wins / p.history.length) * 100)}%</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Tốt nhất</span>
                      <span className="stat-value positive">{formatMoney(best)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Tệ nhất</span>
                      <span className="stat-value negative">{formatMoney(worst)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
