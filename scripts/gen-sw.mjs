/* ── 빌드 타임 서비스워커 생성기 ──────────────────────────────
 * vite build 완료(dist/) 후 실행한다.
 * - dist 내 실제 파일 목록을 precache에 모두 포함 → 완전한 오프라인 지원
 * - 캐시 이름에 빌드 산출물 해시를 넣어 "재배포 시 캐시 자동 갱신"
 * - fetch는 stale-while-revalidate: 캐시 즉시 반환 + 백그라운드 갱신,
 *   네트워크 실패 시 캐시로 폴백 (오프라인 안정성 + 업데이트 반영)
 */
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST = fileURLToPath(new URL('../dist/', import.meta.url))

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    const rel = relative(DIST, p).split(sep).join('/')
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else out.push('./' + rel)
  }
  return out
}

const files = walk(DIST)
// index.html은 어떤 경우든 첫 방문에 필요하므로 맨 앞
const precache = ['./', './index.html', ...files.filter((f) => f !== './index.html')]

// 전체 파일 목록 + 내용 해시 → 산출물이 바뀔 때마다 캐시 버전도 바뀜
const hash = createHash('sha1')
for (const raw of precache) {
  hash.update(raw)
  try {
    hash.update(readFileSync(join(DIST, raw.slice(2).split('/').join(sep))))
  } catch {
    /* 파일 누락 시 무시 (프리캐시 실패는 install에서 드러남) */
  }
}
const cacheName = `mandogi-cache-${hash.digest('hex').slice(0, 10)}`

const sw = `/* 만보기 서비스워커 — ${new Date().toISOString()} 빌드 시 자동 생성 (수동 수정 금지) */
const CACHE = '${cacheName}'
const PRECACHE = ${JSON.stringify(precache, null, 2)}

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

/* stale-while-revalidate: 캐시 있으면 즉시 응답 후 백그라운드 갱신.
 * 없으면 네트워크 → 성공 시 캐시 저장. 실패 시 캐시 폴백. */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)
  if (url.origin !== location.origin) return

  e.respondWith(
    caches.match(e.request).then((cached) => {
      const network = fetch(e.request)
        .then((res) => {
          if (res.ok || res.type === 'opaque') {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(e.request, copy))
          }
          return res
        })
        .catch(() => cached)
      return cached || network
    })
  )
})
`

writeFileSync(join(DIST, 'sw.js'), sw)
console.log(`✓ dist/sw.js 생성 (프리캐시 ${precache.length}개 · ${cacheName})`)