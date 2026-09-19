import type { MotionStatus } from '../hooks/useStepCounter'

interface Props {
  status: MotionStatus
  sensorLive: boolean
  goal: number
  stride: number
  onGoalChange: (g: number) => void
  onStrideChange: (s: number) => void
  onSimulate: (n: number) => void
  onReset: () => void
}

const GOALS = [3000, 5000, 10000, 15000, 20000]

export function Simulator({
  status,
  sensorLive,
  goal,
  stride,
  onGoalChange,
  onStrideChange,
  onSimulate,
  onReset,
}: Props) {
  const desktop = status === 'unsupported' || (!sensorLive && status === 'granted')

  return (
    <section className="card simulator">
      <h2 className="card-title">테스트 &amp; 설정</h2>

      <p className={`sensor-status ${sensorLive ? 'ok' : ''}`}>
        {sensorLive ? '센서 연결됨 ✅ 실제 걸음이 감지되고 있어요' : desktop ? '센서 없음 · 아래 버튼으로 시뮬레이션' : '센서 대기 중… 폰을 살짝 흔들어 보세요'}
      </p>

      <div className="btn-row">
        <button className="btn" onClick={() => onSimulate(100)}>+100보</button>
        <button className="btn" onClick={() => onSimulate(500)}>+500보</button>
        <button className="btn" onClick={() => onSimulate(1000)}>+1,000보</button>
        <button className="btn" onClick={() => onSimulate(5000)}>+5,000보</button>
      </div>

      <div className="btn-row reset-row">
        <button className="btn danger" onClick={onReset}>오늘 기록 초기화</button>
      </div>

      <div className="setting">
        <div className="setting-head">
          <span>일일 목표</span>
          <strong>{goal.toLocaleString()}보</strong>
        </div>
        <div className="chip-row">
          {GOALS.map((g) => (
            <button key={g} className={`chip${g === goal ? ' active' : ''}`} onClick={() => onGoalChange(g)}>
              {g >= 10000 ? `${g / 10000}만보` : `${(g / 1000).toFixed(0)}천보`}
            </button>
          ))}
        </div>
      </div>

      <div className="setting">
        <div className="setting-head">
          <span>보폭</span>
          <strong>{stride}cm</strong>
        </div>
        <input
          type="range"
          min={40}
          max={100}
          step={2}
          value={stride}
          onChange={(e) => onStrideChange(Number(e.target.value))}
          aria-label="보폭 설정"
        />
        <div className="range-scale"><span>40</span><span>100</span></div>
      </div>

      <p className="hint">
        💡 실제 폰에서 테스트하려면 <b>HTTPS</b>가 필요해요 (iOS 보안 정책). GitHub Pages나 Vercel 등으로 배포하면
        가장 편하게 쓸 수 있어요.
      </p>
    </section>
  )
}