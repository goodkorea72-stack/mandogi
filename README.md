# 만보기 (Mandogi) — 가속도계 기반 걸음 수 측정 PWA

> 스마트폰의 **가속도계 센서**를 이용해 걸음 수를 측정하고, 일일 목표 달성을 돕는 설치형 웹앱(PWA)입니다.

🔗 **배포 URL**: https://goodkorea72-stack.github.io/mandogi/

---

## ✨ 주요 기능

| 기능 | 설명 |
|---|---|
| 🦶 **실시간 걸음 측정** | 기기 가속도계 기반 걸음 감지 (저역통과 필터로 중력 제거 → 움직임 신호 문턱값 검출) |
| 🎯 **일일 목표** | 3천~2만보 중 선택 (기본 1만보), 링 게이지로 달성률 표시, 달성 시 🎉 |
| 📊 **통계** | 오늘 거리(km), 칼로리(kcal), 활동 시간(분) 자동 계산 |
| 📅 **최근 7일 차트** | 요일별 걸음 수 비교 (SVG 바 차트) |
| 💾 **기록 저장** | 날짜별 걸음 수·목표·보폭을 `localStorage`에 자동 저장 |
| 📲 **PWA 설치** | 홈 화면에 앱처럼 설치 가능 (manifest + service worker, 오프라인 캐싱) |
| 🖥️ **데스크톱 시뮬레이터** | 센서가 없는 PC에서 걸음 수 추가/초기화로 전체 기능 테스트 |

## 📱 사용법

### 모바일 (권장)

1. **HTTPS 환경에서 접속** — iOS는 HTTPS에서만 모션 센서가 동작합니다 (아래 배포 URL 사용).
2. iOS Safari는 첫 터치 시 **"모션 및 방향 접근" 권한 팝업** → **허용**.
3. **"걸음 감지 시작하기"** 버튼 → 허용하면 실시간 측정 시작.
4. 브라우저 메뉴 → **홈 화면에 추가** 하면 설치형 앱처럼 사용 가능.
5. 측정은 **화면이 켜진 상태(포그라운드)에서만** 동작합니다.

### 데스크톱

`테스트 & 설정` 카드의 `+100보` / `+500보` / `+1,000보` / `+5,000보` 버튼으로 걸음 수를 시뮬레이션할 수 있어 모든 기능을 테스트할 수 있습니다.

## 🛠 기술 스택

- **React 19** + **TypeScript 5.8** + **Vite 7**
- PWA: `manifest.webmanifest` + **빌드 시 자동 생성되는 `dist/sw.js`** (전체 assets 프리캐시 + stale-while-revalidate, 배포마다 캐시 버전 자동 갱신)
- 상태 저장: `localStorage` (서버/DB 없음 — 완전 로컬, 프라이버시 보장)

## 📁 프로젝트 구조

```
src/
├── lib/
│   ├── stepDetection.ts   # ⭐ 걸음 감지 알고리즘 (StepDetector)
│   └── storage.ts         # localStorage 저장 (걸음/목표/보폭)
├── hooks/
│   └── useStepCounter.ts  # 센서 리스너 + iOS 권한(requestPermission) 처리
├── components/
│   ├── GoalRing.tsx       # 목표 링 게이지 (SVG)
│   ├── Stats.tsx          # 거리/칼로리/활동시간
│   ├── WeekChart.tsx      # 최근 7일 차트 (SVG)
│   └── Simulator.tsx      # 데스크톱 테스트/설정 패널
├── App.tsx
└── main.tsx               # service worker 등록
public/
├── manifest.webmanifest
└── icons/                 # PWA 아이콘 (192/512/maskable/apple-touch)
scripts/
└── gen-sw.mjs             # 빌드 후 dist/sw.js 생성 (프리캐시 목록·캐시 버전 자동 산출)
```

## ⚙️ 걸음 감지 알고리즘

`src/lib/stepDetection.ts` — 소스에 상세 주석 포함:

1. **저역통과 필터**(지수평활, `ALPHA=0.14`)로 중력(≈9.8 m/s²) 성분 추정
2. 원본 신호에서 빼면 **"움직임만 남은 고역 신호"**가 됨
3. 고역 신호 크기가 문턱값(`1.5 m/s²`)을 **넘었다가** 히스테리시스(`0.35`) 아래로 **떨어질 때** = 1걸음
4. 최소 걸음 간격(`300ms`, 분당 약 187보 상한)으로 중복 카운트 방지

## ⚠️ 알려진 제약

- **iOS는 HTTPS에서만** 모션 센서 동작 → 폰 테스트는 반드시 HTTPS 배포 필요 (GitHub Pages/Vercel)
- 브라우저는 **화면 켜짐 + 포그라운드**에서만 측정 — 백그라운드 걸음 수집 불가
- 정확도는 네이티브 앱(하드웨어 전용 센서 칩)보다 **낮을 수 있음** — 폼팩터·주머니 위치에 따라 오차 발생
- 기록은 **기기 로컬(localStorage)** 저장 — 기기 변경/브라우저 데이터 삭제 시 소실

## 🚀 로컬 개발

```bash
npm install        # 의존성 설치
npm run dev        # 개발 서버 (host: true → 핸드폰과 같은 LAN에서 접속 가능)
npm run build      # tsc 타입 체크 + 프로덕션 빌드 → dist/
npm run preview    # 빌드 결과 미리보기 (http://localhost:4173)
```

## 🚢 배포 (GitHub Pages)

`main` 브랜치에 **push하면 GitHub Actions가 자동으로 빌드 + 배포**합니다 (`.github/workflows/deploy.yml`).

```bash
git add -A
git commit -m "아무 메시지"
git push
```

> Vite `base: '/mandogi/'`로 설정되어 `https://goodkorea72-stack.github.io/mandogi/` 하위 경로에서 정상 동작합니다.

## 🗂 저장소 / 라이선스

- 저장소: https://github.com/goodkorea72-stack/mandogi
- 개인 학습 목적 프로젝트입니다.