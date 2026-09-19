import type { HistoryItem } from '../lib/storage'

interface Props {
  history: HistoryItem[]
}

const W = 352
const H = 200
const BAR_W = 30
const GAP = 47
const BAR_BOTTOM = 168
const MAX_H = 124

export function WeekChart({ history }: Props) {
  const max = Math.max(1, ...history.map((h) => h.steps))

  return (
    <section className="card">
      <h2 className="card-title">최근 7일</h2>
      <svg viewBox={`0 0 ${W} ${H}`} className="week-chart" role="img" aria-label="최근 7일 걸음 수 차트">
        {history.map((h, i) => {
          const x = 9 + i * GAP
          const bh = h.steps === 0 ? 3 : Math.max(8, (h.steps / max) * MAX_H)
          const y = BAR_BOTTOM - bh
          const isToday = i === history.length - 1
          return (
            <g key={h.date}>
              {h.steps > 0 && (
                <text x={x + BAR_W / 2} y={y - 7} textAnchor="middle" className="chart-num">
                  {h.steps >= 10000 ? `${(h.steps / 10000).toFixed(1)}만` : h.steps.toLocaleString()}
                </text>
              )}
              <rect
                x={x}
                y={y}
                width={BAR_W}
                height={bh}
                rx="8"
                className={`bar${isToday ? ' today' : ''}${h.steps === 0 ? ' empty' : ''}`}
              >
                <title>{`${h.label}요일: ${h.steps.toLocaleString()}보`}</title>
              </rect>
              <text x={x + BAR_W / 2} y={H - 12} textAnchor="middle" className={`chart-label${isToday ? ' today' : ''}`}>
                {h.label}
              </text>
            </g>
          )
        })}
      </svg>
    </section>
  )
}