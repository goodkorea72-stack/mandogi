/* ── 가속도계 기반 걸음 감지 알고리즘 ────────────────────────
 *
 * 1) 저역 통과 필터(지수평활)로 중력(약 9.8 m/s²) 성분을 추정
 * 2) 원본에서 빼면 "움직임"만 남은 고역 통과 신호가 됨
 * 3) 고역 신호 크기가 문턱값을 넘었다가 아래로 떨어질 때 = 한 걸음
 * 4) 최소 걸음 간격(분당 최대 걸음수)으로 중복 카운트 방지
 */

export interface AccelSample {
  x: number
  y: number
  z: number
  timestamp: number
}

/** 중력 평활 계수 (작을수록 느리게 추정) */
const LOWPASS_ALPHA = 0.14
/** 고역 신호 걸음 문턱값 (m/s²) — 높을수록 둔감 */
const STEP_THRESHOLD = 1.5
/** 문턱값 히스테리시스 — 다시 내려갈 기준 */
const HYSTERESIS = 0.35
/** 최소 걸음 간격 ms (약 분당 187보 상한) */
const MIN_STEP_INTERVAL_MS = 300

export class StepDetector {
  private g = { x: 0, y: 0, z: 0 }
  private calibrated = false
  private aboveThreshold = false
  private lastStepAt = 0
  private cb: () => void = () => {}

  onStep(cb: () => void) {
    this.cb = cb
  }

  feed(s: AccelSample) {
    if (!this.calibrated) {
      this.g = { x: s.x, y: s.y, z: s.z }
      this.calibrated = true
      return
    }

    // 중력 추정 갱신
    this.g.x += LOWPASS_ALPHA * (s.x - this.g.x)
    this.g.y += LOWPASS_ALPHA * (s.y - this.g.y)
    this.g.z += LOWPASS_ALPHA * (s.z - this.g.z)

    // 움직임(고역) 신호 크기
    const hx = s.x - this.g.x
    const hy = s.y - this.g.y
    const hz = s.z - this.g.z
    const mag = Math.sqrt(hx * hx + hy * hy + hz * hz)

    if (!this.aboveThreshold && mag > STEP_THRESHOLD) {
      this.aboveThreshold = true
    } else if (this.aboveThreshold && mag < STEP_THRESHOLD - HYSTERESIS) {
      this.aboveThreshold = false
      const elapsed = s.timestamp - this.lastStepAt
      if (elapsed >= MIN_STEP_INTERVAL_MS) {
        this.lastStepAt = s.timestamp
        this.cb()
      }
    }
  }
}