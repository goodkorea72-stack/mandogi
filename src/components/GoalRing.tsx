interface Props {
  steps: number
  goal: number
  live: boolean
  done: boolean
}

const R = 120
const C = 2 * Math.PI * R

export function GoalRing({ steps, goal, live, done }: Props) {
  const ratio = goal > 0 ? Math.min(steps / goal, 1) : 0
  const dash = C * ratio
  const pct = Math.round((goal > 0 ? steps / goal : 0) * 100)

  return (
    <section className={`card goal-card ${done ? 'is-done' : ''}`}>
      <div className="goal-ring-wrap">
        <svg viewBox="0 0 280 280" className="goal-ring" role="img" aria-label={`오늘 걸음 수 ${steps.toLocaleString()}보, 목표 대비 ${pct}%`}>
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#5eead4" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          <circle cx="140" cy="140" r={R} className="ring-bg" />
          <circle
            cx="140"
            cy="140"
            r={R}
            className="ring-fg"
            strokeDasharray={`${dash} ${C - dash}`}
            transform="rotate(-90 140 140)"
          />
        </svg>
        <div className="goal-center">
          <div className={`live-dot ${live && !done ? 'on' : ''}`} title={live ? '센서 연결됨' : '센서 대기 중'} />
          <div className="goal-steps">{steps.toLocaleString()}</div>
          <div className="goal-unit">걸음</div>
          <div className="goal-pct">{done ? '🎉 목표 달성!' : `목표의 ${pct}%`}</div>
        </div>
      </div>
    </section>
  )
}