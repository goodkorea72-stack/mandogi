import { useEffect, useState } from 'react'
import { GoalRing } from './components/GoalRing'
import { Stats } from './components/Stats'
import { WeekChart } from './components/WeekChart'
import { Simulator } from './components/Simulator'
import { useStepCounter } from './hooks/useStepCounter'
import { getGoal, getHistory, getStrideCm, setGoal, setStrideCm } from './lib/storage'

export default function App() {
  const { today, status, sensorLive, start, simulateSteps, reset } = useStepCounter()
  const [goal, setGoalState] = useState(getGoal)
  const [stride, setStrideState] = useState(getStrideCm)
  const [history, setHistory] = useState(() => getHistory(7))

  useEffect(() => {
    setHistory(getHistory(7))
  }, [today])

  const changeGoal = (g: number) => {
    setGoal(g)
    setGoalState(g)
  }
  const changeStride = (s: number) => {
    setStrideCm(s)
    setStrideState(s)
  }

  const done = today >= goal
  const needStart = status === 'idle' || status === 'requesting' || status === 'denied'

  return (
    <div className="app">
      <header className="app-header">
        <h1>만보기</h1>
        <p className="sub">오늘도 건강하게 한 걸음씩 🦶</p>
      </header>

      {needStart && (
        <button className="start-btn" onClick={start} disabled={status === 'requesting'}>
          {status === 'requesting'
            ? '권한 확인 중…'
            : status === 'denied'
              ? '권한이 거부됐어요 · 다시 요청'
              : '걸음 감지 시작하기'}
        </button>
      )}
      {status === 'denied' && (
        <p className="hint center">센서 권한을 허용해야 걸음 수가 세져요. 브라우저 설정(방문 사이트 데이터)→모션 센서를 허용해 주세요.</p>
      )}

      <GoalRing steps={today} goal={goal} live={sensorLive} done={done} />
      <Stats steps={today} strideCm={stride} />
      <WeekChart history={history} />

      <Simulator
        status={status}
        sensorLive={sensorLive}
        goal={goal}
        stride={stride}
        onGoalChange={changeGoal}
        onStrideChange={changeStride}
        onSimulate={simulateSteps}
        onReset={reset}
      />

      <footer className="foot">
        걸음 감지는 가속도계 기반이며, 브라우저 제약상 화면이 켜진 상태에서만 측정됩니다.
        기록은 이 기기에만 저장됩니다 (localStorage).
      </footer>
    </div>
  )
}