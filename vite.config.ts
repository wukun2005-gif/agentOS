import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 相对路径构建，支持离线打开和 GitHub Pages 子路径部署
  base: './',
})
