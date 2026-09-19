interface Props {
  steps: number
  strideCm: number
}

export function Stats({ steps, strideCm }: Props) {
  const km = (steps * strideCm) / 100000
  const kcal = steps * 0.04
  const min = steps / 100

  return (
    <section className="stats-grid" aria-label="오늘 통계">
      <div className="stat-card">
        <div className="stat-val">
          {km.toFixed(km >= 10 ? 1 : 2)}
          <span className="stat-unit">km</span>
        </div>
        <div className="stat-label">거리</div>
      </div>
      <div className="stat-card">
        <div className="stat-val">
          {Math.round(kcal)}
          <span className="stat-unit">kcal</span>
        </div>
        <div className="stat-label">칼로리</div>
      </div>
      <div className="stat-card">
        <div className="stat-val">
          {Math.round(min)}
          <span className="stat-unit">분</span>
        </div>
        <div className="stat-label">활동 시간</div>
      </div>
    </section>
  )
}