import { useCallback, useEffect, useRef, useState } from 'react'
import { StepDetector } from '../lib/stepDetection'
import { addSteps, getSteps, resetToday, todayKey } from '../lib/storage'

export type MotionStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported'

/** iOS 13+ 는 사용자 제스처 안에서 requestPermission() 호출 필요 */
const DME =
  typeof window !== 'undefined'
    ? (window.DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> } | undefined)
    : undefined

function supportsMotion(): boolean {
  return typeof window !== 'undefined' && 'DeviceMotionEvent' in window
}

/** iOS처럼 권한 요청이 필요한 환경인가? */
const needGesture = supportsMotion() && DME !== undefined && typeof DME.requestPermission === 'function'

export function useStepCounter() {
  const [today, setToday] = useState(() => getSteps())
  const [status, setStatus] = useState<MotionStatus>(() =>
    supportsMotion() ? (needGesture ? 'idle' : 'granted') : 'unsupported'
  )
  const statusRef = useRef(status)
  statusRef.current = status

  const [sensorLive, setSensorLive] = useState(false)
  const liveRef = useRef(false)
  const detectorRef = useRef<StepDetector | null>(null)
  if (detectorRef.current === null) detectorRef.current = new StepDetector()

  /** 한 걸음 감지 → 오늘 기록 +1 */
  const onStepInner = useCallback(() => {
    addSteps(1, todayKey())
    setToday(getSteps())
  }, [])

  useEffect(() => {
    detectorRef.current!.onStep(onStepInner)
  }, [onStepInner])

  const attach = useCallback(() => {
    const onMotion = (e: DeviceMotionEvent) => {
      const raw = e.accelerationIncludingGravity ?? e.acceleration
      if (!raw) return
      if (!liveRef.current) {
        liveRef.current = true
        setSensorLive(true)
      }
      detectorRef.current!.feed({
        x: raw.x ?? 0,
        y: raw.y ?? 0,
        z: raw.z ?? 0,
        timestamp: performance.now(),
      })
    }
    window.addEventListener('devicemotion', onMotion)
    return () => window.removeEventListener('devicemotion', onMotion)
  }, [])

  /** Android·데스크톱은 권한 없이 바로 리스너 부착 */
  const [listening, setListening] = useState(() => supportsMotion() && !needGesture)

  useEffect(() => {
    if (!listening) return
    return attach()
  }, [listening, attach])

  /** iOS용: 사용자 터치 안에서 권한 요청 후 시작 */
  const start = useCallback(async () => {
    if (statusRef.current === 'granted' || statusRef.current === 'requesting') return
    if (!supportsMotion()) {
      statusRef.current = 'unsupported'
      setStatus('unsupported')
      return
    }
    statusRef.current = 'requesting'
    setStatus('requesting')
    let ok = true
    if (DME && typeof DME.requestPermission === 'function') {
      try {
        ok = (await DME.requestPermission()) === 'granted'
      } catch {
        ok = false
      }
    }
    if (ok) {
      statusRef.current = 'granted'
      setStatus('granted')
      setListening(true)
    } else {
      statusRef.current = 'denied'
      setStatus('denied')
    }
  }, [])

  /** 데스크톱 테스트용: 걸음 수 직접 추가 */
  const simulateSteps = useCallback((n: number) => {
    addSteps(n, todayKey())
    setToday(getSteps())
  }, [])

  const reset = useCallback(() => {
    resetToday()
    setSensorLive(false)
    liveRef.current = false
    setToday(0)
  }, [])

  return { today, status, sensorLive, start, simulateSteps, reset }
}