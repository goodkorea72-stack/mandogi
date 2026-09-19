import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages 하위 경로(사용자명.github.io/mandogi/) 배포용
  base: '/mandogi/',
  server: {
    host: true, // LAN에서 스마트폰으로 접속해 테스트할 수 있음
  },
})