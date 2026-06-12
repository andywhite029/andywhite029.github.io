import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 图片压缩由 scripts/compress-images.js 在 build 前统一处理，
// 这里不再引入 vite-plugin-imagemin，避免重复压缩和 Windows 构建依赖问题。

export default defineConfig({
  base: process.env.BASE_URL || '/',
  plugins: [react()],
})
