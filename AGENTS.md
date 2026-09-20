# 만보기 PWA — 프로젝트 메모리

> 이 파일은 opencode가 `F:\newpro`에서 작업할 때 자동으로 로드됩니다.
> 사용자가 "만보기"를 언급하면 이 정보를 먼저 확인하세요.

## 프로젝트 개요
- **위치**: `F:\newpro` (빌드 산출물: `dist/`)
- **목적**: 가속도계 기반 걸음 수 측정 만보기 웹앱 (PWA)
- **생성일**: 2026-09-20 | **상태**: ✅ 배포 완료 (GitHub Pages)
- **배포 URL**: `https://goodkorea72-stack.github.io/mandogi/` (HTTPS → iOS 폰 실테스트 가능)
- **저장소**: `goodkorea72-stack/mandogi` (public, 원격: origin/main)
- **사용자 GitHub**: `goodkorea72-stack` | git 설정: "Kiwoom Stock App" (`kiwoom@example.com`)
- **배포 방식**: GitHub Actions 워크플로우(`.github/workflows/deploy.yml`) — push 시 자동 빌드+배포 (Pages `build_type=workflow`, Vite `base: '/mandogi/'`)

## 기술 스택
React 19 + Vite 7 + TypeScript 5.8 · PWA (manifest + service worker) · localStorage 저장

## 명령어 (작업 루트: F:\newpro)
| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 (`host: true` → LAN 접속 가능) |
| `npm run build` | `tsc` 타입 체크 + vite 빌드 → `dist/` → `scripts/gen-sw.mjs`가 `dist/sw.js` 생성 |
| `npm run preview` | 빌드 결과 미리보기 (4173 포트) |

## 핵심 파일
- `src/lib/stepDetection.ts` — ⭐ 걸음 감지 알고리즘
  - 파라미터: `LOWPASS_ALPHA=0.14`(중력 평활), `STEP_THRESHOLD=1.5`(m/s²), `HYSTERESIS=0.35`, `MIN_STEP_INTERVAL_MS=300`
  - 원리: 저역통과 필터로 중력 제거 → 고역 신호가 문턱값 상회 후 하회 = 1걸음
- `src/lib/storage.ts` — localStorage 키
  - `mandogi_steps`(날짜별 걸음 수 Map), `mandogi_goal`(목표, 기본 10000), `mandogi_stride`(보폭 cm, 기본 70)
- `src/hooks/useStepCounter.ts` — 센서 리스너 + iOS 권한(`DeviceMotionEvent.requestPermission()`) 처리
- `src/components/` — `GoalRing`(목표 링 게이지), `Stats`(거리/칼로리/활동시간), `WeekChart`(7일 차트), `Simulator`(데스크톱 테스트)
- `public/manifest.webmanifest` / `scripts/gen-sw.mjs`(빌드 타임 SW 생성 → `dist/sw.js`, assets 프리캐시 + 캐시 버전 자동 갱신) / `public/icons/`(아이콘 4종: 192, 512, maskable-512, apple-touch)
  - ⚠ `public/sw.js`는 없음 — 수동 생성 금지. SW 로직 수정 시 `scripts/gen-sw.mjs`의 템플릿을 수정할 것

## 수정 시 반드시 유의할 제약
1. **iOS는 HTTPS에서만** 모션 센서 동작 → 폰 테스트는 GitHub Pages/Vercel 등 HTTPS 배포 필요
2. 브라우저는 **화면 켜짐 + 포그라운드**에서만 측정 (백그라운드 걸음 수집 불가)
3. 정확도는 네이티브 앱(하드웨어 센서)보다 낮음 — 사용자에게 한계로 문서화됨
4. 기록은 **기기 로컬 localStorage** → 기기 변경 시 이전 기록 소실
5. 걸음 카운트 이벤트는 분당 최대 ~187보(`MIN_STEP_INTERVAL_MS`)로 제한됨

## 미완료 / 다음 단계
- [ ] 폰 실사용 테스트 (`https://goodkorea72-stack.github.io/mandogi/` — iOS는 권한 요청 팝업 확인)
- [ ] 목표 달성 로컬 알림 / 하루 요약 공유 기능
- [ ] 걸음 감지 정확도 튜닝 (문턱값 자동 보정)

## 세션 히스토리
- **2026-09-20** 구축 완료. 배경: 사용자가 한글 코드로 "깃허브에 올린 내 파일 찾아봐" 입력 → 계정 `goodkorea72-stack`에서 `smartstock1`(키움 주식, React/Vite) 등 저장소 발견 → "만보기 만들기"로 전환되어 신규 구축.
- **2026-09-20** GitHub 배포 완료. `gh` 토큰 무효(HTTP 401) → 사용자 `gh auth login` 재로그인(처음엔 장치 코드 위치로 헤맴 → PAT/웹 로그인 안내) → `gh repo create mandogi --public --push` → Pages 생성(POST build_type=workflow) → Actions 빌드+deploy 성공 → URL 4종 HTTP 200 검증 완료.
- **2026-09-20** `README.md` 작성(사용법·알고리즘·제약·배포 안내) → 커밋 `cf0c665` → push → Actions 자동 재배포 성공.
- **2026-09-21** 미비점 점검 및 수정 (커밋/푸시는 사용자 확인 후):
  - 🔴 `manifest.webmanifest` 아이콘 경로 `./icons/...` 상대경로로 변경 (절대 `/icons/`는 Pages 하위 경로에서 404)
  - 🔴 정적 `public/sw.js`(캐시 v1 고정·캐시 우선·assets precache 누락) 제거 → `scripts/gen-sw.mjs` 도입: 빌드 산출물 전체 프리캐시 + 산출물 해시 기반 캐시 버전(재배포 시 자동 갱신) + stale-while-revalidate
  - 🟡 `index.html`에 `apple-mobile-web-app-title`(만보기) 추가
  - 🟡 `storage.ts` `getGoal`/`getStrideCm` try/catch 안전 처리 (시크릿 모드 대응)
  - 🟡 Simulator 보폭 슬라이더 max 100→120 (storage 허용 범위와 통일)
  - 검증: `npm run build` 성공 + vite preview로 `/mandogi/` 기준 7종 리소스 HTTP 200, manifest JSON/경로, sw precache 확인 완료
- **2026-09-21** 커밋 `32dd626` + push → Actions 자동 배포 성공 (build 28s + deploy 8s) → 운영 URL 재검증: index/manifest/sw.js/아이콘 전부 200, `sw.js`가 새 캐시 버전(`mandogi-cache-03290d3639`)으로 서빙되어 기존 사용자 SW 갱신 트리거 확인.